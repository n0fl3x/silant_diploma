import json

from rest_framework import status, generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

from django.http import Http404, JsonResponse
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate

from django_filters.rest_framework import DjangoFilterBackend

from core.models import (
    Machine,
    Maintenance,
    Claim,
    DictionaryEntry,
)
from .serializers import (
    ClaimCreateSerializer,
    ClaimListSerializer,
    ClaimDetailSerializer,
    MachineCreateSerializer,
    MachineEditSerializer,
    MachinePublicSerializer,
    MachineFullSerializer,
    MachineListSerializer,
    MachineSerializer,
    DictionaryEntryListSerializer,
    DictionaryEntryDetailSerializer,
    DictionaryEntrySerializer,
    MachineUpdateSerializer,
    MaintenanceCreateSerializer,
    MaintenanceSerializer,
    MaintenanceDetailSerializer,
    MaintenanceUpdateSerializer,
)
from .filters import (
    MachineFilter,
    MaintenanceFilter,
    ClaimFilter,
)
from .permissions import (
    IsManagerOrSuperadmin,
    CanEditMachines,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return Response(
                data={"error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )

        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                data={"error": "Неверные учётные данные"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        tokens = serializer.validated_data
        access_token = tokens['access']
        refresh_token = tokens['refresh']

        user_group = user.user_type if user.group else None

        response_data = {
            "success": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_group": user_group,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        }

        resp = Response(data=response_data, status=status.HTTP_200_OK)

        resp.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
        )
        resp.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
        )

        return resp


class CustomRefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                data={"error": "Refresh token is missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        temp_request = request
        temp_request.data = {'refresh': refresh_token}

        try:
            response = super().post(temp_request, *args, **kwargs)
            tokens = response.data
            access_token = tokens["access"]

            new_resp = Response(
                data={"refreshed": True},
                status=status.HTTP_200_OK
            )
            new_resp.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                path="/",
            )
            return new_resp
        except TokenError as e:
            error_resp = Response(
                data={"error": "Token refresh error."},
                status=status.HTTP_401_UNAUTHORIZED
            )
            error_resp.delete_cookie("access_token")
            error_resp.delete_cookie("refresh_token")
            return error_resp


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group_name = user.group.name if user.group else None
        user_type_mapping = {
            "Клиент": "client",
            "Сервисная организация": "service_company",
            "Менеджер": "manager",
            "Суперадмин": "superadmin"
        }
        user_type = user_type_mapping.get(group_name, "unknown")

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email or "empty",
            'user_description': user.user_description or "empty",
            'group_name': user_type,
            'permissions': list(user.get_all_permissions())
        })
    

@api_view(http_method_names=["POST"])
@permission_classes([IsAuthenticated])
def logout(
    request,
):
    try:
        resp = Response(
            data={
                "success": True,
                "message": "Успешный выход из аккаунта.",
                "redirect": True,
            },
            status=status.HTTP_200_OK,
        )
        resp.delete_cookie(
            key="access_token",
            path="/",
            samesite="Lax",
        )
        resp.delete_cookie(
            key="refresh_token",
            path="/",
            samesite="Lax",
        )

        return resp
    except Exception as e:
        return Response(
            data={
                "error": f"Ошибка выхода из аккаунта: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(
    http_method_names=[
        "POST",
    ],
)
@permission_classes(
    permission_classes=[
        IsAuthenticated,
    ],
)
def is_authenticated(
    request,
):
    user = request.user
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email or "empty",
        "user_description": user.user_description or "empty",
    }

    return Response(
        data={
            "authenticated": True,
            "user": user_data,
        },
        status=status.HTTP_200_OK,
    )
    

class MachineSearchAPIView(APIView):
    def post(
        self,
        request,
    ):
        factory_number = request.data.get("factory_number")

        if not factory_number:
            return Response(
                data={
                    "success": False,
                    "error": "Заводской номер машины обязателен.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            machine = Machine.objects.select_related(
                "model_tech",
                "engine_model",
                "transmission_model",
                "drive_axle_model",
                "steering_axle_model",
                "client",
                "service_company",
            ).get(
                factory_number=factory_number,
            )

            if request.user.is_authenticated:
                serializer = MachineFullSerializer(machine)
                user_status = "authorized"
            else:
                serializer = MachinePublicSerializer(machine)
                user_status = "unauthorized"

            return Response(
                data={
                    "success": True,
                    "data": serializer.data,
                    "user_status": user_status,
                },
                status=status.HTTP_200_OK,
            )
        except Machine.DoesNotExist:
            return Response(
                data={
                    "success": False,
                    "error": "Машина с указанным заводским номером не найдена.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                data={
                    "success": False,
                    "error": f"Произошла ошибка при поиске машины: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MachineListView(generics.ListAPIView):
    queryset = Machine.objects.all()
    serializer_class = MachineListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MachineFilter

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        queryset = queryset.select_related(
            'client',
            'service_company',
            'steering_axle_model',
            'drive_axle_model',
            'transmission_model',
            'engine_model',
            'model_tech',
        )

        group_name = user.group.name if user.group else None

        if group_name == 'Клиент':
            queryset = queryset.filter(client=user)
        elif group_name == 'Сервисная организация':
            queryset = queryset.filter(service_company=user)
        elif not group_name:
            return Machine.objects.none()

        return queryset.order_by('-shipment_date')


class MachineDetailView(generics.RetrieveAPIView):
    queryset = Machine.objects.all()
    serializer_class = MachineEditSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        queryset = queryset.select_related(
            'client',
            'service_company',
            'steering_axle_model',
            'drive_axle_model',
            'transmission_model',
            'engine_model',
            'model_tech',
        )

        if user.groups.filter(name='client').exists():
            queryset = queryset.filter(client=user)
        elif user.groups.filter(name='service_company').exists():
            queryset = queryset.filter(service_company=user)

        return queryset

    def get_object(self):
        queryset = self.get_queryset()
        pk = self.kwargs.get('pk')

        if pk is None:
            raise Http404("ID машины не указан")

        try:
            obj = queryset.get(pk=pk)
        except Machine.DoesNotExist:
            raise Http404(f"Машина с ID {pk} не найдена или недоступна")

        self.check_object_permissions(self.request, obj)
        return obj
    

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, CanEditMachines])
def machine_update(request, pk):
    try:
        machine = get_object_or_404(Machine, id=pk)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(
                {'error': 'Некорректный JSON в запросе'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = MachineUpdateSerializer(
            machine,
            data=data,
            partial=False
        )

        if not serializer.is_valid():
            return Response(
                {'error': 'Неверные данные', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': f'Ошибка сервера: {e}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsManagerOrSuperadmin])
def machine_create(request):
    serializer = MachineCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    if serializer.is_valid():
        machine = serializer.save()
        return Response(
            MachineSerializer(machine, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def machine_form_options(request):
    """Возвращает опции для формы создания машины"""
    options = MachineCreateSerializer.get_reference_options()
    return Response(options)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, CanEditMachines])
def machine_delete(request, pk):
    machine_to_del = get_object_or_404(Machine, id=pk)

    try:
        serializer = MachineSerializer(machine_to_del)
        machine_to_del_data = serializer.data
        machine_to_del.delete()

        return Response(
            {
                "message": "Машина успешно удалена",
                "deleted_machine": machine_to_del_data,
            },
            status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {
                "error": f"Ошибка при удалении машины: {str(e)}",
            },
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class DictEntryListView(APIView):
    permission_classes = [IsAuthenticated, IsManagerOrSuperadmin]

    def get(self, request, *args, **kwargs):
        queryset = DictionaryEntry.objects.all().order_by('entity')
        serializer = DictionaryEntryListSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)


class DictEntryDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = DictionaryEntry.objects.all()
    serializer_class = DictionaryEntryDetailSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return DictionaryEntry.objects.select_related().all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsManagerOrSuperadmin])
def dict_entry_create(request):
    serializer = DictionaryEntrySerializer(data=request.data)

    if serializer.is_valid():
        created_entry = serializer.save()

        return Response(
            {
                'success': True,
                'message': 'Элемент справочника успешно создан',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        {
            'success': False,
            'message': 'Ошибка при создании элемента справочника',
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsManagerOrSuperadmin])
def dict_entry_update(request, pk):
    dictionary_entry = get_object_or_404(DictionaryEntry, id=pk)

    serializer = DictionaryEntrySerializer(
        dictionary_entry,
        data=request.data,
        partial=request.method == 'PATCH'
    )

    if serializer.is_valid():
        updated_entry = serializer.save()

        return Response(
            {
                'success': True,
                'message': 'Элемент справочника успешно обновлён',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    return Response(
        {
            'success': False,
            'message': 'Ошибка при обновлении элемента справочника',
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsManagerOrSuperadmin])
def dict_entry_delete(request, pk):
    dict_ent_to_del = get_object_or_404(DictionaryEntry, id=pk)

    try:
        serializer = DictionaryEntrySerializer(dict_ent_to_del)
        dict_ent_to_del_data = serializer.data
        dict_ent_to_del.delete()

        return Response(
            {
                "message": "Элемент справочника успешно удалён",
                "deleted_machine": dict_ent_to_del_data,
            },
            status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {
                "error": f"Ошибка при удалении машины: {str(e)}",
            },
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class MaintenanceListView(APIView):
    permission_classes = [IsAuthenticated]
    filterset_class = MaintenanceFilter

    def get(self, request):
        user = request.user

        try:
            if user.user_type == 'client':
                machines = Machine.objects.filter(client=user)
                queryset = Maintenance.objects.filter(machine__in=machines)
            elif user.user_type == 'service_company':
                queryset = Maintenance.objects.filter(service_company=user)
            else:
                queryset = Maintenance.objects.all()

            queryset = queryset.select_related(
                'machine__model_tech',
                'maintenance_type',
                'service_company'
            )

            serializer = MaintenanceSerializer(queryset.order_by('-work_order_date'), many=True)

            return Response({
                'success': True,
                'count': len(serializer.data),
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': 'Произошла ошибка при получении данных ТО',
                'detail': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaintenanceDetailView(generics.RetrieveAPIView):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        queryset = queryset.select_related(
            'maintenance_type',
            'machine',
            'service_company',
        ).prefetch_related(
            'machine__model_tech',
        )

        group_name = user.user_type if user.group else None

        if group_name == 'Клиент':
            queryset = queryset.filter(machine__client=user)
        elif group_name == 'Сервисная организация':
            queryset = queryset.filter(service_company=user)

        return queryset

    def get_object(self):
        queryset = self.get_queryset()
        maintenance_id = self.kwargs.get('pk')

        if maintenance_id is None:
            raise Http404("ID ТО не указан")

        try:
            obj = queryset.get(id=maintenance_id)
        except Maintenance.DoesNotExist:
            raise Http404(f"ТО с ID {maintenance_id} не найдено или недоступно")

        self.check_object_permissions(self.request, obj)
        return obj

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        })


class MaintenanceTypesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        types = DictionaryEntry.objects.filter(entity='maintenance_type')
        data = [
            {'id': type.id, 'name': type.name}
            for type in types
        ]
        return Response({
            "success": True,
            "data": data,
            "message": "Список типов ТО загружен"
        }, status=status.HTTP_200_OK)


class MaintenanceCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MaintenanceCreateSerializer(data=request.data)
        if serializer.is_valid():
            maintenance = serializer.save()
            return Response({
                "success": True,
                "data": serializer.data,
                "message": "ТО успешно создано"
            }, status=status.HTTP_201_CREATED)
        return Response({
            "success": False,
            "errors": serializer.errors,
            "message": "Ошибка при создании ТО"
        }, status=status.HTTP_400_BAD_REQUEST)


class MaintenanceDeleteView(APIView):
    def delete(self, request, pk):
        maintenance = get_object_or_404(Maintenance, id=pk)

        try:
            maintenance.delete()
            return Response({
                "success": True,
                "message": "ТО успешно удалено"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Ошибка при удалении: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaintenanceUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        maintenance = get_object_or_404(Maintenance, id=pk)
        serializer = MaintenanceUpdateSerializer(maintenance, data=request.data, partial=False)
        if serializer.is_valid():
            updated_maintenance = serializer.save()
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ClaimListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Claim.objects.select_related(
        'failure_node',
        'recovery_method',
        'machine'
    ).\
        all().\
        order_by('-failure_date')
    serializer_class = ClaimListSerializer
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DictionaryEntryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DictionaryEntrySerializer

    def get_queryset(self):
        entity = self.request.query_params.get('entity', '')
        if entity:
            return DictionaryEntry.objects.filter(entity=entity)
        return DictionaryEntry.objects.none()


class MachineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.select_related(
        'failure_node',
        'recovery_method',
        'machine__service_company'
    ).all().order_by('-failure_date')
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'create':
            return ClaimCreateSerializer
        elif self.action == 'list':
            return ClaimListSerializer
        return ClaimDetailSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(serializer)

        if serializer.is_valid():
            try:
                claim = serializer.save()
                response_serializer = ClaimDetailSerializer(claim)
                return Response(
                    {
                        "message": "Рекламация успешно создана",
                        "data": response_serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": f"Ошибка при сохранении: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        formatted_errors = self._format_validation_errors(serializer.errors)
        return Response(
            {"errors": formatted_errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def _format_validation_errors(self, errors):
        formatted = {}
        for field, field_errors in errors.items():
            if field == 'failure_node':
                formatted[field] = ["Узел отказа не найден в справочнике"]
            elif field == 'recovery_method':
                formatted[field] = ["Способ восстановления не найден в справочнике"]
            elif field == 'machine':
                formatted[field] = ["Машина не найдена"]
            else:
                formatted[field] = field_errors
        return formatted

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = False
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
            self.perform_destroy(instance)
            return Response(
                {"message": "Рекламация успешно удалена"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Ошибка при удалении: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_destroy(self, instance):
        instance.delete()
