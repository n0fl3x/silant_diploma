from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    DictionaryEntry,
    Machine,
    Maintenance,
    Claim,
    CustomUser,
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = [
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
        "user_description",
    ]
    list_filter = [
        "is_staff",
        "is_superuser",
        "is_active",
        "groups",
    ]
    search_fields = [
        "username",
        "first_name",
        "last_name",
        "email",
    ]
    ordering = [
        "username",
    ]
    list_editable = []

    fieldsets = [
        (
            None,
            {
                "fields": (
                    "username",
                    "password",
                ),
            },
        ),
        (
            "Персональная информация",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "user_description",
                ),
            },
        ),
        (
            "Права",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Даты", {
                "fields": (
                    "last_login",
                    "date_joined",
                ),
                "classes": ("collapse", ),
            },
        ),
    ]

    add_fieldsets = [
        (
            None,
            {
                "classes": ("wide", ),
                "fields": (
                    "username",
                    "password1",
                    "password2",
                ),
            },
        ),
        (
            "Персональная информация", {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "user_description",
                ),
            },
        ),
        (
            "Права", {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                ),
            },
        ),
    ]

    readonly_fields = [
        "last_login",
        "date_joined",
    ]


@admin.register(DictionaryEntry)
class DictionaryEntryAdmin(admin.ModelAdmin):
    list_display = [
        "entity",
        "name",
        "description",
    ]
    list_filter = [
        "entity",
    ]
    search_fields = [
        "name",
        "description",
    ]
    ordering = [
        "entity",
        "name",
    ]

    fieldsets = [
        (
            "Основная информация",
            {
                "fields": (
                    "entity",
                    "name",
                ),
            },
        ),
        (
            "Описание",
            {
                "classes": ("collapse", ),
                "fields": (
                    "description",
                ),
            },
        ),
    ]


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = [
        "factory_number",
        "model_tech__name",
        "client",
        "service_company",
        "shipment_date",
    ]
    list_filter = [
        "model_tech",
        "client",
        "service_company",
        "shipment_date",
    ]
    search_fields = [
        "factory_number",
        "consignee",
    ]
    ordering = [
        "-shipment_date",
    ]

    fieldsets = [
        (
            "Основные данные",
            {
                "fields": (
                    "factory_number",
                    "model_tech",
                    "shipment_date",
                    "client",
                    "service_company",
                ),
            },
        ),
        (
            "Компоненты",
            {
                "classes": ("collapse", ),
                "fields": (
                    "engine_model",
                    "engine_factory_number",
                    "transmission_model",
                    "transmission_factory_number",
                    "drive_axle_model",
                    "drive_axle_factory_number",
                    "steering_axle_model",
                    "steering_axle_factory_number",
                ),
            },
        ),
        (
            "Доставка и комплектация",
            {
                "classes": ("collapse", ),
                "fields": (
                    "delivery_contract",
                    "consignee",
                    "delivery_address",
                    "configuration",
                ),
            },
        ),
    ]


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = [
        "machine__factory_number",
        "maintenance_type__name",
        "maintenance_date",
        "operating_hours",
        "work_order_number",
    ]
    list_filter = [
        "maintenance_type",
        "maintenance_date",
        "service_company",
        "machine__model_tech",
    ]
    search_fields = [
        "work_order_number",
        "machine__factory_number",
    ]
    date_hierarchy = "maintenance_date"
    ordering = [
        "-maintenance_date",
    ]

    fieldsets = [
        (
            "Основная информация",
            {
                "fields": (
                    "machine",
                    "maintenance_type",
                    "maintenance_date",
                    "operating_hours",
                ),
            },
        ),
        (
            "Заказ-наряд",
            {
                "classes": ("collapse", ),
                "fields": (
                    "work_order_number",
                    "work_order_date",
                ),
            },
        ),
        (
            "Организации",
            {
                "classes": ("collapse", ),
                "fields": (
                    "service_company",
                ),
            },
        ),
    ]


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = [
        "machine__factory_number",
        "failure_node__name",
        "failure_date",
        "recovery_date",
        "downtime_days",
    ]
    list_filter = [
        "failure_node",
        "failure_date",
        "recovery_date",
        "machine__model_tech",
    ]
    search_fields = [
        "failure_description",
        "spare_parts",
        "machine__factory_number",
    ]
    date_hierarchy = "failure_date"
    ordering = [
        "-failure_date",
    ]

    readonly_fields = [
        "downtime_days",
    ]

    fieldsets = [
        (
            "Отказ",
            {
                "fields": (
                    "machine",
                    "failure_date",
                    "operating_hours",
                    "failure_node",
                    "failure_description",
                ),
            },
        ),
        (
            "Восстановление",
            {
                "fields": (
                    "recovery_method",
                    "spare_parts",
                    "recovery_date",
                    "downtime_days",
                ),
            },
        ),
    ]
