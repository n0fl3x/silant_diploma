from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CustomTokenObtainPairView,
    CustomRefreshTokenView,
    CurrentUserView,
    is_authenticated,
    logout,

    MachineSearchAPIView,
    MachineListView,
    MachineDetailView,
    machine_update,
    machine_create,
    machine_delete,

    DictEntryListView,
    DictEntryDetailView,
    dict_entry_update,
    dict_entry_create,
    dict_entry_delete,
)


urlpatterns = [
    path(
        route="login",
        view=CustomTokenObtainPairView.as_view(),
        name="login",
    ),
    path(
        route="token-refresh",
        view=CustomRefreshTokenView.as_view(),
        name="token-refresh",
    ),
    path(
        route="logout",
        view=logout,
        name="logout",
    ),
    path(
        route="user",
        view=CurrentUserView.as_view(),
        name="current-user",
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

    #
    path('machines', MachineListView.as_view(), name='machine-list'),
    path('machines/<int:pk>', MachineDetailView.as_view(), name='machine-detail'),
    path('machine-update/<int:pk>', machine_update, name='machine-update'),
    path('machine-create', machine_create, name='machine-create'),
    path('machine-delete/<int:pk>', machine_delete, name='machine-delete'),

    #
    path('dict-entries', DictEntryListView.as_view(), name='dict-entry-list'),
    path('dict-entries/<int:pk>', DictEntryDetailView.as_view(), name='dict-entry-detail'),
    path('dict-entry-update/<int:pk>', dict_entry_update, name='dict-entry-update'),
    path('dict-entry-create', dict_entry_create, name='dict-entry-create'),
    path('dict-entry-delete/<int:pk>', dict_entry_delete, name='dict-entry-delete'),
]
