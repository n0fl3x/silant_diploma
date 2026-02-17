from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MachineViewSet,
    MaintenanceViewSet,
    ClaimViewSet,
    DictionaryEntryViewSet,
)


router = DefaultRouter()

router.register(
    r"machines",
    MachineViewSet,
)
router.register(
    r"maintenance",
    MaintenanceViewSet,
)
router.register(
    r"claims",
    ClaimViewSet,
)
router.register(
    "dictionary-entries",
    DictionaryEntryViewSet,
)

urlpatterns = [
    path(
        "",
        include(router.urls),
    ),
]
