import json

from rest_framework import status
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.http import Http404
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate

from django_filters.rest_framework import DjangoFilterBackend

from core.models import (
    Machine,
    Maintenance,
    Claim,
    CustomUser,
)
from .serializers import (
    MachinePublicSerializer,
    MachineFullSerializer,
    MachineListSerializer,
    MachineDetailSerializer,
    MachineSerializer,
    MaintenanceSerializer,
    ClaimSerializer,
)
from .filters import (
    MachineFilter,
    MaintenanceFilter,
    ClaimFilter,
)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'groups': [group.name for group in user.groups.all()],
            'permissions': list(user.get_all_permissions())
        })


class MachineListView(generics.ListAPIView):
    queryset = Machine.objects.all()
    serializer_class = MachineListSerializer
    permission_classes = [permissions.DjangoModelPermissions]
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

        if user.groups.filter(name='Клиент').exists():
            queryset = queryset.filter(client=user)
        elif user.groups.filter(name='Сервисная организация').exists():
            queryset = queryset.filter(service_company=user)

        return queryset.order_by('-shipment_date')


class MachineDetailView(generics.RetrieveAPIView):
    queryset = Machine.objects.all()
    serializer_class = MachineDetailSerializer
    permission_classes = [permissions.DjangoModelPermissions]

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

        if user.groups.filter(name='Клиент').exists():
            queryset = queryset.filter(client=user)
        elif user.groups.filter(name='Сервисная организация').exists():
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
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
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

        serializer = MachineSerializer(
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
        print(e)
        return Response(
            {'error': 'Ошибка сервера'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class MaintenanceList(generics.ListCreateAPIView):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer
    permission_classes = [permissions.DjangoModelPermissions]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MaintenanceFilter

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.groups.filter(name='Клиент').exists():
            queryset = queryset.filter(machine__client=user)
        elif user.groups.filter(name='Сервисная организация').exists():
            queryset = queryset.filter(service_company=user)

        return queryset.order_by('-maintenance_date')


class MaintenanceDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer
    permission_classes = [permissions.DjangoModelPermissions]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        if user.groups.filter(name='Клиент').exists():
            if obj.client != user:
                raise NotFound("Машина не найдена")
        elif user.groups.filter(name='Сервисная организация').exists():
            if obj.service_company != user:
                raise NotFound("Машина не найдена")

        return obj


class ClaimList(generics.ListCreateAPIView):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    permission_classes = [permissions.DjangoModelPermissions]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ClaimFilter

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.groups.filter(name='Клиент').exists():
            queryset = queryset.filter(machine__client=user)
        elif user.groups.filter(name='Сервисная организация').exists():
            queryset = queryset.filter(service_company=user)

        return queryset.order_by('-failure_date')


class ClaimDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    permission_classes = [permissions.DjangoModelPermissions]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        if user.groups.filter(name='Клиент').exists():
            if obj.client != user:
                raise NotFound("Машина не найдена")
        elif user.groups.filter(name='Сервисная организация').exists():
            if obj.service_company != user:
                raise NotFound("Машина не найдена")

        return obj


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


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(
        self,
        request,
        *args,
        **kwargs,
    ):
        try:
            username = request.data.get("username")
            password = request.data.get("password")

            if not username or not password:
                return Response(
                    data={
                        "error": "Введите логин и пароль.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = authenticate(
                request=request,
                username=username,
                password=password,
            )
            
            if user is None:
                return Response(
                    data={
                        "error": "Неверные логин и/или пароль.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            if not isinstance(user, CustomUser):
                return Response(
                    data={
                        "error": "Ошибка типа пользователя.",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            response = super().post(
                request,
                *args,
                **kwargs,
            )
            tokens = response.data
            access_token = tokens["access"]
            refresh_token = tokens["refresh"]

            response_data = {
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email or "empty",
                    "user_description": user.user_description or "empty",
                },
            }

            resp = Response(
                data=response_data,
                status=status.HTTP_200_OK,
            )
            resp.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
            )
            resp.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
            )

            return resp
        except Exception as e:
            return Response(
                data={
                    "error": f"Ошибка сервера: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CustomRefreshTokenView(TokenRefreshView):
    def post(
        self,
        request,
        *args,
        **kwargs,
    ):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            
            if not refresh_token:
                return Response(
                    data={
                        "error": "Refresh token is missing.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            request.data["refresh"] = refresh_token
            resp = super().post(
                request,
                *args,
                kwargs,
            )
            tokens = resp.data
            access_token = tokens["access"]

            new_resp = Response(
                data={
                    "refreshed": True,
                },
                status=status.HTTP_200_OK,
            )
            new_resp.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
            )

            return new_resp
        except Exception as e:
            return Response(
                data={
                    "error": "Token refresh error.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

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
