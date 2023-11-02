# Use an official Python runtime as a parent image
FROM python:3.11.4-slim-buster

# Use an official Python runtime as a parent image
FROM python:3.8

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Install python-decouple to load environment variables from .env file
RUN pip install python-decouple

# Set environment variables
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST

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


# Apply database migrations
RUN python manage.py makemigrations
RUN python manage.py migrate

# Create a superuser (replace 'admin' and 'password' with your desired superuser credentials)
#RUN echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'gibsonoluka7@gmail.com', 'P@ss1234')" | python manage.py shell

# Collect static files to a folder inside the container
RUN python manage.py collectstatic --noinput

# Expose port 8000 for the Django development server
EXPOSE 8000

# Start the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
