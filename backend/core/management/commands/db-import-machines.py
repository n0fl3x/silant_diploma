"""
Кастомная команда - python manage.py db-import-machines
"""

import os
import pandas as pd

from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group
from django.db import IntegrityError

from core.models import Machine, DictionaryEntry, CustomUser


class Command(BaseCommand):
    help = "Import test data about machines from XLS file to DB"

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
                "..\..\..\\basic_data.xlsx",
            ),
        )

    def handle(
        self,
        *args,
        **options,
    ) -> None:
        excel_path = options["file"]

        if not os.path.exists(excel_path):
            raise CommandError(f"File not found: {excel_path}")

        self.stdout.write(
            self.style.SUCCESS(f"Starting import machines data from {excel_path}...")
        )

        self.load_machines(excel_path)

        self.stdout.write(
            self.style.SUCCESS("Machines import successfully completed!")
        )

    def load_machines(
        self,
        excel_path,
    ):
        """
        Загрузка машин из xls листа machines
        """
        self.stdout.write("Loading machines...")
        
        try:
            df = pd.read_excel(
                io=excel_path,
                sheet_name="machines",
                header=2,
                skiprows=0,
            )
        except Exception as e:
            raise CommandError(f"Error reading xls list machines: {e}")

        for idx, row in df.iterrows():
            try:
                factory_number = str(row["Зав. номер машины"])
                engine_factory_number = row["Зав. номер двигателя"].strip()
                transmission_factory_number = row["Зав. номер трансмиссии"].strip()
                steering_axle_factory_number = row["Зав. номер управляемого моста"].strip()
                drive_axle_factory_number = row["Зав. номер ведущего моста"].strip()
                consignee = row["Грузополучатель (конечный потребитель)"].strip()
                delivery_address = row["Адрес поставки (эксплуатации)"].strip()
                configuration = row["Комплектация (доп. опции)"].strip()

                # Этих полей в эксельке нет
                delivery_contract = None
                client = None
                
                # Шаманим дату из эксельки
                shipment_date=row["Дата отгрузки с завода"]
                try:
                    if isinstance(
                        shipment_date,
                        (int, float)
                    ):
                        shipment_date = datetime.fromtimestamp(shipment_date).date()
                    elif isinstance(
                        shipment_date,
                        datetime
                    ):
                        shipment_date = shipment_date.date()
                    else:
                        shipment_date = pd.to_datetime(shipment_date).date()
                except (ValueError, TypeError) as e:
                    self.stderr.write(
                        f"Row {idx + 4}: Cannot process shipment date: {shipment_date} ({e})",
                    )
                
                # Ищем или создаём сервисную компанию
                service_company_name = row["Сервисная компания"].strip()
                login = f"user-login-{idx + 4}"
                service_group= Group.objects.get(
                    name="Сервисная организация",
                )
                sc, sc_created = CustomUser.objects.get_or_create(
                    user_description=service_company_name,
                    defaults={
                        "username": login,
                        "user_description": f"{service_company_name}",
                    },
                )
                if sc_created:
                    sc.groups.add(service_group.pk)
                    sc.set_password(f"temp-password-{idx + 4}")
                    sc.save()
                    self.stdout.write(f"Created new service company {service_company_name}")

                # Ищем или создаём модель техники
                model_tech_name = row["Модель техники"].strip()
                mt, mt_created = DictionaryEntry.objects.get_or_create(
                    entity="machine_model",
                    name=model_tech_name,
                    defaults={
                        "description": f"Автосоздано для машины {factory_number}",
                    },
                )
                if mt_created:
                    self.stdout.write(f"New dictionary entry created: machine_model -> {model_tech_name}")

                # Ищем или создаём модель двигателя
                engine_model = row["Модель двигателя"].strip()
                em, em_created = DictionaryEntry.objects.get_or_create(
                    entity="engine_model",
                    name=engine_model,
                    defaults={
                        "description": f"Автосоздано для машины {factory_number}",
                    },
                )
                if em_created:
                    self.stdout.write(f"New dictionary entry created: engine_model -> {engine_model}")

                # Ищем или создаём модель трансмиссии
                transmission_model = row["Модель трансмиссии"].strip()
                tm, tm_created = DictionaryEntry.objects.get_or_create(
                    entity="transmission_model",
                    name=transmission_model,
                    defaults={
                        "description": f"Автосоздано для машины {factory_number}",
                    },
                )
                if tm_created:
                    self.stdout.write(f"New dictionary entry created: transmission_model -> {transmission_model}")

                # Ищем или создаём модель ведущего моста
                drive_axle_model = row["Модель ведущего моста"].strip()
                dam, dam_created = DictionaryEntry.objects.get_or_create(
                    entity="drive_axle_model",
                    name=drive_axle_model,
                    defaults={
                        "description": f"Автосоздано для машины {factory_number}",
                    },
                )
                if dam_created:
                    self.stdout.write(f"New dictionary entry created: drive_axle_model -> {drive_axle_model}")

                # Ищем или создаём модель управляемого моста
                steering_axle_model = row["Модель управляемого моста"]
                sam, sam_created = DictionaryEntry.objects.get_or_create(
                    entity="steering_axle_model",
                    name=steering_axle_model,
                    defaults={
                        "description": f"Автосоздано для машины {factory_number}",
                    },
                )
                if sam_created:
                    self.stdout.write(f"New dictionary entry created: steering_axle_model -> {steering_axle_model}")

                machine = Machine.objects.create(
                    factory_number=factory_number,
                    model_tech=mt,
                    engine_model=em,
                    engine_factory_number=engine_factory_number,
                    transmission_model=tm,
                    transmission_factory_number=transmission_factory_number,
                    drive_axle_model=dam,
                    drive_axle_factory_number=drive_axle_factory_number,
                    steering_axle_factory_number=steering_axle_factory_number,
                    steering_axle_model=sam,
                    delivery_contract=delivery_contract,
                    shipment_date=shipment_date,
                    consignee=consignee,
                    delivery_address=delivery_address,
                    configuration=configuration,
                    client=client,
                    service_company=sc,
                )
                self.stdout.write(f"Machine {machine.factory_number} created in DB")

            except IntegrityError as e:
                self.stderr.write(f"Unique objects error: {e}")
                continue
            except DictionaryEntry.DoesNotExist as e:
                self.stderr.write(f"Row {idx + 4}: DictionaryEntry object not found: {e}")
                continue
            except CustomUser.DoesNotExist as e:
                self.stderr.write(f"Row {idx + 4}: User not found: {e}")
                continue
            # except Exception as e:
            #     self.stderr.write(f"Row {idx + 4}: Machine {row['Зав. номер машины']} saving error: {e}")
            #     continue
