#!/bin/sh

./manage.py migrate
./manage.py collectstatic --noinput

# number of workers = 4 * CPU cores
gunicorn backend.wsgi --bind=0.0.0.0:8000 --workers 4 --threads 4