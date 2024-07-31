# Stage 1: Build frontend
FROM node:20-slim as frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY webpack.config.js .babelrc ./
COPY frontend ./frontend
ARG REACT_ENV_VARS
RUN echo ${REACT_ENV_VARS} > .env
RUN npm run build

# Stage 2: Build backend
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY manage.py google_application_credentials.json ./
COPY backend ./backend
COPY --from=frontend /app/frontend/static/frontend ./frontend/static/frontend

EXPOSE 8080
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind=0.0.0.0:8080 --workers 4 --threads 2 backend.wsgi"]
