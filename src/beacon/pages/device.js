// frontend/pages/devices.js
import { useEffect, useState } from 'react';
import { getDevices } from '../lib/api';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDevices() {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (err) {
        console.error('Error loading devices:', err);
        setError('Failed to load devices. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  if (loading) return <div>Loading devices...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Devices</h1>
      <div className="device-grid">
        {devices.length === 0 ? (
          <p>No devices found.</p>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="device-card">
              <h2>{device.name}</h2>
              <p>ID: {device.device_id}</p>
              <p>Location: {device.location}</p>
              <p>Status: <span className={`status ${device.status.toLowerCase()}`}>{device.status}</span></p>
              <p>Last ping: {device.last_ping ? new Date(device.last_ping).toLocaleString() : 'Never'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}