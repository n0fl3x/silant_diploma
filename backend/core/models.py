import datetime

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError


class CustomUser(AbstractUser):
    """
    Класс управления доступами.
    """
    groups = models.ManyToManyField(
        to="auth.Group",
        verbose_name="Группы",
        blank=True,
        help_text="Группы, к которым принадлежит пользователь.",
        related_name="customuser_groups",
        related_query_name="customuser",
    )

    user_permissions = models.ManyToManyField(
        to="auth.Permission",
        verbose_name="Разрешения пользователя",
        blank=True,
        help_text="Специфические разрешения для этого пользователя.",
        related_name="customuser_permissions",
        related_query_name="customuser",
    )


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

    # Поле entity определяет, к какой сущности относится запись ('machine_model', 'maintenance_type' и т.д.)
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
        # Уникальность внутри типа справочника
        unique_together = (
            "entity",
            "name",
        )

    def __str__(self):
        return f"{self.name} ({self.entity})"


class ServiceCompany(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
        help_text="Обязательное поле. Максимальное количество символов — 255.",
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Описание",
        help_text="Необязательное поле. Можно оставить пустым.",
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Сервисная компания"
        verbose_name_plural = "Сервисные компании"
        ordering = [
            "name",
        ]


class Machine(models.Model):
    # 1. Зав. № машины (уникальный номер)
    factory_number = models.CharField(
        max_length=50,
        unique=True,
        validators=[
            MinLengthValidator(3),
        ],
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
        on_delete=models.CASCADE,
        related_name="machines",
        verbose_name="Клиент",
        null=True,
    )

    # 17. Сервисная компания (справочник пользователей)
    service_company = models.ForeignKey(
        to=ServiceCompany,
        on_delete=models.CASCADE,
        related_name="serviced_machines",
        verbose_name="Сервисная компания",
    )

    class Meta:
        verbose_name = "Машина"
        verbose_name_plural = "Машины"
        ordering = [
            "shipment_date",
        ]

        permissions = [
            (
                "view_machine_limited",
                "Просмотр ограниченных полей машины",
            ),
        ]

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

    # 6. Организация, проводившая ТО (справочник пользователей)
    service_organization = models.ForeignKey(
        to=CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={
            "groups__name": "Сервисные организации",
        },
        verbose_name="Организация, проводившая ТО",
        related_name="maintenance_records",
    )

    # 7. Машина (связь с базой данных машин)
    machine = models.ForeignKey(
        to=Machine,
        on_delete=models.CASCADE,
        verbose_name="Машина",
        related_name="maintenance_events",
    )

    # 8. Сервисная компания (справочник пользователей с правами)
    service_company = models.ForeignKey(
        to=CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={
            "groups__name": "Сервисные компании",
        },
        verbose_name="Сервисная компания",
        related_name="company_maintenance_records",
    )

    class Meta:
        verbose_name = "Техническое обслуживание (ТО)"
        verbose_name_plural = "Технические обслуживания (ТО)"
        ordering = [
            "maintenance_date",
        ]

        permissions = [
            (
                "approve_maintenance",
                "Подтверждать ТО",
            ),
        ]

    def __str__(self):
        return f"ТО {self.maintenance_type.name} для {self.machine.factory_number}"


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
        on_delete=models.CASCADE,
        verbose_name="Машина",
        related_name="claims",
    )

    # 10. Сервисная компания (справочник пользователей с правами)
    service_company = models.ForeignKey(
        to=CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={
            "groups__name": "Сервисные компании",
        },
        verbose_name="Сервисная компания",
        related_name="company_claims",
    )

    class Meta:
        verbose_name = "Рекламация"
        verbose_name_plural = "Рекламации"
        ordering = [
            "failure_date",
        ]

        permissions = [
            (
                "close_claim",
                "Закрывать рекламацию",
            ),
            (
                "reopen_claim",
                "Переоткрывать рекламацию",
            ),
        ]

    def __str__(self):
        return f"Рекламация {self.failure_node.name} для {self.machine.factory_number}"
    
    def clean(self):
        if self.recovery_date and self.failure_date and self.recovery_date < self.failure_date:
            raise ValidationError(
                message="Дата восстановления не может быть раньше даты отказа.",
            )

    def save(
        self,
        *args,
        **kwargs
    ):
        """
        Переопределение метода save() для автоматического расчёта downtime_days.
        """
        try:
            if isinstance(
                self.failure_date,
                (
                    datetime.date,
                    datetime.datetime
                )
            ) and \
            isinstance(
                self.recovery_date,
                (
                    datetime.date,
                    datetime.datetime
                )
            ):

                failure_date = self.failure_date.date() \
                    if isinstance(self.failure_date, datetime.datetime) \
                    else self.failure_date
                recovery_date = self.recovery_date.date() \
                    if isinstance(self.recovery_date, datetime.datetime) \
                    else self.recovery_date

                if recovery_date >= failure_date:
                    delta = recovery_date - failure_date
                    self.downtime_days = delta.days
                else:
                    self.downtime_days = 0

            else:
                self.downtime_days = 0

        except (
            TypeError,
            AttributeError
        ):
            self.downtime_days = 0

        super().save(
            *args,
            **kwargs
        )
