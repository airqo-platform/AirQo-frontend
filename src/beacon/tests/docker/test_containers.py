import pytest
import docker
import requests
import time
import os
from docker.errors import NotFound

@pytest.fixture(scope="module")
def docker_client():
    return docker.from_env()

@pytest.fixture(scope="module")
def docker_network(docker_client):
    network_name = "test_airqo_network"
    
    try:
        # Try to get existing network
        network = docker_client.networks.get(network_name)
        # If exists, remove it
        network.remove()
    except NotFound:
        pass
    
    # Create new network
    network = docker_client.networks.create(network_name)
    
    yield network
    
    # Cleanup
    network.remove()

@pytest.fixture(scope="module")
def postgres_container(docker_client, docker_network):
    container = docker_client.containers.run(
        "postgres:13",
        name="test_postgres",
        detach=True,
        environment={
            "POSTGRES_USER": "airflow",
            "POSTGRES_PASSWORD": "airflow",
            "POSTGRES_DB": "airflow"
        },
        ports={'5432/tcp': 5432},
        network=docker_network.name
    )
    
    # Wait for Postgres to be ready
    time.sleep(10)
    
    yield container
    
    # Cleanup
    container.stop()
    container.remove()

@pytest.fixture(scope="module")
def api_container(docker_client, docker_network, postgres_container):
    # Build the API container from Dockerfile
    image, logs = docker_client.images.build(
        path="./backend/api",
        tag="airqo-test-api:latest",
        rm=True
    )
    
    container = docker_client.containers.run(
        "airqo-test-api:latest",
        name="test_api",
        detach=True,
        environment={
            "DATABASE_URL": "postgresql://airflow:airflow@test_postgres:5432/airflow"
        },
        ports={'8000/tcp': 8000},
        network=docker_network.name
    )
    
    # Wait for API to start
    time.sleep(10)
    
    yield container
    
    # Cleanup
    container.stop()
    container.remove()

def test_postgres_container_is_running(postgres_container):
    assert postgres_container.status == "running"
    
    # Check logs for any errors
    logs = postgres_container.logs().decode('utf-8')
    assert "database system is ready to accept connections" in logs

def test_api_container_is_running(api_container):
    assert api_container.status == "running"
    
    # Check logs for any errors
    logs = api_container.logs().decode('utf-8')
    assert "Application startup complete" in logs

def test_api_health_endpoint(api_container):
    # Try to access the API
    response = requests.get("http://localhost:8000/")
    
    assert response.status_code == 200
    assert "running" in response.json().get("message", "").lower()

def test_container_environment_variables(api_container):
    # Check environment variables in the container
    env_output = api_container.exec_run("env").output.decode('utf-8')
    
    assert "DATABASE_URL=postgresql://airflow:airflow@test_postgres:5432/airflow" in env_output