# Stage 1: Build frontend
FROM node:20-slim as frontend-builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source files
COPY webpack.config.js .babelrc ./
COPY frontend ./frontend

# Build frontend
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

RUN npm run build

# Stage 2: Build backend
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy frontend build
COPY --from=frontend-builder /app/frontend /app/frontend

# Copy backend files
COPY manage.py google_application_credentials.json ./
COPY backend ./backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Create a non-root user and switch to it
RUN useradd -m myuser
USER myuser

EXPOSE 8080

CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind=0.0.0.0:8080 backend.wsgi"]