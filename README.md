# 🛠️ AEGIS GEOINT

**Sistem Intelajen Geospasial & Pusat Komando Drone UAV untuk Operasi Tropis
**

Platform inteljen geospasial full-stack untuk pengawasan drone, deteksi objek berbasis AI, dan perencanaan misi taktis — dirancang khusus untuk operasi di wilayah tropis (fokus Papua, Indonesia).

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
!kNode](https://img.shields.io/badge/node-18%2B-green)
![Python](https://img.shields.io/badge/python-3.10%2B%e2%80%94blue)

---

## 📈 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi Cepat](#-instalasi-cepat)
- [Akses & Login](#-akses--login)
- [Port & Layanan](#-port--layanan)
- [Dokumentasi API](#-dokumentasi-api)
- [Troubleshooting](#-troubleshooting)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🎯 Fitur Utama

### 1. 🔐 Login & Keamanan (Restricted Access)
- Halaman login dengan desain tactical grid
- Autentikasi mock (localStorage)
- Redirect otomatis ke dashboard setelah login

**Kredensial Default:**
- Username: `admin`
- Password: `aegis`

### 2. 🗷️ Peta Taktis Interaktif
- Pelackakan drone real-time dengan marker berwarna sesuai status
- Penanda ancaman (threat) dengan level HIGH/MEDIUM/LOW
- Posisi sensor dan geofence
- Basemap satellite (ESRI) dan OpenStreetMap

### 3. 📸 Manajemen Armada Drone
- Monitoring 8 drone secara live
- Status: ACTIVE, WARNING, CRITICAL, RETURNING, IDLE
- Filter dan pencarian
- Data update real-time via WebSocket

### 4. 🎯 Kontrol Misi
- 8 tipe misi: Surveillance, Mapping, Search & Rescue, Patrol, Reconnaissance
- Prioritas misi (High/Medium/Low)
- Progress tracking per misi

### 5. 🧠 Pusat Inteljen
- Analisis ancaman dengan AI pattern recognition
- Peta hotspot (Nduga, Yahukimo, Pegunungan Bintang)
- Distribusi ancaman per wilayah

### 6. 📯 Inteljen Musuh (Enemy Intel)
- Identifikasi senjata (AK-47, SVD, PKM, RPG-7, Mortar)
- Jumlah pasukan musuh per unit
- Kendaraan & equipment tracking
- Fasilitas musuh

### 7. 🗷️ Peta Ancaman Global
- Overlay semua asset: drone, threat, enemy, sensor
- Toggle layer per kategori
- Auto-refresh tiap 5 detik

### 8. 📊 Dashboard Analitik
- Statistik live
- 4 bar chart: drone status, threat distribution, enemy units, equipment

### 9. ⚔️ Simulator Skenario (What-If Analysis)
- 6 skenario tindakan militer: Airstrike, Recon, Ground Assault, Blockade, Evacuation, Cyber Attack
- Estimasi: success rate, casualties, collateral risk, durasi

### 10. 📷 Konsol Deteksi AI (AI Detection Console)
- **Auto-Scan Cycle:** SCANNING → DETECTED → ID�E
- **Weapon Detection:** 5 jenis senjata
- Personnel Detection
- Thermal Analysis
- Audio Alert (beep)

### 11. 🎯 Analisis Taktis (Tactical Analysis)
- Peta Papua full dengan 6 marker enemy
- Movement prediction
- Ambush probability
- Rekomendasi aksi taktis per zona

### 12. 📹 Live Drone Feed
- Video simulasi
- HUD overlay
- Thermal mode
- Object detection animasi
- Drone tab selector

### 13. 🛰 GeoServer WMS/WFS
- Standar OGC
- Workspace `aegisgeoint`
- WMS + WFS

---

## 🯳 Arsitektur Sistem

```
Frontend (React+Vite) → Backend (Node.js) → AI Engine (Python FastAPI) → Docker (Postgres, Redis, GeoServer)
```

---

## 🛠 Teknologi

### Frontend

| Teknologi | Versi |
|-----------|-------|
| React | 18.x |
| Vite | 5.x |
| Leaflet | 1.9.4 |
| React-Leaflet | 5.0.0 |
| Axios | 1.x |
| Lucide React | Latest |

### Backend

| Teknologi | Versi |
|-----------|-------|
| Node.js | 18+ |
| Express | 5.x |
| ws | 8.x |

### AI Engine

| Teknologi | Versi |
|-----------|-------|
| Python | 3.10+ |
| FastAPI | 0.103+ |
| Ultralytics YOLOv8 | 8.x |
| PyTorch | 2.x |
| OpenCV | 4.x |

### Infrastructure

| Teknologi | Versi |
|-----------|-------|
| Docker | 20+ |
| PostgreSQL | 16 + PostGIS 3.4 |
| Redis | 7.x |
| GeoServer | 3.0.2 |

---

## 📊 Prasyarat

- ✅ Docker Desktop — [Download](https://www.docker.com/products/docker-desktop)
- ✅ Node.js 18+ — [Download](https://nodejs.org/)
- ✅ Python 3.10+ — [Download](https://www.python.org/)
-# ✅ Git — [Download](https://git-scm.com/)

---

## ⚡ Instalasi Cepat

### 1. Clone Repository

```bash
git clone https://github.com/sazwarriyadhs/aegisgint.git
cd aegisgint
```

### 2. Copy Environment Config

```bash
cp .env.example .env
```

### 3. Jalankan Infrastructure (Docker)

```bash
docker-compose up -d postgres redis backend geoserver
```

### 4. Jalankan Telemetry Simulator

```bash
cd telemetry-simulator
pip install -r requirements.txt
python simulator.py
```

**Windows:**
```powershell
$env:PYTHONIOENCODING="utf-8"
$env:PYTHONUTF8="1"
python simulator.py
```

### 5. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Buka di Browser

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **AI Engine:** http://localhost:8000/docs
- **GeoServer:** http://localhost:8089/geoserver/web/

---

## 🔐 Akses & Login

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `aegis` |

**Logout:**
```javascript
// F12 Console
localStorage.removeItem('aegis_auth');
location.reload();
```

---

## 📡 Port & Layanan

| Port | Layanan |
|------|---------|
| 5173 | Frontend (Vite) |
| 5000 | Backend API |
| 8000 | AI Engine (FastAPI) |
| 8765 | Telemetry Simulator |
| 5432 | PostgreSQL + PostGIS |
| 6379 | Redis |
| 8089 | GeoServer |

---

## 🖪 Dokumentasi API

### Backend API (Port 5000)

```http
GET  /health                → Health check
GET  /api/drones            → List drones
GET  /api/threats           → Threat events
GET  /api/sensors           → Sensor network
GET  /api/zones             → Restricted zones
GET  /api/enemy             → Enemy intel
GET  /wfs                   → WFS-compatible
```

### AI Engine API (Port 8000)

```http
GET  /health                → Health + YOLO status
POST /detect/movement       → Movement detection
POST /detect/thermal        → Thermal analysis
GET  /history               → Capture history
```

---

## 🧱 Troubleshooting

### 1. Docker port bentrok
Ganti port di `docker-compose.yml`:
```yaml
ports:
  - "15432:5432"
```

### 2. Frontend blank putih
```bash
rm -rf frontend/node_modules/.vite
cd frontend
npm run dev
```

### 3. Telemetry error Unicode (Windows)
```powershell
$env:PYTHONIOENCODING="utf-8"
python simulator.py
```

### 4. AI Engine error
```bash
docker-compose logs ai-engine
```

### 5. Login loop
```javascript
localStorage.removeItem('aegis_auth');
location.reload();
```

---

## 🤲 Kontribusi

1. **Fork** repository
2. **Clone:** `git clone https://github.com/USERNAME/aegisgint.git`
3. **Branch:** `git checkout -b feature/nama-fitur`
4. **Commit:** `git commit -m "feat: tambah fitur X" `
5. **Push:** `git push origin feature/nama-fitur`
6. **Pull Request**

---

## �p Lisensi

ISC License — Copyright (c) 2026 Sazwar Riyadh

---

## 👤 Kontak

��*Sazwar Riyadh**

- 🐙 GitHub: [@sazwarriyadhs](https://github.com/sazwarrdiyadhs)
- 🌌 Repo: [github.com/sazwarriyadhs/aegisgint](https://github.com/sazwarriyadhs/aegisgint)

---

**Dibuat dengan ❤️ untuk operasi inteljen UAV tropis Indonesia**

🇮🇷 **NKRI Harga Mati** 🇮🇷
