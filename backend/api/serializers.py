from rest_framework import serializers

from core.models import (
    Machine,
    Maintenance,
    Claim,
    DictionaryEntry,
)


class MachinePublicSerializer(serializers.ModelSerializer):
    model_tech_name = serializers.CharField(
        source="model_tech.name",
        read_only=True,
        allow_null=True,
    )
    engine_model_name = serializers.CharField(
        source="engine_model.name",
        read_only=True,
        allow_null=True,
    )
    transmission_model_name = serializers.CharField(
        source="transmission_model.name",
        read_only=True,
        allow_null=True,
    )
    drive_axle_model_name = serializers.CharField(
        source="drive_axle_model.name",
        read_only=True,
        allow_null=True,
    )
    steering_axle_model_name = serializers.CharField(
        source="steering_axle_model.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Machine
        fields = [
            "factory_number",
            "model_tech_name",
            "engine_model_name",
            "engine_factory_number",
            "transmission_model_name",
            "transmission_factory_number",
            "drive_axle_model_name",
            "drive_axle_factory_number",
            "steering_axle_model_name",
            "steering_axle_factory_number",
        ]


class MachineFullSerializer(MachinePublicSerializer):
    client_name = serializers.CharField(
        source="client.name",
        read_only=True,
        allow_null=True,
    )
    service_company_name = serializers.CharField(
        source="service_company.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Machine
        fields = MachinePublicSerializer.Meta.fields + [
            "delivery_contract",
            "shipment_date",
            "consignee",
            "delivery_address",
            "configuration",
            "client_name",
            "service_company_name",
        ]


class MachineListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(
        source="client.user_description",
        read_only=True,
    )
    service_company_name = serializers.CharField(
        source="service_company.user_description",
        read_only=True,
    )
    model_tech_name = serializers.CharField(
        source="model_tech.name",
        read_only=True,
    )
    engine_model_name = serializers.CharField(
        source="engine_model.name",
        read_only=True,
    )
    transmission_model_name = serializers.CharField(
        source="transmission_model.name",
        read_only=True,
    )
    drive_axle_model_name = serializers.CharField(
        source="drive_axle_model.name",
        read_only=True,
    )
    steering_axle_model_name = serializers.CharField(
        source="steering_axle_model.name",
        read_only=True,
    )

    class Meta:
        model = Machine
        fields = [
            "id",
            "factory_number",
            "model_tech_name",
            "engine_model_name",
            "engine_factory_number",
            "transmission_model_name",
            "transmission_factory_number",
            "drive_axle_model_name",
            "drive_axle_factory_number",
            "steering_axle_model_name",
            "steering_axle_factory_number",
            "delivery_contract",
            "shipment_date",
            "consignee",
            "delivery_address",
            "configuration",
            "client_name",
            "service_company_name",
        ]


class MachineDetailSerializer(MachineListSerializer):
    pass


class DictionaryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DictionaryEntry
        fields = "__all__"


class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = "__all__"


class ClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = "__all__"
