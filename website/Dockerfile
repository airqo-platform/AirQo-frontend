# Stage 1: Build frontend
FROM node:20-slim as frontend

WORKDIR /app

# Combine ARG and ENV declarations
ARG REACT_WEB_STATIC_HOST
ARG REACT_NETMANAGER_BASE_URL
ARG REACT_APP_BASE_AIRQLOUDS_URL
ARG REACT_APP_BASE_NEWSLETTER_URL
ARG REACT_APP_WEBSITE_BASE_URL
ARG REACT_APP_AUTHORIZATION_TOKEN
ARG REACT_APP_GEO_LOCATION_URL
ARG REACT_APP_NETMANAGER_URL
ARG REACT_APP_OPENCAGE_API_KEY

ENV REACT_WEB_STATIC_HOST=$REACT_WEB_STATIC_HOST \
    REACT_NETMANAGER_BASE_URL=$REACT_NETMANAGER_BASE_URL \
    REACT_APP_BASE_AIRQLOUDS_URL=$REACT_APP_BASE_AIRQLOUDS_URL \
    REACT_APP_BASE_NEWSLETTER_URL=$REACT_APP_BASE_NEWSLETTER_URL \
    REACT_APP_WEBSITE_BASE_URL=$REACT_APP_WEBSITE_BASE_URL \
    REACT_APP_AUTHORIZATION_TOKEN=$REACT_APP_AUTHORIZATION_TOKEN \
    REACT_APP_GEO_LOCATION_URL=$REACT_APP_GEO_LOCATION_URL \
    REACT_APP_NETMANAGER_URL=$REACT_APP_NETMANAGER_URL \
    REACT_APP_OPENCAGE_API_KEY=$REACT_APP_OPENCAGE_API_KEY

COPY ./package.json ./package-lock.json /app/
RUN npm ci --silent

COPY ./webpack.config.js ./.babelrc /app/
COPY ./frontend /app/frontend
RUN npm run build

# Stage 2: Build backend
FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY manage.py google_application_credentials.json /app/
COPY ./backend /app/backend
COPY --from=frontend /app/frontend /app/frontend

EXPOSE 8080

CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind=0.0.0.0:8080 backend.wsgi"]
