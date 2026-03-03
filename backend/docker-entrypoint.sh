#!/bin/bash
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py setup-groups
python manage.py god-create
python manage.py db-import-machines
python manage.py db-import-maintenance
python manage.py db-import-claims
exec python manage.py runserver 0.0.0.0:8000
