# 🛰️ AEGIS GEOINT

**Sistem Intelijen Geospasial & Pusat Komando Drone UAV untuk Operasi Tropis**

Platform intelijen geospasial full-stack untuk pengawasan drone, deteksi objek berbasis AI, dan perencanaan misi taktis — dirancang khusus untuk operasi di wilayah tropis (fokus Papua, Indonesia).

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
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

### 2. 🗺️ Peta Taktis Interaktif
- Pelacakan drone real-time
- Penanda ancaman (threat)
- Posisi sensor dan geofence
- Basemap satellite

### 3. 🛸 Manajemen Armada Drone
- Monitoring 8 drone live
- Status: ACTIVE, WARNING, CRITICAL
- Real-time via WebSocket

### 4. 🎯 Kontrol Misi
- 8 tipe misi (Surveillance, Mapping, dll)
- Prioritas (High/Medium/Low)
- Progress tracking

### 5. 🧠 Pusat Intelijen
- AI pattern recognition
- Peta hotspot
- Distribusi ancaman

### 6. 🎯 Intelijen Musuh
- Identifikasi senjata
- Jumlah pasukan
- Fasilitas musuh

### 7. 🗺️ Peta Ancaman Global
- Overlay semua asset
- Toggle layer

### 8. 📊 Dashboard Analitik
- Statistik live
- Bar chart

### 9. ⚔️ Simulator Skenario
- 6 skenario militer
- Estimasi casualties & risk

### 10. 📷 Konsol Deteksi AI
- Auto-Scan Cycle
- Weapon Detection
- Thermal Analysis
- Audio Alert

### 11. 🎯 Analisis Taktis
- Peta Papua full
- Movement prediction
- Ambush probability

### 12. 📹 Live Drone Feed
- Video simulasi
- HUD overlay
- Thermal mode

### 13. 🛰️ GeoServer WMS/WFS
- Standar OGC
- Workspace `aegisgeoint`

---

## 🛠️ Teknologi

### Frontend
| Teknologi | Versi |
|-----------|-------|
| React | 18.x |
| Vite | 5.x |
| Leaflet | 1.9.4 |
| React-Leaflet | 5.0.0 |

### Backend
| Teknologi | Versi |
|-----------|-------|
| Node.js | 18+ |
| Express | 5.x |

### AI Engine
| Teknologi | Versi |
|-----------|-------|
| Python | 3.10+ |
| FastAPI | 0.103+ |
| Ultralytics YOLOv8 | 8.x |

### Infrastructure
| Teknologi | Versi |
|-----------|-------|
| Docker | 20+ |
| PostgreSQL | 16 + PostGIS |
| Redis | 7.x |
| GeoServer | 3.0.2 |

---

## 📋 Prasyarat

- ✅ Docker Desktop
- ✅ Node.js 18+
- ✅ Python 3.10+
- ✅ Git

---

## ⚡ Instalasi Cepat

### 1. Clone Repository
```bash
git clone https://github.com/sazwarriyadhs/aegisgint.git
cd aegisgint
