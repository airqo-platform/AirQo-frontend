# Building frontend
FROM node:12-slim as frontend

WORKDIR /app

ARG REACT_WEB_STATIC_HOST
ARG REACT_NETMANAGER_BASE_URL
ARG REACT_APP_BASE_AIRQLOUDS_URL
ARG REACT_APP_BASE_NEWSLETTER_URL
ARG REACT_APP_WEBSITE_BASE_URL
ARG REACT_APP_AUTHORIZATION_TOKEN

ENV REACT_WEB_STATIC_HOST=$REACT_WEB_STATIC_HOST
ENV REACT_NETMANAGER_BASE_URL=$REACT_NETMANAGER_BASE_URL
ENV REACT_APP_BASE_AIRQLOUDS_URL=$REACT_APP_BASE_AIRQLOUDS_URL
ENV REACT_APP_BASE_NEWSLETTER_URL=$REACT_APP_BASE_NEWSLETTER_URL
ENV REACT_APP_WEBSITE_BASE_URL=$REACT_APP_WEBSITE_BASE_URL
ENV REACT_APP_AUTHORIZATION_TOKEN=$REACT_APP_AUTHORIZATION_TOKEN

COPY ./package.json ./package-lock.json /app/
RUN npm ci --silent

COPY ./webpack.config.js ./.babelrc /app/
COPY ./frontend /app/frontend
RUN npm run build

FROM python:3.8

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY manage.py google_application_credentials.json /app/
COPY ./backend /app/backend
COPY --from=frontend /app/frontend /app/frontend

EXPOSE 8080
# The migrate command migrates the results of the makemigrations command to the
# remote database which may (supposed to) be different from the local database
CMD python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    gunicorn --bind=0.0.0.0:8080 backend.wsgi