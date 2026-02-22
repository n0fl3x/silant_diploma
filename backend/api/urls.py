from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    get_machines,
    CustomTokenObtainPairView,
    CustomRefreshTokenView,
    logout,
    is_authenticated,
)


router = DefaultRouter()

urlpatterns = [
    path(
        "",
        include(router.urls),
    ),
    path(
        "client-machines",
        get_machines,
    ),
    path("token", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh", CustomRefreshTokenView.as_view(), name="token_refresh"),
    path("logout", logout),
    path("authenticated", is_authenticated),
]
