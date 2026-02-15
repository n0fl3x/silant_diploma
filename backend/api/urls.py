from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MachineViewSet, MaintenanceViewSet, ClaimViewSet


router = DefaultRouter()

router.register(
    prefix=r"machines",
    viewset=MachineViewSet,
)
router.register(
    prefix=r"maintenance",
    viewset=MaintenanceViewSet,
)
router.register(
    prefix=r"claims",
    viewset=ClaimViewSet,
)

urlpatterns = [
    path(
        "",
        include(router.urls),
    ),
]
