// D:\AegisGeoInt\frontend\src\pages\ThreatMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Map as MapIcon, Filter, Layers, AlertTriangle, RefreshCw, Crosshair } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const threatColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };

const droneIcon = L.divIcon({
  className: 'drone-icon',
  html: '<div style="width:26px;height:26px;background:#4fc3f7;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;font-weight:bold;">D</div>',
  iconSize: [26, 26], iconAnchor: [13, 13]
});
const threatIcon = L.divIcon({
  className: 'threat-icon',
  html: '<div style="width:22px;height:22px;background:#ef4444;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:bold;">!</div>',
  iconSize: [22, 22], iconAnchor: [11, 11]
});
const enemyIcon = L.divIcon({
  className: 'enemy-icon',
  html: '<div style="width:24px;height:24px;background:#8b5cf6;border-radius:4px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:bold;">E</div>',
  iconSize: [24, 24], iconAnchor: [12, 12]
});
const sensorIcon = L.divIcon({
  className: 'sensor-icon',
  html: '<div style="width:14px;height:14px;background:#06b6d4;border-radius:50%;border:2px solid white;box-shadow:0 0 10px #06b6d4;"></div>',
  iconSize: [14, 14], iconAnchor: [7, 7]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

const ThreatMap = () => {
  const [drones, setDrones] = useState([]);
  const [threats, setThreats] = useState([]);
  const [enemy, setEnemy] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrones, setShowDrones] = useState(true);
  const [showThreats, setShowThreats] = useState(true);
  const [showEnemy, setShowEnemy] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [mapCenter] = useState([-4.5, 139.5]);
  const [mapZoom] = useState(7);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [d, t, e, s] = await Promise.all([
        axios.get(`${API_URL}/api/drones`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/threats`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/enemy/troops`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/sensors`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }))
      ]);
      setDrones(d.data.data || []);
      setThreats(t.data.data || []);
      setEnemy(e.data.data || []);
      setSensors(s.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const int = setInterval(fetchAll, 5000);
    return () => clearInterval(int);
  }, []);

  const st = {
    container: { padding: '20px', color: '#e0e8f0', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    title: { fontSize: '22px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    toggleBtn: (active, color) => ({ padding: '6px 12px', background: active ? color + '20' : 'transparent', color: active ? color : '#8899aa', border: `1px solid ${active ? color : '#333'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }),
    mapWrap: { flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' },
    stats: { display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px', color: '#8899aa' }
  };

  return (
    <div style={st.container}>
      <div style={st.header}>
        <div>
          <h1 style={st.title}><MapIcon size={24} color="#4fc3f7" /> Threat Map</h1>
          <p style={{ fontSize: '12px', color: '#8899aa', margin: '4px 0 0 0' }}>Global Situational Awareness — All Assets</p>
        </div>
        <div style={st.controls}>
          <button style={st.toggleBtn(showDrones, '#4fc3f7')} onClick={() => setShowDrones(!showDrones)}>
            <Layers size={12} /> Drones ({drones.length})
          </button>
          <button style={st.toggleBtn(showThreats, '#ef4444')} onClick={() => setShowThreats(!showThreats)}>
            <AlertTriangle size={12} /> Threats ({threats.length})
          </button>
          <button style={st.toggleBtn(showEnemy, '#8b5cf6')} onClick={() => setShowEnemy(!showEnemy)}>
            <Crosshair size={12} /> Enemy ({enemy.length})
          </button>
          <button style={st.toggleBtn(showSensors, '#06b6d4')} onClick={() => setShowSensors(!showSensors)}>
            <Layers size={12} /> Sensors ({sensors.length})
          </button>
          <button style={st.toggleBtn(true, '#22c55e')} onClick={fetchAll}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div style={st.mapWrap}>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; ESRI"
          />

          {showDrones && drones.map(d => (
            <Marker key={`d-${d.id}`} position={[d.lat, d.lng]} icon={droneIcon}>
              <Popup><strong>{d.name || d.id}</strong><br />{d.model}<br />Battery: {Math.round(d.battery)}%<br />Status: {d.status}</Popup>
              <Tooltip>{d.name || d.id}</Tooltip>
            </Marker>
          ))}

          {showThreats && threats.map(t => (
            <Marker key={`t-${t.event_id}`} position={[t.lat, t.lng]} icon={threatIcon}>
              <Popup><strong>{t.description}</strong><br />{t.threat_level}<br />{t.sector}</Popup>
            </Marker>
          ))}

          {showEnemy && enemy.map(e => (
            <React.Fragment key={`e-${e.id}`}>
              <Circle center={[e.lat, e.lng]} radius={e.size * 500} pathOptions={{ color: threatColors[e.threat], fillColor: threatColors[e.threat], fillOpacity: 0.15 }}>
                <Tooltip>{e.unit} ({e.size})</Tooltip>
              </Circle>
              <Marker position={[e.lat, e.lng]} icon={enemyIcon}>
                <Popup><strong>{e.unit}</strong><br />{e.size} personnel<br />{e.threat}<br />{e.activity}</Popup>
              </Marker>
            </React.Fragment>
          ))}

          {showSensors && sensors.map(s => (
            <Marker key={`s-${s.sensor_id}`} position={[s.lat, s.lng]} icon={sensorIcon}>
              <Popup><strong>{s.sensor_name}</strong><br />{s.sensor_type}<br />{s.status}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ThreatMap;
