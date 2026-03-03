from django.core.exceptions import ValidationError

from rest_framework import serializers

from core.models import (
    Machine,
    Maintenance,
    Claim,
    DictionaryEntry,
    CustomUser,
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
    
    model_tech = serializers.SerializerMethodField()
    engine_model = serializers.SerializerMethodField()
    transmission_model = serializers.SerializerMethodField()
    drive_axle_model = serializers.SerializerMethodField()
    steering_axle_model = serializers.SerializerMethodField()

    def get_model_tech(self, obj):
        if obj.model_tech:
            return {
                "id": obj.model_tech.id,
                "name": obj.model_tech.name
            }
        return None

    def get_engine_model(self, obj):
        if obj.engine_model:
            return {
                "id": obj.engine_model.id,
                "name": obj.engine_model.name
            }
        return None

    def get_transmission_model(self, obj):
        if obj.transmission_model:
            return {
                "id": obj.transmission_model.id,
                "name": obj.transmission_model.name
            }
        return None

    def get_drive_axle_model(self, obj):
        if obj.drive_axle_model:
            return {
                "id": obj.drive_axle_model.id,
                "name": obj.drive_axle_model.name
            }
        return None

    def get_steering_axle_model(self, obj):
        if obj.steering_axle_model:
            return {
                "id": obj.steering_axle_model.id,
                "name": obj.steering_axle_model.name
            }
        return None

    class Meta:
        model = Machine
        fields = [
            "id",
            "factory_number",
            "model_tech",
            "engine_model",
            "engine_factory_number",
            "transmission_model",
            "transmission_factory_number",
            "drive_axle_model",
            "drive_axle_factory_number",
            "steering_axle_model",
            "steering_axle_factory_number",
            "delivery_contract",
            "shipment_date",
            "consignee",
            "delivery_address",
            "configuration",
            "client_name",
            "service_company_name",
        ]


class DictionaryEntryListSerializer(serializers.ModelSerializer):
    entity_display = serializers.CharField(
        source='get_entity_display',
        read_only=True,
        label='Тип справочника (текст)'
    )

    class Meta:
        model = DictionaryEntry
        fields = ['id', 'entity', 'entity_display', 'name', 'description']


class DictionaryEntryDetailSerializer(serializers.ModelSerializer):
    entity_display = serializers.SerializerMethodField()

    class Meta:
        model = DictionaryEntry
        fields = [
            'id',
            'entity',
            'entity_display',
            'name',
            'description',
        ]

    def get_entity_display(self, obj):
        return dict(DictionaryEntry.ENTITY_CHOICES).get(obj.entity, obj.entity)


class DictionaryEntrySerializer(serializers.ModelSerializer):
    entity_display = serializers.SerializerMethodField()

    class Meta:
        model = DictionaryEntry
        fields = [
            'id',
            'entity',
            'entity_display',
            'name',
            'description'
        ]
        extra_kwargs = {
            'name': {'required': True},
            'entity': {'required': True}
        }

    def get_entity_display(self, obj):
        entity_choices_dict = dict(DictionaryEntry.ENTITY_CHOICES)
        return entity_choices_dict.get(obj.entity, obj.entity)

    def validate_name(self, value):
        if len(value) > 100:
            raise serializers.ValidationError(
                'Наименование не должно превышать 100 символов.'
            )
        return value

    def validate(self, data):
        instance = getattr(self, 'instance', None)
        entity = data.get('entity')
        name = data.get('name')

        if entity and name:
            queryset = DictionaryEntry.objects.filter(entity=entity, name=name)
            if instance:
                queryset = queryset.exclude(id=instance.id)

            if queryset.exists():
                raise serializers.ValidationError({
                    'name': 'Комбинация типа справочника и наименования уже существует.'
                })

        return data

    def create(self, validated_data):
        try:
            instance = DictionaryEntry.objects.create(**validated_data)
            return instance
        except Exception as e:
            raise serializers.ValidationError({'error': str(e)})

    def update(self, instance, validated_data):
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        except Exception as e:
            raise serializers.ValidationError({'error': str(e)})


class MachineForMaintenanceSerializer(serializers.ModelSerializer):
    model_tech_name = serializers.CharField(
        source='model_tech.name',
        read_only=True
    )
    model_tech_id = serializers.IntegerField(
        source='model_tech.id',
        read_only=True
    )

    class Meta:
        model = Machine
        fields = ['id', 'factory_number', 'model_tech_name', 'model_tech_id']


class MaintenanceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DictionaryEntry
        fields = ['id', 'name']


class ServiceCompanySerializer(serializers.ModelSerializer):
    description = serializers.CharField(source='user_description', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['description']


class MaintenanceSerializer(serializers.ModelSerializer):
    machine = serializers.SerializerMethodField()
    maintenance_type = MaintenanceTypeSerializer()  # используем новый сериализатор
    service_company = serializers.SerializerMethodField()

    class Meta:
        model = Maintenance
        fields = [
            'id',
            'maintenance_date',
            'operating_hours',
            'work_order_number',
            'work_order_date',
            'machine',
            'maintenance_type',
            'service_company'
        ]

    def get_machine(self, obj):
        if obj.machine:
            return {
                'id': obj.machine.id,
                'factory_number': obj.machine.factory_number,
                'model_tech_name': obj.machine.model_tech.name if obj.machine.model_tech else None,
                'model_tech_id': obj.machine.model_tech.id if obj.machine.model_tech else None
            }
        return None

    def get_service_company(self, obj):
        if obj.service_company:
            return {
                'description': obj.service_company.user_description
            }
        return None


class MachineShortSerializer(serializers.ModelSerializer):
    model_tech = serializers.SerializerMethodField()

    def get_model_tech(self, obj):
        if obj.model_tech:
            return {
                'id': obj.model_tech.id,
                'name': obj.model_tech.name
            }
        return None

    class Meta:
        model = Machine
        fields = ['id', 'factory_number', 'model_tech']


class ServiceCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'user_description']


class MaintenanceDetailSerializer(serializers.ModelSerializer):
    maintenance_type_name = serializers.CharField(
        source='maintenance_type.name',
        read_only=True
    )
    machine = MachineShortSerializer(read_only=True)
    service_company = ServiceCompanySerializer(read_only=True)

    class Meta:
        model = Maintenance
        fields = [
            'id',
            'maintenance_date',
            'operating_hours',
            'work_order_number',
            'work_order_date',
            'maintenance_type_id',
            'maintenance_type_name',
            'machine',
            'service_company',
        ]


class MaintenanceCreateSerializer(serializers.ModelSerializer):
    maintenance_type_name = serializers.CharField(write_only=True)
    machine_factory_number = serializers.CharField(write_only=True)
    service_company_name = serializers.CharField(write_only=True)

    class Meta:
        model = Maintenance
        fields = [
            'id',
            'maintenance_date',
            'operating_hours',
            'work_order_number',
            'work_order_date',
            'maintenance_type_name',
            'machine_factory_number',
            'service_company_name'
        ]

    def validate(self, data):
        maintenance_type_name = data.get('maintenance_type_name')
        try:
            maintenance_type = DictionaryEntry.objects.get(
                name=maintenance_type_name,
                entity='maintenance_type'
            )
            data['maintenance_type'] = maintenance_type
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError({
                "maintenance_type_name": f"Тип ТО с названием '{maintenance_type_name}' не найден"
            })

        machine_factory_number = data.get('machine_factory_number')
        try:
            machine = Machine.objects.get(factory_number=machine_factory_number)
            data['machine'] = machine
        except Machine.DoesNotExist:
            raise serializers.ValidationError({
                "machine_factory_number": f"Машина с заводским номером '{machine_factory_number}' не найдена"
            })

        service_company_name = data.get('service_company_name')
        try:
            service_company = CustomUser.objects.get(user_description=service_company_name)
            data['service_company'] = service_company
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({
                "service_company_name": f"Компания с названием '{service_company_name}' не найдена"
            })

        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for field in ['maintenance_type_name', 'machine_factory_number', 'service_company_name']:
            data.pop(field, None)
        
        data['maintenance_type_name'] = instance.maintenance_type.name
        data['machine_factory_number'] = instance.machine.factory_number
        data['service_company_name'] = instance.service_company.user_description
        return data

    def create(self, validated_data):
        validated_data.pop('maintenance_type_name', None)
        validated_data.pop('machine_factory_number', None)
        validated_data.pop('service_company_name', None)
        return Maintenance.objects.create(**validated_data)


class MaintenanceUpdateSerializer(serializers.ModelSerializer):
    maintenance_type_name = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    machine_factory_number = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    service_company_name = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Maintenance
        fields = [
            'id', 'maintenance_date', 'operating_hours',
            'work_order_number', 'work_order_date',
            'maintenance_type_name', 'machine_factory_number', 'service_company_name'
        ]

    def validate(self, data):
        maintenance_type_name = data.get('maintenance_type_name')
        if maintenance_type_name and maintenance_type_name.strip():
            try:
                maintenance_type = DictionaryEntry.objects.get(
                    name=maintenance_type_name,
                    entity='maintenance_type'
                )
                data['maintenance_type'] = maintenance_type
            except DictionaryEntry.DoesNotExist:
                raise serializers.ValidationError({
                    "maintenance_type_name": f"Тип ТО с названием '{maintenance_type_name}' не найден"
        })

        machine_factory_number = data.get('machine_factory_number')
        if machine_factory_number and machine_factory_number.strip():
            try:
                machine = Machine.objects.get(factory_number=machine_factory_number)
                data['machine'] = machine
            except Machine.DoesNotExist:
                raise serializers.ValidationError({
                    "machine_factory_number": f"Машина с заводским номером '{machine_factory_number}' не найдена"
                })

        service_company_name = data.get('service_company_name')
        if service_company_name and service_company_name.strip():
            try:
                service_company = CustomUser.objects.get(user_description=service_company_name)
                data['service_company'] = service_company
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError({
                    "service_company_name": f"Компания с названием '{service_company_name}' не найдена"
                })

        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for field in ['maintenance_type_name', 'machine_factory_number', 'service_company_name']:
            data.pop(field, None)

        data['maintenance_type_name'] = instance.maintenance_type.name
        data['machine_factory_number'] = instance.machine.factory_number
        data['service_company_name'] = instance.service_company.user_description
        return data

    def update(self, instance, validated_data):
        validated_data.pop('maintenance_type_name', None)
        validated_data.pop('machine_factory_number', None)
        validated_data.pop('service_company_name', None)

        instance.maintenance_date = validated_data.get('maintenance_date', instance.maintenance_date)
        instance.operating_hours = validated_data.get('operating_hours', instance.operating_hours)
        instance.work_order_number = validated_data.get('work_order_number', instance.work_order_number)
        instance.work_order_date = validated_data.get('work_order_date', instance.work_order_date)

        if 'maintenance_type' in validated_data:
            instance.maintenance_type = validated_data['maintenance_type']
        if 'machine' in validated_data:
            instance.machine = validated_data['machine']
        if 'service_company' in validated_data:
            instance.service_company = validated_data['service_company']

        instance.save()
        return instance


class ClaimListSerializer(serializers.ModelSerializer):
    failure_node_name = serializers.CharField(
        source='failure_node.name',
        read_only=True
    )
    recovery_method_name = serializers.CharField(
        source='recovery_method.name',
        read_only=True,
        allow_null=True
    )
    machine_factory_number = serializers.CharField(
        source='machine.factory_number',
        read_only=True
    )
    service_company_description = serializers.SerializerMethodField()

    def get_service_company_description(self, obj):
        if obj.machine and obj.machine.service_company:
            return obj.machine.service_company.user_description
        return 'Не указана'

    class Meta:
        model = Claim
        fields = [
            'id',
            'failure_date',
            'operating_hours',
            'failure_node',
            'failure_node_name',
            'failure_description',
            'recovery_method',
            'recovery_method_name',
            'spare_parts',
            'recovery_date',
            'downtime_days',
            'machine',
            'machine_factory_number',
            'service_company_description'
        ]
        read_only_fields = ['downtime_days']


class ClaimDetailSerializer(serializers.ModelSerializer):
    failure_node_name = serializers.CharField(source='failure_node.name', read_only=True)
    machine_factory_number = serializers.CharField(
        source='machine.factory_number',
        read_only=True
    )
    recovery_method_name = serializers.CharField(
        source='recovery_method.name',
        read_only=True,
        allow_null=True
    )
    service_company_description = serializers.SerializerMethodField()

    def get_service_company_description(self, obj):
        if obj.machine and obj.machine.service_company:
            return obj.machine.service_company.user_description
        return 'Не указана'

    class Meta:
        model = Claim
        fields = [
            'id',
            'failure_date',
            'operating_hours',
            'failure_node',
            'failure_node_name',
            'machine',
            'machine_factory_number',
            'downtime_days',
            'recovery_method',
            'recovery_method_name',
            'service_company_description',
        ]
        read_only_fields = fields


class ClaimCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = [
            'failure_date',
            'operating_hours',
            'machine',
            'failure_node',
            'recovery_method',
            'failure_description',
            'spare_parts',
            'recovery_date'
        ]
        extra_kwargs = {
            'recovery_method': {'required': False, 'allow_null': True},
            'failure_description': {'required': False},
            'spare_parts': {'required': False},
            'recovery_date': {'required': False}
        }


class MachineSerializer(serializers.ModelSerializer):
    model_tech_name = serializers.CharField(source='model_tech.name', read_only=True)

    class Meta:
        model = Machine
        fields = ['id', 'factory_number', 'model_tech', 'model_tech_name']


class DictionaryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DictionaryEntry
        fields = ['id', 'name', 'entity']


class MachineEditSerializer(MachineListSerializer):
    model_tech_options = serializers.SerializerMethodField()
    engine_model_options = serializers.SerializerMethodField()
    transmission_model_options = serializers.SerializerMethodField()
    drive_axle_model_options = serializers.SerializerMethodField()
    steering_axle_model_options = serializers.SerializerMethodField()

    def get_model_tech_options(self, obj):
        return DictionaryEntrySerializer(
            DictionaryEntry.objects.filter(entity='machine_model'),
            many=True
        ).data

    def get_engine_model_options(self, obj):
        return DictionaryEntrySerializer(
            DictionaryEntry.objects.filter(entity='engine_model'),
            many=True
        ).data

    def get_transmission_model_options(self, obj):
        return DictionaryEntrySerializer(
            DictionaryEntry.objects.filter(entity='transmission_model'),
            many=True
        ).data

    def get_drive_axle_model_options(self, obj):
        return DictionaryEntrySerializer(
            DictionaryEntry.objects.filter(entity='drive_axle_model'),
            many=True
        ).data

    def get_steering_axle_model_options(self, obj):
        return DictionaryEntrySerializer(
            DictionaryEntry.objects.filter(entity='steering_axle_model'),
            many=True
        ).data

    class Meta(MachineListSerializer.Meta):
        fields = MachineListSerializer.Meta.fields + [
            'model_tech_options',
            'engine_model_options',
            'transmission_model_options',
            'drive_axle_model_options',
            'steering_axle_model_options'
        ]


class MachineUpdateSerializer(serializers.ModelSerializer):
    # Поля для ID моделей
    model_tech_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    engine_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    transmission_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    drive_axle_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    steering_axle_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )

    # Текстовые поля для поиска пользователей
    client_input = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    service_company_input = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Machine
        fields = [
            'id',
            'factory_number',
            'model_tech_id',
            'engine_model_id',
            'engine_factory_number',
            'transmission_model_id',
            'transmission_factory_number',
            'drive_axle_model_id',
            'drive_axle_factory_number',
            'steering_axle_model_id',
            'steering_axle_factory_number',
            'delivery_contract',
            'shipment_date',
            'consignee',
            'delivery_address',
            'configuration',
            'client_input',
            'service_company_input'
        ]

    def validate_model_tech_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='machine_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель техники с таким ID не найдена")

    def validate_engine_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='engine_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель двигателя с таким ID не найдена")

    def validate_transmission_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='transmission_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель трансмиссии с таким ID не найдена")

    def validate_drive_axle_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='drive_axle_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель ведущего моста с таким ID не найдена")

    def validate_steering_axle_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='steering_axle_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель управляемого моста с таким ID не найдена")

    def validate_client_input(self, value):
        if not value:
            return None
        try:
            return CustomUser.objects.get(user_description=value, user_type='client')
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Клиент с таким описанием не найден")

    def validate_service_company_input(self, value):
        if not value:
            return None
        try:
            return CustomUser.objects.get(user_description=value, user_type='service_company')
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Сервисная компания с таким описанием не найдена")

    def update(self, instance, validated_data):
        # Обрабатываем связи с DictionaryEntry
        model_tech = validated_data.pop('model_tech_id', None)
        if model_tech:
            instance.model_tech = model_tech

        engine_model = validated_data.pop('engine_model_id', None)
        if engine_model:
            instance.engine_model = engine_model

        transmission_model = validated_data.pop('transmission_model_id', None)
        if transmission_model:
            instance.transmission_model = transmission_model

        drive_axle_model = validated_data.pop('drive_axle_model_id', None)
        if drive_axle_model:
            instance.drive_axle_model = drive_axle_model

        steering_axle_model = validated_data.pop('steering_axle_model_id', None)
        if steering_axle_model:
            instance.steering_axle_model = steering_axle_model

        # Обрабатываем связи с User
        client = validated_data.pop('client_input', None)
        if client is not None:
            instance.client = client

        service_company = validated_data.pop('service_company_input', None)
        if service_company is not None:
            instance.service_company = service_company

        # Обновляем остальные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class MachineCreateSerializer(serializers.ModelSerializer):
    # Поля для ID моделей из справочника
    model_tech_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    engine_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    transmission_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    drive_axle_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )
    steering_axle_model_id = serializers.IntegerField(
        write_only=True,
        required=True
    )

    # Текстовые поля для поиска пользователей
    client_input = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    service_company_input = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Machine
        fields = [
            'id',
            'factory_number',
            'model_tech_id',
            'engine_model_id',
            'engine_factory_number',
            'transmission_model_id',
            'transmission_factory_number',
            'drive_axle_model_id',
            'drive_axle_factory_number',
            'steering_axle_model_id',
            'steering_axle_factory_number',
            'delivery_contract',
            'shipment_date',
            'consignee',
            'delivery_address',
            'configuration',
            'client_input',
            'service_company_input'
        ]

    @staticmethod
    def get_reference_options():
        """Возвращает справочные данные для выпадающих списков"""
        return {
            'model_tech_options': list(
                DictionaryEntry.objects
                .filter(entity='machine_model')
                .values('id', 'name')
            ),
            'engine_model_options': list(
                DictionaryEntry.objects
                .filter(entity='engine_model')
                .values('id', 'name')
            ),
            'transmission_model_options': list(
                DictionaryEntry.objects
                .filter(entity='transmission_model')
                .values('id', 'name')
            ),
            'drive_axle_model_options': list(
                DictionaryEntry.objects
                .filter(entity='drive_axle_model')
                .values('id', 'name')
            ),
            'steering_axle_model_options': list(
                DictionaryEntry.objects
                .filter(entity='steering_axle_model')
                .values('id', 'name')
            ),
        }

    def validate_model_tech_id(self, value):
        """Проверяем существование модели техники."""
        try:
            return DictionaryEntry.objects.get(id=value, entity='machine_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель техники с таким ID не найдена")

    def validate_engine_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='engine_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель двигателя с таким ID не найдена")

    def validate_transmission_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='transmission_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель трансмиссии с таким ID не найдена")

    def validate_drive_axle_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='drive_axle_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель ведущего моста с таким ID не найдена")

    def validate_steering_axle_model_id(self, value):
        try:
            return DictionaryEntry.objects.get(id=value, entity='steering_axle_model')
        except DictionaryEntry.DoesNotExist:
            raise serializers.ValidationError("Модель управляемого моста с таким ID не найдена")

    def validate_client_input(self, value):
        """Ищем клиента по описанию."""
        if not value:
            return None
        try:
            return CustomUser.objects.get(user_description=value, user_type='client')
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Клиент с таким описанием не найден")

    def validate_service_company_input(self, value):
        """Ищем сервисную компанию по описанию."""
        if not value:
            return None
        try:
            return CustomUser.objects.get(user_description=value, user_type='service_company')
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Сервисная компания с таким описанием не найдена")

    def create(self, validated_data):
        # Извлекаем ID-поля моделей
        model_tech = validated_data.pop('model_tech_id')
        engine_model = validated_data.pop('engine_model_id')
        transmission_model = validated_data.pop('transmission_model_id')
        drive_axle_model = validated_data.pop('drive_axle_model_id')
        steering_axle_model = validated_data.pop('steering_axle_model_id')

        # Извлекаем текстовые поля для пользователей
        client = validated_data.pop('client_input', None)
        service_company = validated_data.pop('service_company_input', None)

        # Создаём экземпляр машины
        machine = Machine(
            factory_number=validated_data['factory_number'],
            model_tech=model_tech,
            engine_model=engine_model,
            engine_factory_number=validated_data['engine_factory_number'],
            transmission_model=transmission_model,
            transmission_factory_number=validated_data['transmission_factory_number'],
            drive_axle_model=drive_axle_model,
            drive_axle_factory_number=validated_data['drive_axle_factory_number'],
            steering_axle_model=steering_axle_model,
            steering_axle_factory_number=validated_data['steering_axle_factory_number'],
            delivery_contract=validated_data['delivery_contract'],
            shipment_date=validated_data['shipment_date'],
            consignee=validated_data['consignee'],
            delivery_address=validated_data['delivery_address'],
            configuration=validated_data['configuration'],
            client=client,
            service_company=service_company
        )

        machine.save()
        return machine
