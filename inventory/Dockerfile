FROM python:3.11.4

ENV PYTHONUNBUFFERED=1

WORKDIR /inventoryapp

COPY requirements.txt /inventoryapp/

RUN pip install -r requirements.txt

COPY . /inventoryapp/
