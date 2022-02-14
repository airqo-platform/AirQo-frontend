#!/bin/sh

./manage.py migrate
./manage.py collectstatic --noinput
cp /app/frontend/static/frontend/index.html /app/static/

# number of workers = 4 * CPU cores
gunicorn backend.wsgi --bind 0.0.0.0:8000 --workers 4 --threads 4