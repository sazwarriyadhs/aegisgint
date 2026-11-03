# ðŸ›°ï¸ AEGIS GEOINT

**Tropical UAV Intelligence & Drone Command Center**

A full-stack geospatial intelligence platform for drone surveillance, AI-powered object detection, and tactical mission planning.

## ðŸŽ¯ Features

- ðŸ—ºï¸ Interactive Tactical Map
- ðŸ›¸ Drone Fleet Management (8 drones live)
- ðŸŽ¯ Mission Control
- ðŸ§  Intelligence Center
- ðŸŽ¯ Enemy Intel
- ðŸ—ºï¸ Threat Map
- ðŸ“Š Analytics Dashboard
- âš”ï¸ Scenario Simulator
- ðŸ“· AI Detection Console (YOLOv8)
- ðŸ›°ï¸ GeoServer WMS/WFS

## ðŸ—ï¸ Architecture

Frontend (React+Vite) â†’ Backend (Node.js) â†’ AI Engine (Python FastAPI) â†’ Docker (Postgres, Redis, GeoServer)

## ðŸš€ Quick Start

### 1. Clone
git clone https://github.com/sazwarriyadhs/aegisgint.git
cd aegisgint

### 2. Config
cp .env.example .env

### 3. Start Infrastructure
docker-compose up -d postgres redis backend geoserver

### 4. Start Telemetry Simulator
cd telemetry-simulator
pip install -r requirements.txt
python simulator.py

### 5. Start Frontend
cd frontend
npm install
npm run dev

### 6. Open
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI Engine: http://localhost:8000/docs
- GeoServer: http://localhost:8089/geoserver/web/

## ðŸ”§ Services

| Service | Port |
|---------|------|
| Frontend | 5173 |
| Backend | 5000 |
| AI Engine | 8000 |
| Telemetry | 8765 |
| Postgres | 5432 |
| Redis | 6379 |
| GeoServer | 8089 |

## ðŸ§ª API

Backend:
- GET /api/drones
- GET /api/threats
- GET /api/sensors
- GET /api/zones
- GET /api/enemy
- GET /wfs

AI Engine:
- GET /health
- POST /detect/movement
- POST /detect/thermal
- GET /history

## ðŸ‘¤ Author

Sazwar Riyadh â€” @sazwarriyadhs

## ðŸ“ License

ISC
