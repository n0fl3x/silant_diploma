import django_filters

from core.models import (
    Machine,
    Maintenance,
    Claim,
)


class MachineFilter(django_filters.FilterSet):
    model = django_filters.CharFilter(lookup_expr='icontains')
    engine_model = django_filters.CharFilter(lookup_expr='icontains')
    transmission_model = django_filters.CharFilter(lookup_expr='icontains')
    steering_axle_model = django_filters.CharFilter(lookup_expr='icontains')
    drive_axle_model = django_filters.CharFilter(lookup_expr='icontains')
    serial_number = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Machine
        fields = ['model', 'engine_model', 'transmission_model',
                  'steering_axle_model', 'drive_axle_model', 'serial_number']

class MaintenanceFilter(django_filters.FilterSet):
    maintenance_type = django_filters.CharFilter(lookup_expr='icontains')
    service_company = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Maintenance
        fields = ['maintenance_type', 'service_company']

class ClaimFilter(django_filters.FilterSet):
    failure_node = django_filters.CharFilter(lookup_expr='icontains')
    repair_method = django_filters.CharFilter(lookup_expr='icontains')
    service_company = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Claim
        fields = ['failure_node', 'repair_method', 'service_company']
