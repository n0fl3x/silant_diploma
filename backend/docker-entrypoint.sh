#!/bin/bash

echo "Starting..."

echo "Creating migrations..."
python manage.py makemigrations --noinput

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Running custom setup commands..."
python manage.py setup-groups
python manage.py god-create
python manage.py db-import-machines
python manage.py db-import-maintenance
python manage.py db-import-claims

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
