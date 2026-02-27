from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from core.models import CustomUser


class Command(BaseCommand):
    help = "Создаёт первого суперадмина Django и привязывает его к группе Суперадмины"

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='godadmin',
            help='Имя пользователя для суперадмина (по умолчанию: godadmin)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='lordjesus',
            help='Пароль для суперадмина (по умолчанию: lordjesus)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='',
            help='Email для суперадмина (по умолчанию: пусто)'
        )

    def handle(self, *args, **options):
        try:
            superadmin_group = Group.objects.get(name="Суперадмин")
        except Group.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("Группа Суперадмин не найдена! Сначала запустите python manage.py setup-groups")
            )
            return

        username = options.get('username')
        password = options.get('password')
        email = options.get('email')

        if CustomUser.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.ERROR(f"Суперадмин с именем '{username}' уже существует!")
            )
            return

        try:
            user = CustomUser.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                user_type='superadmin',
                group=superadmin_group,
                user_description='Всем админам админ.',
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Суперадмин '{username}' успешно создан и привязан к группе Суперадмин"
                )
            )
            if email:
                self.stdout.write(f"Email: {email}")
            else:
                self.stdout.write("Email: не указан")

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Ошибка при создании суперадмина: {e}")
            )
