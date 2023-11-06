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

# Start the Django development server
CMD python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    gunicorn --bind=0.0.0.0:8080 Inventory.wsgi