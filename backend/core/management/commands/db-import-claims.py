"""
Кастомная команда - python manage.py db-import-claims
Импортирует данные о рекламациях из XLS файла в БД.
"""

import os
import pandas as pd

from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction

from core.models import Machine, Claim, DictionaryEntry


class Command(BaseCommand):
    help = "Import claims records from XLS file to DB"

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

        self.stdout.write(f"Starting import claim data from {excel_path}...")

        try:
            self.load_claims(excel_path)
            self.stdout.write(
                self.style.SUCCESS("Claims import completed successfully!")
            )
        except Exception as e:
            raise CommandError(f"Import failed: {e}")

    def load_claims(
        self,
        excel_path,
    ):
        """
        Загрузка записей о рекламациях из листа claims
        """
        self.stdout.write("Loading claims records...")

        try:
            df = pd.read_excel(
                io=excel_path,
                sheet_name="claims",
                header=1,
            )
        except Exception as e:
            raise CommandError(f"Error reading xls sheet claims: {e}")

        with transaction.atomic():
            for idx, row in df.iterrows():
                try:
                    description = str(row["Описание отказа"]).strip() or ""
                    used_parts = str(row["Используемые запасные части"]).strip() or ""

                    factory_number = row["Зав. номер машины"]
                    try:
                        machine = Machine.objects.get(
                            factory_number=factory_number,
                        )
                    except Machine.DoesNotExist:
                        self.stderr.write(
                            f"Row {idx + 1}: Machine with factory number {factory_number} not found. Skipping..."
                        )
                        continue

                    failure_date = row["Дата отказа"]
                    try:
                        if isinstance(
                            failure_date,
                            (int, float)
                        ):
                            failure_date = datetime.fromtimestamp(failure_date).date()
                        elif isinstance(
                            failure_date,
                            datetime
                        ):
                            failure_date = failure_date.date()
                        else:
                            failure_date = pd.to_datetime(failure_date).date()
                    except (ValueError, TypeError) as e:
                        self.stderr.write(
                            f"Row {idx + 1}: Invalid maintenance date: {failure_date} ({e})"
                        )

                    try:
                        hour_meter = int(row["Наработка, м/час"])
                    except (ValueError, TypeError):
                        hour_meter = 0
                        self.stderr.write(
                            f"Row {idx + 1}: Invalid value for 'Наработка'. Using 0."
                        )

                    node_name = str(row["Узел отказа"]).strip()
                    failure_node, fn_created = DictionaryEntry.objects.get_or_create(
                        entity="failure_node",
                        name=node_name,
                        defaults={
                            "description": f"Автосоздано для машины {factory_number}",
                        },
                    )
                    if fn_created:
                        self.stdout.write(
                            f"New dictionary entry created: failure_node -> {node_name}"
                        )

                    method_name = str(row["Способ восстановления"]).strip() or "Неизвестно"
                    recovery_method, rm_created = DictionaryEntry.objects.get_or_create(
                        entity="recovery_method",
                        name=method_name,
                        defaults={
                            "description": f"Автосоздано для машины {factory_number}",
                        },
                    )
                    if rm_created:
                        self.stdout.write(
                            f"New dictionary entry created: recovery_method -> {method_name}"
                        )

                    recovery_date = row["Дата восстановления"]
                    try:
                        if isinstance(
                            recovery_date,
                            (int, float),
                        ):
                            recovery_date = datetime.fromtimestamp(recovery_date).date()
                        elif isinstance(
                            recovery_date,
                            datetime,
                        ):
                            recovery_date = recovery_date.date()
                        else:
                            recovery_date = pd.to_datetime(recovery_date).date()
                    except (ValueError, TypeError) as e:
                        self.stderr.write(
                            f"Row {idx + 1}: Invalid maintenance date: {recovery_date} ({e})"
                        )

                    try:
                        downtime = int(row["Время простоя техники"])
                    except (ValueError, TypeError):
                        downtime = 0
                        self.stderr.write(
                            f"Row {idx + 1}: Invalid value for 'Время простоя': Using 0."
                        )

                    claim = Claim(
                        failure_date=failure_date,
                        operating_hours=hour_meter,
                        failure_node=failure_node,
                        failure_description=description,
                        recovery_method=recovery_method,
                        spare_parts=used_parts,
                        recovery_date=recovery_date,
                        downtime_days=downtime,
                        machine=machine,
                    )

                    claim.save()
                    self.stdout.write(f"Claim record {claim.id} created for machine {factory_number}")

                except IntegrityError as e:
                    self.stderr.write(f"Row {idx + 1}: Unique objects error: {e}")
                    continue
                except DictionaryEntry.DoesNotExist as e:
                    self.stderr.write(f"Row {idx + 1}: DictionaryEntry object not found: {e}")
                    continue
                except Exception as e:
                    self.stderr.write(f"Row {idx + 1}: Machine {row['Зав. номер машины']} saving error: {e}")
                    continue
