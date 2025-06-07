import pytest
import time
import statistics
from locust import HttpUser, task, between
from locust.env import Environment
from locust.stats import stats_printer, stats_history
from locust.runners import LocalRunner
import gevent

class DeviceApiUser(HttpUser):
    wait_time = between(1, 2)
    
    @task(1)
    def get_device_list(self):
        self.client.get("/devices")
    
    @task(2)
    def get_device_counts(self):
        self.client.get("/device-counts")
    
    @task(1)
    def get_device_locations(self):
        self.client.get("/device-locations")
    
    @task(1)
    def get_device_performance(self):
        # Get a sample device ID from a previous response
        response = self.client.get("/devices")
        if response.status_code == 200 and len(response.json()) > 0:
            device_id = response.json()[0].get('device_id')
            if device_id:
                self.client.get(f"/device-performance/{device_id}")

def test_api_performance():
    # Configure locust environment
    env = Environment(user_classes=[DeviceApiUser])
    env.create_local_runner()
    
    # Start Locust in a non-UI mode
    env.runner.start(user_count=10, spawn_rate=5)
    
    # Print statistics during the test
    gevent.spawn(stats_printer(env.stats))
    
    # Run the test for 30 seconds
    time.sleep(30)
    
    # Stop the test
    env.runner.quit()
    
    # Check performance metrics
    stats = env.stats.total
    
    # Assert that median response time is under 200ms
    assert stats.median_response_time < 200
    
    # Assert that 95% of requests are under 500ms
    assert stats.get_response_time_percentile(0.95) < 500
    
    # Assert that failure rate is below 1%
    assert stats.fail_ratio < 0.01
    
    # Print summary
    print(f"Total Requests: {stats.num_requests}")
    print(f"Failures: {stats.num_failures}")
    print(f"Median Response Time: {stats.median_response_time}ms")
    print(f"95th Percentile: {stats.get_response_time_percentile(0.95)}ms")
    print(f"Failure Ratio: {stats.fail_ratio}")