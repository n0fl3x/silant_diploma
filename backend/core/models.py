import datetime

from django.contrib import admin
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """
    Кастомный класс пользователя для управления доступами.
    """
    USER_TYPE_CHOICES = [
        ('client', 'Клиент'),
        ('service_company', 'Сервисная компания'),
        ('manager', 'Менеджер'),
        ('superadmin', 'Суперадмин'),
    ]
    group = models.ForeignKey(
        to="auth.Group",
        on_delete=models.PROTECT,
        verbose_name="Группа",
        blank=False,
        null=False,
        help_text="Группа, к которой принадлежит пользователь.",
        related_name="users",
        related_query_name="user",
    )

    user_permissions = models.ManyToManyField(
        to="auth.Permission",
        verbose_name="Разрешения пользователя",
        blank=True,
        help_text="Специфические разрешения для этого пользователя",
        related_name="customuser_permissions",
        related_query_name="customuser",
    )

    user_description = models.CharField(
        max_length=255,
        blank=False,
        null=False,
        unique=True,
        verbose_name="Обязательное писание пользователя",
    )

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='client',
        verbose_name="Тип пользователя",
        help_text="Роль пользователя в системе"
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        unique_together = ('user_type', 'user_description')
    
    @property
    def is_manager(self):
        return self.user_type == 'manager'

    @property
    def is_service_company(self):
        return self.user_type == 'service_company'

    @property
    def is_client(self):
        return self.user_type == 'client'

    def __str__(self):
        if self.user_description:
            return f"{self.username} - {self.user_description} ({self.user_type})"
        return f"{self.username} ({self.user_type})"


class DictionaryEntry(models.Model):
    """
    Справочная таблица для хранения списков значений (модели техники, виды ТО, узлы отказа и т.п.)
    """
    ENTITY_CHOICES = [
        (
            "machine_model",
            "Модель техники",
        ),
        (
            "engine_model",
            "Модель двигателя",
        ),
        (
            "transmission_model",
            "Модель трансмиссии",
        ),
        (
            "steering_axle_model",
            "Модель управляемого моста",
        ),
        (
            "drive_axle_model",
            "Модель ведущего моста",
        ),
        (
            "maintenance_type",
            "Вид ТО",
        ),
        (
            "failure_node",
            "Узел отказа",
        ),
        (
            "recovery_method",
            "Способ восстановления",
        ),
    ]

    entity = models.CharField(
        max_length=50,
        choices=ENTITY_CHOICES,
        verbose_name="Тип справочника",
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Значение",
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Описание",
    )

    class Meta:
        verbose_name = "Элемент справочника"
        verbose_name_plural = "Элементы справочников"
        unique_together = (
            "entity",
            "name",
        )

    def __str__(self):
        return f"{self.name} ({self.entity})"


class Machine(models.Model):
    # 1. Зав. № машины (уникальный номер)
    factory_number = models.CharField(
        max_length=50,
        unique=True,
        blank=False,
        null=False,
        verbose_name="Зав. номер машины",
    )

    # 2. Модель техники (справочник)
    model_tech = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "machine_model",
        },
        verbose_name="Модель техники",
    )

    # 3. Модель двигателя (справочник)
    engine_model = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "engine_model",
        },
        verbose_name="Модель двигателя",
        related_name="machines_as_engine_model",
    )

    # 4. Зав. № двигателя (свободный ввод)
    engine_factory_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Зав. номер двигателя",
    )

    # 5. Модель трансмиссии (справочник)
    transmission_model = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "transmission_model",
        },
        verbose_name="Модель трансмиссии",
        related_name="machines_as_transmission_model",
    )

    # 6. Зав. № трансмиссии (свободный ввод)
    transmission_factory_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Зав. номер трансмиссии",
    )

    # 7. Модель ведущего моста (справочник)
    drive_axle_model = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "drive_axle_model",
        },
        verbose_name="Модель ведущего моста",
        related_name="machines_as_drive_axle_model",
    )

    # 8. Зав. № ведущего моста (свободный ввод)
    drive_axle_factory_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Зав. номер ведущего моста",
    )

    # 9. Модель управляемого моста (справочник)
    steering_axle_model = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "steering_axle_model",
        },
        verbose_name="Модель управляемого моста",
        related_name="machines_as_steering_axle_model",
    )

    # 10. Зав. № управляемого моста (свободный ввод)
    steering_axle_factory_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Зав. номер управляемого моста",
    )

    # 11. Договор поставки №, дата (свободный ввод)
    delivery_contract = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Договор поставки номер, дата",
    )

    # 12. Дата отгрузки с завода (календарь)
    shipment_date = models.DateField(
        verbose_name="Дата отгрузки с завода",
    )

    # 13. Грузополучатель (конечный потребитель) (свободный ввод)
    consignee = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name="Грузополучатель (конечный потребитель)",
    )

    # 14. Адрес поставки (эксплуатации) (свободный ввод)
    delivery_address = models.TextField(
        blank=True,
        null=True,
        verbose_name="Адрес поставки (эксплуатации)",
    )

    # 15. Комплектация (доп. опции) (свободный ввод)
    configuration = models.TextField(
        blank=True,
        null=True,
        verbose_name="Комплектация (доп. опции)",
    )

    # 16. Клиент (справочник пользователей)
    client = models.ForeignKey(
        to=CustomUser,
        on_delete=models.PROTECT,
        related_name="machines_as_client",
        verbose_name="Клиент",
        null=False,
        blank=False,
    )

    # 17. Сервисная компания (справочник пользователей)
    service_company = models.ForeignKey(
        to=CustomUser,
        on_delete=models.PROTECT,
        related_name="machines_as_service_company",
        verbose_name="Сервисная компания",
        null=False,
        blank=False,
    )

    class Meta:
        verbose_name = "Машина"
        verbose_name_plural = "Машины"
        ordering = [
            "shipment_date",
        ]

    def clean(self):
        super().clean()
        if self.shipment_date and self.shipment_date > timezone.now().date():
            raise ValidationError({
                'shipment_date': 'Дата отгрузки с завода не может быть больше текущей даты.'
            })

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.model_tech.name} (№{self.factory_number})"
    

