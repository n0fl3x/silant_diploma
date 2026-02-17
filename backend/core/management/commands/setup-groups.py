from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from core.models import Machine, Maintenance, Claim


class Command(BaseCommand):
    help = "Creates permission groups"

    def handle(
        self,
        *args,
        **options
    ):
        client_group, _ = Group.objects.get_or_create(
            name="Клиент",
        )
        service_group, _ = Group.objects.get_or_create(
            name="Сервисная организация",
        )
        manager_group, _ = Group.objects.get_or_create(
            name="Менеджер",
        )

        machine_ct = ContentType.objects.get_for_model(
            model=Machine,
        )
        maintenance_ct = ContentType.objects.get_for_model(
            model=Maintenance,
        )
        claim_ct = ContentType.objects.get_for_model(
            model=Claim,
        )

        client_perms = [
            (
                "view_machine",
                machine_ct,
            ),
            (
                "view_maintenance",
                maintenance_ct,
            ),
            (
                "add_maintenance",
                maintenance_ct,
            ),
            (
                "change_maintenance",
                maintenance_ct,
            ),
            (
                "view_claim",
                claim_ct,
            ),
        ]
        for codename, content_type in client_perms:
            permission = Permission.objects.get(
                codename=codename,
                content_type=content_type,
            )
            client_group.permissions.add(permission)
        self.stdout.write("Client group created")

        service_perms = [
            (
                "view_machine",
                machine_ct,
            ),
            (
                "view_maintenance",
                maintenance_ct,
            ),
            (
                "add_maintenance",
                maintenance_ct,
            ),
            (
                "change_maintenance",
                maintenance_ct,
            ),
            (
                "view_claim",
                claim_ct,
            ),
            (
                "add_claim",
                claim_ct,
            ),
            (
                "change_claim",
                claim_ct,
            ),
        ]
        for codename, content_type in service_perms:
            permission = Permission.objects.get(
                codename=codename,
                content_type=content_type,
            )
            service_group.permissions.add(permission)
        self.stdout.write("Service company group created")

        # Менеджер — все разрешения
        all_perms = Permission.objects.all()
        manager_group.permissions.set(all_perms)
        self.stdout.write("Manager group created")

        self.stdout.write(
            self.style.SUCCESS("Permission groups successfully created!")
        )
