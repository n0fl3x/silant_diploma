from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CustomTokenObtainPairView,
    CustomRefreshTokenView,
    CurrentUserView,
    DictionaryEntryViewSet,
    MachineViewSet,
    is_authenticated,
    logout,
    MachineSearchAPIView,
    MachineListView,
    MachineDetailView,
    machine_form_options,
    machine_update,
    machine_create,
    machine_delete,
    DictEntryListView,
    DictEntryDetailView,
    dict_entry_update,
    dict_entry_create,
    dict_entry_delete,
    MaintenanceListView,
    MaintenanceDetailView,
    MaintenanceCreateView,
    MaintenanceDeleteView,
    MaintenanceUpdateView,
    ClaimViewSet,
)


router = DefaultRouter()

router.register(
    prefix=r"claims",
    viewset=ClaimViewSet,
    basename="claim",
)
router.register(r'dictionary-entries', DictionaryEntryViewSet, basename='dictionary-entry')
router.register(r'machines', MachineViewSet, basename='machine')


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
    path('machine-form-options/', machine_form_options, name='machine-form-options'),
    path('machine-update/<int:pk>', machine_update, name='machine-update'),
    path('machine-create', machine_create, name='machine-create'),
    path('machine-delete/<int:pk>', machine_delete, name='machine-delete'),

    #
    path('dict-entries', DictEntryListView.as_view(), name='dict-entry-list'),
    path('dict-entries/<int:pk>', DictEntryDetailView.as_view(), name='dict-entry-detail'),
    path('dict-entry-update/<int:pk>', dict_entry_update, name='dict-entry-update'),
    path('dict-entry-create', dict_entry_create, name='dict-entry-create'),
    path('dict-entry-delete/<int:pk>', dict_entry_delete, name='dict-entry-delete'),

    #
    path('maintenance', MaintenanceListView.as_view(), name='maintenance-list'),
    path('maintenance/<int:pk>', MaintenanceDetailView.as_view(), name='maintenance-detail'),
    path('maintenance-update/<int:pk>', MaintenanceUpdateView.as_view(), name='maintenance-update'),
    path('maintenance-create', MaintenanceCreateView.as_view(), name='maintenance-create'),
    path('maintenance-delete/<int:pk>', MaintenanceDeleteView.as_view(), name='maintenance-delete'),

    #
    path('', include(router.urls)),
]
