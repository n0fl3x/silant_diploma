from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from core.models import Machine, Maintenance, Claim

class Command(BaseCommand):
    help = "Создаёт все группы пользователей с соответствующими разрешениями"

    def handle(self, *args, **options):
        self.stdout.write("Начало создания групп пользователей...")

        client_group, client_created = Group.objects.get_or_create(name="Клиент")
        service_group, service_created = Group.objects.get_or_create(name="Сервисная организация")
        manager_group, manager_created = Group.objects.get_or_create(name="Менеджер")
        superadmin_group, superadmin_created = Group.objects.get_or_create(name="Суперадмин")

        machine_ct = ContentType.objects.get_for_model(Machine)
        maintenance_ct = ContentType.objects.get_for_model(Maintenance)
        claim_ct = ContentType.objects.get_for_model(Claim)

        client_perms = [
            ("view_machine", machine_ct),
            ("view_maintenance", maintenance_ct),
            ("add_maintenance", maintenance_ct),
            ("change_maintenance", maintenance_ct),
            ("view_claim", claim_ct),
        ]

        for codename, content_type in client_perms:
            try:
                permission = Permission.objects.get(codename=codename, content_type=content_type)
                client_group.permissions.add(permission)
            except Permission.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"Разрешение {codename} не найдено для типа контента {content_type}")
                )

        if client_created:
            self.stdout.write(self.style.SUCCESS("Группа «Клиент» успешно создана"))
        else:
            self.stdout.write("Группа «Клиент» уже существует, обновлены разрешения")

        service_perms = [
            ("view_machine", machine_ct),
            ("view_maintenance", maintenance_ct),
            ("add_maintenance", maintenance_ct),
            ("change_maintenance", maintenance_ct),
            ("view_claim", claim_ct),
            ("add_claim", claim_ct),
            ("change_claim", claim_ct),
        ]

        for codename, content_type in service_perms:
            try:
                permission = Permission.objects.get(codename=codename, content_type=content_type)
                service_group.permissions.add(permission)
            except Permission.DoesNotExist:
                self.stdout.write(
            self.style.ERROR(f"Разрешение {codename} не найдено для типа контента {content_type}")
                )

        if service_created:
            self.stdout.write(self.style.SUCCESS("Группа «Сервисная организация» успешно создана"))
        else:
            self.stdout.write("Группа «Сервисная организация» уже существует, обновлены разрешения")

        manager_perms = Permission.objects.filter(content_type__app_label='core')
        manager_group.permissions.set(manager_perms)

        if manager_created:
            self.stdout.write(self.style.SUCCESS("Группа «Менеджер» успешно создана с разрешениями на бизнес‑модели"))
        else:
            self.stdout.write("Группа «Менеджер» уже существует, обновлены разрешения (бизнес‑модели)")

        all_perms = Permission.objects.all()
        superadmin_group.permissions.set(all_perms)

        if superadmin_created:
            self.stdout.write(self.style.SUCCESS("Группа «Суперадмин» успешно создана со всеми разрешениями"))
        else:
            self.stdout.write("Группа «Суперадмин» уже существует, обновлены разрешения (все доступные)")


        self.stdout.write(
            self.style.SUCCESS("\nВсе группы пользователей успешно созданы/обновлены!")
        )
