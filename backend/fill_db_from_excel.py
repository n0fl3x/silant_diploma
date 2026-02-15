"""
Скрипт для импорта данных из Excel-файла с тестовыми данными в таблицы БД SQLite.
"""

import os
import sys
import pandas as pd
import django

from django.core.exceptions import ObjectDoesNotExist


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "silant_project.settings",
)
django.setup()


from core.models import (
    Machine,
    Maintenance,
    Claim,
    DictionaryEntry,
)


def load_machines_from_xls(
        excel_path: str
) -> None:
    """
    Загрузка машин из листа machines
    """
    try:
        df = pd.read_excel(
            io=excel_path,
            sheet_name="machines",
            header=2,
            skiprows=0,
        )
    except Exception as e:
        print(f"Ошибка чтения Excel: {e}")
        return

    for idx, row in df.iterrows():
        try:
            model_tech = DictionaryEntry.objects.get(
                entity="machine_model",
                name=row["Модель техники"],
            )
            client = User.objects.get(
                username=row["Покупатель"],
            )
            service_company = User.objects.get(
                username=row["Сервисная компания"],
            )

            machine = Machine.objects.create(
                factory_number=row["Зав. № машины"],
                model_tech=model_tech,
                shipment_date=row["Дата отгрузки с завода"],
                client=client,
                service_company=service_company,
                engine_factory_number=row.get(
                    key="Зав. № двигателя",
                    default="",
                ),
                transmission_factory_number=row.get(
                    key="Зав. № трансмиссии",
                    default="",
                ),
                drive_axle_factory_number=row.get(
                    key="Зав. № ведущего моста",
                    default="",
                ),
                steering_axle_factory_number=row.get(
                    key="steering_axle_factory_number",
                    default="",
                ),
                delivery_contract=None,
                consignee=row.get(
                    key="Грузополучатель (конечный потребитель)",
                    default="",
                ),
                delivery_address=row.get(
                    key="Адрес поставки (эксплуатации)",
                    default="",
                ),
                configuration=row.get(
                    key="Комплектация (доп. опции)",
                    default="",
                ),
            )
            print(f"✓ Машина {machine.factory_number} создана.")
        except ObjectDoesNotExist as e:
            print(f"✗ Ошибка в строке {idx + 2}: {e}")
        except Exception as e:
            print(f"✗ Ошибка при сохранении машины {row["Зав. № машины"]}: {e}")


# def load_maintenance(excel_path):
#     """Загрузка ТО из листа «ТО»"""
#     print("Загрузка ТО...")
#     df = pd.read_excel(excel_path, sheet_name='ТО')

#     for idx, row in df.iterrows():
#         try:
#             machine = Machine.objects.get(factory_number=row['machine_factory_number'])
#             maintenance_type = DictionaryEntry.objects.get(
#                 entity='maintenance_type',
#                 name=row['maintenance_type']
#             )
#             service_organization = User.objects.get(username=row['service_organization'])
#             service_company = User.objects.get(username=row['service_company'])

#             maintenance = Maintenance.objects.create(
#                 machine=machine,
#                 maintenance_type=maintenance_type,
#                 maintenance_date=row['maintenance_date'],
#                 operating_hours=row['operating_hours'],
#                 work_order_number=row.get('work_order_number', ''),
#                 work_order_date=row.get('work_order_date'),
#                 service_organization=service_organization,
#                 service_company=service_company,
#             )
#             print(f"✓ ТО {maintenance.work_order_number} создано")
#         except ObjectDoesNotExist as e:
#             print(f"✗ Ошибка в строке {idx + 2}: {e}")
#         except Exception as e:
#             print(f"✗ Ошибка при сохранении ТО {row.get('work_order_number', 'N/A')}: {e}")




# def load_claims(excel_path):
#     """Загрузка рекламаций из листа «Рекламации»"""
#     print("Загрузка рекламаций...")
#     df = pd.read_excel(excel_path, sheet_name='Рекламации')

#     for idx, row in df.iterrows():
#         try:
#             machine = Machine.objects.get(factory_number=row['machine_factory_number'])
#             failure_node = DictionaryEntry.objects.get(
#                 entity='failure_node',
#                 name=row['failure_node']
#             )
#             recovery_method = DictionaryEntry.objects.get(
#                 entity='recovery_method',
#                 name=row['recovery_method']
#             ) if pd.notna(row['recovery_method']) else None
#             service_company = User.objects.get(username=row['service_company'])

#             claim = Claim.objects.create(
#                 machine=machine,
#                 failure_date=row['failure_date'],
#                 operating_hours=row['operating_hours'],
#                 failure_node=failure_node,
#                 failure_description=row.get('failure_description', ''),
#                 recovery_method=recovery_method,
#                 spare_parts=row.get('spare_parts', ''),
#                 recovery_date=row.get('recovery_date'),
#                 service_company=service_company,
#             )
#             print(f"✓ Рекламация {claim.id} создана")
#         except ObjectDoesNotExist as e:
#             print(f"✗ Ошибка в строке {idx + 2}: {e}")
#         except Exception as e:
#             print(f"✗ Ошибка при сохранении рекламации {row.get('id', 'N/A')}: {e}")



if __name__ == '__main__':
    EXCEL_FILE = os.path.join(BASE_DIR, "basic_data.xlsx")

    if not os.path.exists(EXCEL_FILE):
        print(f"Файл не найден: {EXCEL_FILE}")
        sys.exit(1)

    load_machines(EXCEL_FILE)
    # load_maintenance(EXCEL_FILE)
    # load_claims(EXCEL_FILE)
    print("Импорт завершён.")
