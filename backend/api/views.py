from rest_framework import viewsets

from core.models import (
    Machine,
    Maintenance,
    Claim,
    DictionaryEntry,
)
from api.serializers import (
    MachineSerializer,
    MaintenanceSerializer,
    ClaimSerializer,
    DictionaryEntrySerializer,
)


class DictionaryEntryViewSet(viewsets.ModelViewSet):
    queryset = DictionaryEntry.objects.all()
    serializer_class = DictionaryEntrySerializer


class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
