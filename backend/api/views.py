from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.models import Machine
from api.serializers import MachineSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens["access"]
            refresh_token = tokens["refresh"]

            resp = Response()
            resp.data = {"success": True}
            resp.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite=None,
                path="/",
            )
            resp.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite=None,
                path="/",
            )

            return resp
        except Exception:
            return Response({"success": False})
        

class CustomRefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            request.data["refresh"] = refresh_token
            resp = super().post(request, *args, kwargs)
            tokens = resp.data
            access_token = tokens["access"]
            new_resp = Response()
            new_resp.data = {"refreshed": True}
            new_resp.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite=None,
                path="/",
            )
            return new_resp
        except Exception:
            return Response({"refreshed": False})
        
@api_view(http_method_names=["POST"])
def logout(request):
    try:
        resp = Response()
        resp.data = {"success": True}
        resp.delete_cookie(
            key="access_token",
            path="/",
            samesite=None,
        )
        resp.delete_cookie(
            key="refresh_token",
            path="/",
            samesite=None,
        )
        return resp
    except Exception:
        return Response({"success": False})
    
@api_view(http_method_names=["POST"])
@permission_classes(permission_classes=[IsAuthenticated])
def is_authenticated(request):
    return Response({"authenticated": True})

@api_view(http_method_names=["GET"])
@permission_classes(permission_classes=[IsAuthenticated])
def get_machines(request):
    user = request.user
    # cust_user = CustomUser.objects.get(username=user)
    machines = Machine.objects.filter(client=user)
    serializer = MachineSerializer(machines, many=True)

    return Response(serializer.data)
