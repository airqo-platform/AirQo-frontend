import pytest
import time
import statistics
from sqlalchemy import create_engine, text
import os

# Use test database URL
DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://airflow:airflow@localhost:5432/airflow_test")

# Create engine
engine = create_engine(DATABASE_URL)

def test_device_readings_query_performance():
    """Test the performance of queries on device readings"""
    with engine.connect() as conn:
        # Run query multiple times to get performance stats
        execution_times = []
        
        for _ in range(10):
            start_time = time.time()
            
            # Query to get readings for the last 30 days
            result = conn.execute(text("""
                SELECT 
                    d.device_id,
                    r.timestamp,
                    r.pm2_5,
                    r.pm10
                FROM 
                    fact_device_readings r
                JOIN 
                    dim_device d ON r.device_key = d.device_key
                WHERE 
                    r.timestamp >= NOW() - INTERVAL '30 days'
                ORDER BY
                    r.timestamp DESC
                LIMIT 1000
            """))
            
            # Consume all results
            rows = result.fetchall()
            
            end_time = time.time()
            execution_time = (end_time - start_time) * 1000  # Convert to ms
            execution_times.append(execution_time)
        
        # Calculate statistics
        avg_time = statistics.mean(execution_times)
        median_time = statistics.median(execution_times)
        max_time = max(execution_times)
        
        print(f"Query Statistics (ms):")
        print(f"  Average: {avg_time:.2f}")
        print(f"  Median: {median_time:.2f}")
        print(f"  Maximum: {max_time:.2f}")
        
        # Assert reasonable performance
        assert median_time < 500, f"Query too slow: median time {median_time:.2f}ms exceeds 500ms threshold"
        
def test_data_insertion_performance():
    """Test the performance of inserting readings data"""
    with engine.connect() as conn:
        # Insert test device if it doesn't exist
        conn.execute(text("""
            INSERT INTO dim_device (device_id, device_name, is_active, status)
            VALUES ('perf-test-device', 'Performance Test Device', true, 'deployed')
            ON CONFLICT (device_id) DO NOTHING
        """))
        
        # Get device_key
        result = conn.execute(text("""
            SELECT device_key FROM dim_device WHERE device_id = 'perf-test-device'
        """))
        device_key = result.scalar()
        
        if not device_key:
            pytest.fail("Could not create test device")
        
        # Prepare for insertion benchmark
        execution_times = []
        batch_size = 1000
        
        # Create sample data
        timestamp_base = int(time.time())
        
        # Test batch insert performance
        start_time = time.time()
        
        # Start a transaction
        trans = conn.begin()
        try:
            # Bulk insert using executemany
            stmt = text("""
                INSERT INTO fact_device_readings 
                (device_key, timestamp, pm2_5, pm10, battery_voltage)
                VALUES (:device_key, to_timestamp(:timestamp), :pm2_5, :pm10, :battery_voltage)
                ON CONFLICT DO NOTHING
            """)
            
            # Prepare parameters
            params = []
            for i in range(batch_size):
                params.append({
                    "device_key": device_key,
                    "timestamp": timestamp_base - (i * 60),  # Every minute
                    "pm2_5": 10.5 + (i % 10),
                    "pm10": 20.5 + (i % 15),
                    "battery_voltage": 3.8 - (i % 10) * 0.01
                })
            
            # Execute the batch
            conn.execute(stmt, params)
            trans.commit()
            
        except Exception as e:
            trans.rollback()
            pytest.fail(f"Error during batch insert: {str(e)}")
        
        end_time = time.time()
        total_time = (end_time - start_time) * 1000  # Convert to ms
        inserts_per_second = batch_size / ((end_time - start_time))
        
        print(f"Batch Insert Performance:")
        print(f"  Total Time: {total_time:.2f}ms")
        print(f"  Batch Size: {batch_size}")
        print(f"  Inserts/Second: {inserts_per_second:.2f}")
        
        # Cleanup
        conn.execute(text("""
            DELETE FROM fact_device_readings WHERE device_key = :device_key
        """), {"device_key": device_key})
        
        # Assert reasonable performance
        assert inserts_per_second > 1000, f"Insertion too slow: {inserts_per_second:.2f} inserts/second below 1000 threshold"