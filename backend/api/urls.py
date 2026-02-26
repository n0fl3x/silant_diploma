from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CustomTokenObtainPairView,
    CustomRefreshTokenView,
    MachineSearchAPIView,
    MachineListView,
    MachineDetailView,
    MaintenanceList,
    MaintenanceDetail,
    ClaimList,
    ClaimDetail,
    CurrentUserView,
    logout,
    is_authenticated,
    machine_update,
)


urlpatterns = [
    path(
        route="login",
        view=CustomTokenObtainPairView.as_view(),
        name="login",
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
        route="user",
        view=CurrentUserView.as_view(),
        name="current-user",
    ),
    path(
        route="machines/search",
        view=MachineSearchAPIView.as_view(),
        name="machine-search",
    ),
    path('machines', MachineListView.as_view(), name='machine-list'),
    path('machines/<int:pk>', MachineDetailView.as_view(), name='machine-detail'),
    path('machine-update/<int:pk>', machine_update, name='machine-update'),

    #
    path('maintenance', MaintenanceList.as_view(), name='maintenance-list'),
    path('maintenance/<int:pk>', MaintenanceDetail.as_view(), name='maintenance-detail'),
    path('claims', ClaimList.as_view(), name='claim-list'),
    path('claims/<int:pk>', ClaimDetail.as_view(), name='claim-detail'),
    
]
