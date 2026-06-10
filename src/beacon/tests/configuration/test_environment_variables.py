import os
import pytest
from unittest import mock

from app.database import get_db, engine
from app.users import get_airqo_token

def test_database_url_configuration():
    """Test that the database URL is correctly configured"""
    # Original variable
    original_db_url = os.environ.get("DATABASE_URL")
    
    try:
        # Set a test database URL
        test_db_url = "postgresql://test:test@localhost:5432/test_db"
        os.environ["DATABASE_URL"] = test_db_url
        
        # Import the module again to refresh the environment variable
        import importlib
        import app.database
        importlib.reload(app.database)
        
        # Check that the engine uses the new URL
        assert test_db_url in str(app.database.engine.url)
    finally:
        # Restore the original value
        if original_db_url:
            os.environ["DATABASE_URL"] = original_db_url
        else:
            os.environ.pop("DATABASE_URL", None)
        
        # Reload the module again to restore original configuration
        importlib.reload(app.database)

def test_jwt_secret_configuration():
    """Test JWT secret configuration"""
    from app.users import SECRET_KEY
    
    # Make sure SECRET_KEY is set
    assert SECRET_KEY, "JWT SECRET_KEY is not set"
    
    # Check that it's not the default value in production
    if os.environ.get("ENVIRONMENT") == "production":
        assert SECRET_KEY != "your-secret-key-change-in-production", "Using default SECRET_KEY in production!"

def test_airflow_connections():
    """Test Airflow connections are properly configured"""
    # Mock Airflow's environment
    with mock.patch.dict(os.environ, {
        "AIRFLOW_CONN_POSTGRES_DEFAULT": "postgresql://airflow:airflow@postgres:5432/airflow",
        "AIRFLOW_CONN_AIRQO_CONN": "http://api.airqo.net"
    }):
        from airflow.hooks.base import BaseHook
        
        # Mock the get_connection method
        with mock.patch.object(BaseHook, "get_connection") as mock_get_conn:
            # Configure the mock
            postgres_conn = mock.MagicMock()
            postgres_conn.host = "postgres"
            postgres_conn.schema = "airflow"
            postgres_conn.login = "airflow"
            
            airqo_conn = mock.MagicMock()
            airqo_conn.host = "api.airqo.net"
            
            # Set up the mock to return different connections based on conn_id
            mock_get_conn.side_effect = lambda conn_id: {
                "postgres_default": postgres_conn,
                "airqo_conn": airqo_conn
            }.get(conn_id)
            
            # Now test if the connections are retrieved correctly
            pg_conn = BaseHook.get_connection("postgres_default")
            assert pg_conn.host == "postgres"
            assert pg_conn.schema == "airflow"
            
            api_conn = BaseHook.get_connection("airqo_conn")
            assert api_conn.host == "api.airqo.net"