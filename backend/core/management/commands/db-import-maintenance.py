"""
Кастомная команда - python manage.py db-import-maintenance
Импортирует данные о ТО из XLS файла в БД, попутно создавая связанные объекты.
"""

import os
import pandas as pd

from datetime import datetime
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction

from core.models import (
    Machine,
    Maintenance,
    CustomUser,
    DictionaryEntry,
)


class Command(BaseCommand):
    help = "Import maintenance records from XLS file to DB"

    def add_arguments(
        self,
        parser,
    ) -> None:
        parser.add_argument(
            "--file",
            type=str,
            help="Excel file full path",
            default=os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                "..", "..", "..",
                "basic_data.xlsx",
            ),
        )
        

    def handle(
        self,
        *args,
        **options,
    ):
        excel_path = options["file"]

        if not os.path.exists(excel_path):
            raise CommandError(f"File not found: {excel_path}")

        self.stdout.write(f"Starting import maintenance data from {excel_path}...")

        try:
            self.load_maintenance(excel_path)
            self.stdout.write(
                self.style.SUCCESS("Maintenance import completed successfully!")
            )
        except Exception as e:
            raise CommandError(f"Import failed: {e}")

    def load_maintenance(
        self,
        excel_path,
    ):
        """
        Загрузка записей о ТО из xls листа maintenances
        """
        self.stdout.write("Loading maintenance records...")

        try:
            df = pd.read_excel(
                io=excel_path,
                sheet_name="maintenances",
            )
        except Exception as e:
            raise CommandError(f"Error reading xls sheet maintenances: {e}")
        
        service_group = Group.objects.get(
            name="Сервисная организация",
        )

        with transaction.atomic():
            for idx, row in df.iterrows():
                try:
                    work_order_number = str(row["Номер заказ-наряда"])

                    factory_number = str(row["Зав. номер машины"]).strip()
                    try:
                        machine = Machine.objects.get(
                            factory_number=factory_number,
                        )
                    except Machine.DoesNotExist:
                        self.stderr.write(
                            f"Row {idx}: Machine with factory number {factory_number} not found. Skipping..."
                        )
                        continue

                    maintenance_date = row["Дата проведения ТО"]
                    try:
                        if isinstance(
                            maintenance_date,
                            (int, float)
                        ):
                            maintenance_date = datetime.fromtimestamp(maintenance_date).date()
                        elif isinstance(
                            maintenance_date,
                            datetime
                        ):
                            maintenance_date = maintenance_date.date()
                        else:
                            maintenance_date = pd.to_datetime(maintenance_date).date()
                    except (ValueError, TypeError) as e:
                        self.stderr.write(
                            f"Row {idx}: Invalid maintenance date: {maintenance_date} ({e})"
                        )

                    service_company_name = str(row["Организация, проводившая ТО"]).strip()
                    if service_company_name.lower() == "самостоятельно":
                        sc = machine.client
                    else:
                        sc_login = f"serv-comp-login-{idx}-{idx}"
                        sc, sc_created = CustomUser.objects.get_or_create(
                            user_description=service_company_name,
                            defaults={
                                "username": sc_login,
                                "user_description": service_company_name,
                            },
                        )
                        if sc_created:
                            sc.groups.add(service_group.pk)
                            sc.set_password(f"sc-temp-password-{idx}-{idx}")
                            sc.save()
                            self.stdout.write(f"Created new service company {service_company_name}")

                    maintenance_type_name = str(row["Вид ТО"]).strip()
                    mtt, mtt_created = DictionaryEntry.objects.get_or_create(
                        entity="maintenance_type",
                        name=maintenance_type_name,
                        defaults={
                            "description": f"Автосоздано для машины {factory_number}"
                        },
                    )
                    if mtt_created:
                        self.stdout.write(
                            f"New dictionary entry created: maintenance_type -> {maintenance_type_name}"
                        )

                    try:
                        hour_meter = int(row["Наработка, м/час"])
                    except (ValueError, TypeError):
                        hour_meter = 0
                        self.stderr.write(
                            f"Row {idx}: Invalid value for 'Наработка, м/час': {row['Наработка, м/час']}. Using 0."
                        )

                    work_order_date = row["Дата заказ-наряда"]
                    try:
                        if isinstance(
                            work_order_date,
                            (int, float)
                        ):
                            work_order_date = datetime.fromtimestamp(work_order_date).date()
                        elif isinstance(
                            work_order_date,
                            datetime
                        ):
                            work_order_date = work_order_date.date()
                        else:
                            work_order_date = pd.to_datetime(work_order_date).date()
                    except (ValueError, TypeError) as e:
                        self.stderr.write(
                            f"Row {idx}: Invalid maintenance date: {work_order_date} ({e})"
                        )

                    maintenance = Maintenance(
                        maintenance_type=mtt,
                        maintenance_date=maintenance_date,
                        operating_hours=hour_meter,
                        work_order_number=work_order_number,
                        work_order_date=work_order_date,
                        machine=machine,
                        service_company=sc,
                    )

                    maintenance.save()
                    self.stdout.write(f"Maintenance record {maintenance.id} created for machine {factory_number}")

                except IntegrityError as e:
                    self.stderr.write(f"Row {idx}: Unique objects error: {e}")
                    continue
                except DictionaryEntry.DoesNotExist as e:
                    self.stderr.write(f"Row {idx}: DictionaryEntry object not found: {e}")
                    continue
                except CustomUser.DoesNotExist as e:
                    self.stderr.write(f"Row {idx}: User not found: {e}")
                    continue
                except Exception as e:
                    self.stderr.write(f"Row {idx}: Machine {row['Зав. номер машины']} saving error: {e}")
                    continue