class Maintenance(models.Model):
    # 1. Вид ТО (справочник)
    maintenance_type = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "maintenance_type",
        },
        verbose_name="Вид ТО",
    )

    # 2. Дата проведения ТО (календарь)
    maintenance_date = models.DateField(
        verbose_name="Дата проведения ТО",
    )

    # 3. Наработка, м/час (числовое поле)
    operating_hours = models.PositiveIntegerField(
        verbose_name="Наработка, м/час",
    )

    # 4. № заказ-наряда (свободный ввод)
    work_order_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="№ заказ-наряда",
    )

    # 5. Дата заказ-наряда (календарь)
    work_order_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Дата заказ-наряда",
    )

    # 7. Машина (связь с базой данных машин)
    machine = models.ForeignKey(
        to=Machine,
        on_delete=models.PROTECT,
        verbose_name="Машина",
        related_name="maintenance_events",
    )

    # 8. Сервисная компания (справочник пользователей с правами)
    service_company = models.ForeignKey(
        to=CustomUser,
        on_delete=models.PROTECT,
        verbose_name="Сервисная компания",
        related_name="company_maintenance_records",
    )

    class Meta:
        verbose_name = "Техническое обслуживание (ТО)"
        verbose_name_plural = "Технические обслуживания (ТО)"
        ordering = [
            "maintenance_date",
        ]

    def __str__(self):
        return f"ТО {self.maintenance_type.name} для {self.machine.factory_number}"
    
    def clean(self):
        super().clean()

        if self.maintenance_date and self.maintenance_date > timezone.now().date():
            raise ValidationError({
                'maintenance_date': 'Дата проведения ТО не может быть больше текущей даты.'
            })

        if (self.work_order_date and self.maintenance_date
                and self.work_order_date > self.maintenance_date):
            raise ValidationError({
                'work_order_date': 'Дата заказ-наряда не может быть позже даты проведения ТО.'
            })

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class Claim(models.Model):
    # 1. Дата отказа (календарь)
    failure_date = models.DateField(
        verbose_name="Дата отказа",
    )

    # 2. Наработка, м/час (числовое поле)
    operating_hours = models.PositiveIntegerField(
        verbose_name="Наработка, м/час",
    )

    # 3. Узел отказа (справочник)
    failure_node = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "failure_node",
        },
        verbose_name="Узел отказа",
        related_name="claims_as_failure_node",
    )

    # 4. Описание отказа (свободный ввод)
    failure_description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Описание отказа",
    )

    # 5. Способ восстановления (справочник)
    recovery_method = models.ForeignKey(
        to=DictionaryEntry,
        on_delete=models.PROTECT,
        limit_choices_to={
            "entity": "recovery_method",
        },
        verbose_name="Способ восстановления",
        related_name="claims_as_recovery_method",
        blank=True,
        null=True,
    )

    # 6. Используемые запасные части (свободный ввод)
    spare_parts = models.TextField(
        blank=True,
        null=True,
        verbose_name="Используемые запасные части",
    )

    # 7. Дата восстановления (календарь)
    recovery_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Дата восстановления",
    )

    # 8. Время простоя техники (расчётное поле: recovery_date - failure_date)
    downtime_days = models.PositiveIntegerField(
        editable=False,
        default=0,
        verbose_name="Время простоя техники (дни)",
    )

    # 9. Машина (связь с базой данных машин)
    machine = models.ForeignKey(
        to=Machine,
        on_delete=models.PROTECT,
        verbose_name="Машина",
        related_name="claims",
    )

    class Meta:
        verbose_name = "Рекламация"
        verbose_name_plural = "Рекламации"
        ordering = [
            "failure_date",
        ]

    def __str__(self):
        return f"Рекламация {self.failure_node.name} для {self.machine.factory_number}"
    
    def clean(self):
        super().clean()

        if self.failure_date and self.failure_date > timezone.now().date():
            raise ValidationError({
                'failure_date': 'Дата отказа не может быть больше текущей даты.'
            })

        if self.recovery_date and self.recovery_date > timezone.now().date():
            raise ValidationError({
                'recovery_date': 'Дата восстановления не может быть больше текущей даты.'
            })

        if self.recovery_date and self.failure_date and self.recovery_date < self.failure_date:
            raise ValidationError({
                'recovery_date': 'Дата восстановления не может быть раньше даты отказа.'
            })

    def save(self, *args, **kwargs):
        self.clean()

        self.downtime_days = 0

        if self.failure_date and self.recovery_date:
            try:
                failure_date = self.failure_date
                if isinstance(failure_date, datetime.datetime):
                    failure_date = failure_date.date()

                recovery_date = self.recovery_date
                if isinstance(recovery_date, datetime.datetime):
                    recovery_date = recovery_date.date()

                if recovery_date >= failure_date:
                    delta = recovery_date - failure_date
                    self.downtime_days = delta.days
            except (TypeError, AttributeError):
                self.downtime_days = 0

        super().save(*args, **kwargs)
