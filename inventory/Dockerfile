# Use an official Python runtime as a parent image
FROM python:3.11.4-slim-buster

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app
# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Install python-decouple to load environment variables from .env file
RUN pip install python-decouple


# Set environment variable
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST
ARG SECRET_KEY=$SECRET_KEY
ARG DEBUG=$DEBUG
ARG EMAIL_HOST_PASSWORD=$EMAIL_HOST_PASSWORD
ARG EMAIL_FROM=$EMAIL_FROM
ARG EMAIL_PORT=$EMAIL_PORT
ARG EMAIL_USE_TLS=$EMAIL_USE_TLS
ARG EMAIL_HOST_USER=$EMAIL_HOST_USER
ARG DEFAULT_FROM_EMAIL=$DEFAULT_FROM_EMAIL
ARG PASSWORD_RESET_TIMEOUT=$PASSWORD_RESET_TIMEOUT
ARG POSTGRES_PORT=$DB_PORT

ENV SECRET_KEY=$SECRET_KEY
ENV DEBUG=$DEBUG
ENV EMAIL_HOST_PASSWORD=$EMAIL_HOST_PASSWORD
ENV EMAIL_FROM=$EMAIL_FROM
ENV EMAIL_PORT=$EMAIL_PORT
ENV EMAIL_USE_TLS=$EMAIL_USE_TLS
ENV EMAIL_HOST_USER=$EMAIL_HOST_USER
ENV DEFAULT_FROM_EMAIL=$DEFAULT_FROM_EMAIL
ENV PASSWORD_RESET_TIMEOUT=$PASSWORD_RESET_TIMEOUT
ENV POSTGRES_DB=$DB_NAME
ENV POSTGRES_USER=$DB_USER
ENV POSTGRES_PASSWORD=$DB_PASSWORD
ENV POSTGRES_HOST=$DB_HOST
ENV POSTGRES_PORT=$DB_PORT


# # Apply database migrations
RUN python manage.py makemigrations
RUN python manage.py migrate

# Collect static files to a folder inside the container
RUN python manage.py collectstatic  --noinput

# Expose port 8000 for the Django development server
EXPOSE 8000

# Start the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
