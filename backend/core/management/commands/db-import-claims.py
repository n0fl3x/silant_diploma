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

    def _parse_date(self, date_value):
        """Универсальная функция для парсинга дат из разных форматов"""
        if pd.isna(date_value) or date_value is None:
            return None

        try:
            if isinstance(date_value, (int, float)):
                return datetime.fromtimestamp(date_value).date()
            elif isinstance(date_value, datetime):
                return date_value.date()
            else:
                parsed = pd.to_datetime(date_value)
                if pd.notna(parsed):
                    return parsed.date()
        except (ValueError, TypeError, OverflowError):
            return None
        return None

    def load_claims(self, excel_path):
        """Загрузка записей о рекламациях из листа claims"""
        self.stdout.write("Loading claims records...")

        try:
            df = pd.read_excel(
                io=excel_path,
                sheet_name="claims",
                header=1,
            )
        except Exception as e:
            raise CommandError(f"Error reading xls sheet claims: {e}")

        for idx, row in df.iterrows():
            try:
                with transaction.atomic():
                    description = str(row.get("Описание отказа", "")).strip() or ""
                    used_parts = str(row.get("Используемые запасные части", "")).strip() or ""

                    factory_number = row.get("Зав. номер машины", "")
                    if pd.isna(factory_number) or not factory_number:
                        self.stderr.write(
                            f"Row {idx + 1}: Missing factory number. Skipping..."
                        )
                        continue

                    try:
                        machine = Machine.objects.get(factory_number=factory_number)
                    except Machine.DoesNotExist:
                        self.stderr.write(
                            f"Row {idx + 1}: Machine with factory number {factory_number} not found. Skipping..."
                        )
                        continue

                    failure_date = self._parse_date(row.get("Дата отказа"))
                    if failure_date is None:
                        self.stderr.write(
                            f"Row {idx + 1}: Invalid failure date: {row.get('Дата отказа')}. Skipping..."
                        )
                        continue

                    recovery_date = self._parse_date(row.get("Дата восстановления"))

                    try:
                        hour_meter = int(row.get("Наработка, м/час", 0))
                        if hour_meter < 0:
                            hour_meter = 0
                    except (ValueError, TypeError):
                        hour_meter = 0
                        self.stderr.write(
                            f"Row {idx + 1}: Invalid value for 'Наработка'. Using 0."
                        )

                    node_name = str(row.get("Узел отказа", "")).strip()
                    if not node_name:
                        failure_node, created = DictionaryEntry.objects.get_or_create(
                            entity="failure_node",
                            name="Не указан",
                            defaults={
                                "description": "Узел отказа не был указан в исходных данных",
                            },
                        )
                        if created:
                            self.stdout.write(
                                "Created default failure node: 'Не указан'"
                            )
                    else:
                        failure_node, created = DictionaryEntry.objects.get_or_create(
                            entity="failure_node",
                            name=node_name,
                            defaults={
                                "description": f"Автосоздано для машины {factory_number}",
                            },
                        )
                        if created:
                            self.stdout.write(
                                f"New dictionary entry created: failure_node -> {node_name}"
                            )

                    method_name = str(row.get("Способ восстановления", "")).strip() or "Неизвестно"
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

                    try:
                        downtime = int(row.get("Время простоя техники", 0))
                        if downtime < 0:
                            downtime = 0
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
                    self.stdout.write(
                        f"Claim record {claim.id} created for machine {factory_number}"
                    )

            except IntegrityError as e:
                self.stderr.write(f"Row {idx + 1}: Unique objects error: {e}")
            except Exception as e:
                self.stderr.write(f"Row {idx + 1}: Unexpected error: {e}")

        self.stdout.write(
            self.style.SUCCESS(f"Claims import completed!")
        )
