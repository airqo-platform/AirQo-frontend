# app/routes/devices.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..models import DeviceSchema

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.get("/stats", response_model=Dict[str, Any])
def get_device_stats(db: Session = Depends(get_db)):
    """Get aggregate statistics for devices"""
    
    # Get total devices count
    total_devices = db.execute("SELECT COUNT(*) FROM dim_device").scalar()
    
    # Get count of active devices
    active_devices = db.execute("SELECT COUNT(*) FROM dim_device WHERE is_active = TRUE").scalar()
    
    # Get count of offline devices
    offline_devices = db.execute("SELECT COUNT(*) FROM dim_device WHERE is_online = FALSE").scalar()
    
    # Get count of deployed devices
    deployed_devices = db.execute("SELECT COUNT(*) FROM dim_device WHERE status = 'deployed'").scalar()
    
    # Get count of not deployed devices
    not_deployed_devices = db.execute("SELECT COUNT(*) FROM dim_device WHERE status = 'not deployed'").scalar()
    
    # Get count of recalled devices
    recalled_devices = db.execute("SELECT COUNT(*) FROM dim_device WHERE status = 'recalled'").scalar()
    
    # Get network breakdown
    networks = db.execute("""
        SELECT network, COUNT(*) as count 
        FROM dim_device 
        GROUP BY network
        ORDER BY count DESC
    """).fetchall()
    
    # Get category breakdown
    categories = db.execute("""
        SELECT category, COUNT(*) as count 
        FROM dim_device 
        GROUP BY category
        ORDER BY count DESC
    """).fetchall()
    
    return {
        "total_devices": total_devices,
        "active_devices": active_devices,
        "offline_devices": offline_devices,
        "deployed_devices": deployed_devices,
        "not_deployed_devices": not_deployed_devices,
        "recalled_devices": recalled_devices,
        "networks": [{"name": network, "count": count} for network, count in networks],
        "categories": [{"name": category, "count": count} for category, count in categories]
    }

@router.get("/list", response_model=List[Dict[str, Any]])
def get_device_list(db: Session = Depends(get_db)):
    """Get the list of all devices with their key details"""
    
    devices = db.execute("""
        SELECT d.device_key, d.device_id, d.device_name, d.network, d.category, 
               d.status, d.is_active, d.is_online, l.latitude, l.longitude
        FROM dim_device d
        LEFT JOIN dim_location l ON d.device_key = l.device_key
    """).fetchall()
    
    return [dict(device) for device in devices]

@router.get("/failures", response_model=Dict[str, Any])
def get_device_failures(db: Session = Depends(get_db)):
    """Get device failure data over time"""
    
    # This assumes you're tracking failures in fact_device_status
    failure_data = db.execute("""
        WITH monthly_stats AS (
            SELECT 
                date_trunc('month', timestamp) as month,
                COUNT(*) FILTER (WHERE device_status = 'offline' AND is_online = FALSE) as connectivity_issues,
                COUNT(*) FILTER (WHERE device_status = 'maintenance' AND is_online = FALSE) as sensor_failures,
                COUNT(*) FILTER (WHERE device_status = 'low_battery') as power_issues,
                COUNT(*) FILTER (WHERE device_status = 'damaged') as physical_damage
            FROM fact_device_status
            WHERE timestamp > now() - interval '6 months'
            GROUP BY month
            ORDER BY month
        )
        SELECT 
            to_char(month, 'Mon') as month,
            connectivity_issues,
            sensor_failures,
            power_issues,
            physical_damage
        FROM monthly_stats
    """).fetchall()
    
    return {
        "failure_data": [dict(row) for row in failure_data]
    }