from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CustomTokenObtainPairView,
    CustomRefreshTokenView,
    MachineSearchAPIView,
    logout,
    is_authenticated,
    get_machines,
)


urlpatterns = [
    path(
        route="client-machines",
        view=get_machines,
        name="machines-of-client",
    ),
    path(
        route="token",
        view=CustomTokenObtainPairView.as_view(),
        name="token-obtain-pair",
    ),
    path(
        route="token/refresh",
        view=CustomRefreshTokenView.as_view(),
        name="token-refresh",
    ),
    path(
        route="logout",
        view=logout,
        name="logout",
    ),
    path(
        route="authenticated",
        view=is_authenticated,
        name="is-authenticated",
    ),
    path(
        route="machines/search",
        view=MachineSearchAPIView.as_view(),
        name="machine-search",
    ),
]
