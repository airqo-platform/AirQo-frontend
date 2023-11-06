# Use an official Python runtime as a parent image
FROM python:3.11.4-slim-buster
# Set the working directory to /app
WORKDIR /app
# Copy the current directory contents into the container at /app
COPY . /app
# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt
# # Apply database migrations
RUN python manage.py makemigrations
RUN python manage.py migrate
# Collect static files to a folder inside the container
RUN python manage.py collectstatic  --noinput
# Expose port 8000 for the Django development server
EXPOSE 8000
# Start the Django development server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "Inventory.wsgi:application"]