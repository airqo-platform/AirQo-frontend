FROM python:3.8 as deployment

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip
RUN pip install gunicorn

COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY ./frontend /app/frontend
COPY ./backend /app/backend
COPY manage.py ./docker/wsgi-entrypoint.sh /app/

# Backend server
FROM deployment as development
COPY google_application_credentials.json /etc/config/