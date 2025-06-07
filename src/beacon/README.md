# AirQo Device Health Monitoring Frontend

## Overview
Frontend microservice for AirQo's device health monitoring system. Provides an interactive web interface for monitoring and analyzing air quality sensors across Africa in real-time.

## Features
- **Real-time Dashboard** - Live device status monitoring and alerting
- **Performance Analytics** - MTBF, MTTR, uptime percentages visualization
- **Maintenance Management** - Scheduling and impact assessment interface
- **Calibration Tools** - Co-location testing analysis dashboard
- **Historical Reports** - Trend analysis and reporting interface

## 🚀 Quick Deploy

### Production (Docker)
```bash
docker-compose up -d --build
```
Service runs on: `http://localhost:3000`

### Development
```bash
npm install --legacy-peer-deps
npm run dev
```

## 📋 Architecture Integration

This frontend microservice is part of AirQo's three-layer architecture:

### Data Flow
```
AirQo GSM Sensors → ThingSpeak → Backend APIs → Frontend Dashboard
```

### Backend Dependencies
- **FastAPI**: RESTful API endpoints (`srv828289.hstgr.cloud:8000`)
- **PostgreSQL**: Device health metrics database
- **dbt**: Data transformation workflows

## ⚙️ Configuration

### Environment Variables
```bash
# Required
BACKEND_API_URL=http://srv828289.hstgr.cloud:8000
NEXT_PUBLIC_API_URL=/api

# Optional
NODE_ENV=production
SERVICE_NAME=airqo-frontend
LOG_LEVEL=info
```

## 🔍 Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/api/health` | Service health + backend connectivity |
| `/api/metrics` | Performance metrics |
| `/api/info` | Service information |

**Quick Health Check:**
```bash
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

**Service won't start?**
```bash
docker logs airqo-frontend-microservice
```

**Backend connection issues?**
```bash
curl http://srv828289.hstgr.cloud:8000/health
```

**Dashboard not loading data?**
```bash
# Check API connectivity
curl http://localhost:3000/api/health

# Verify backend services
curl http://srv828289.hstgr.cloud:8000/api/devices
```

## 📖 Documentation
- API documentation available at backend `/api/docs`
- Full system documentation in main project `/docs`
- Database schema in `/backend/database/README.md`

---

**Tech Stack**: Next.js 15.1.0, Node.js 18+, Docker