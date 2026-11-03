import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Crosshair, Users, Bomb, Truck, Building2, AlertTriangle, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const threatColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };

const weaponIcon = L.divIcon({
  className: 'weapon-icon',
  html: '<div style="width:20px;height:20px;background:#ef4444;border-radius:4px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:bold;">W</div>',
  iconSize: [20, 20], iconAnchor: [10, 10]
});
const troopIcon = L.divIcon({
  className: 'troop-icon',
  html: '<div style="width:24px;height:24px;background:#f59e0b;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:bold;">T</div>',
  iconSize: [24, 24], iconAnchor: [12, 12]
});
const facilityIcon = L.divIcon({
  className: 'facility-icon',
  html: '<div style="width:22px;height:22px;background:#8b5cf6;border-radius:4px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:bold;">F</div>',
  iconSize: [22, 22], iconAnchor: [11, 11]
});

const EnemyIntel = () => {
  const [weapons, setWeapons] = useState([]);
  const [troops, setTroops] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('weapons');

  const fetchEnemy = async () => {
    try {
      setLoading(true);
      setError(null);
      const [wp, tr, eq, fac] = await Promise.all([
        axios.get(`${API_URL}/api/enemy/weapons`, { timeout: 5000 }),
        axios.get(`${API_URL}/api/enemy/troops`, { timeout: 5000 }),
        axios.get(`${API_URL}/api/enemy/equipment`, { timeout: 5000 }),
        axios.get(`${API_URL}/api/enemy/facilities`, { timeout: 5000 })
      ]);
      setWeapons(wp.data.data || []);
      setTroops(tr.data.data || []);
      setEquipment(eq.data.data || []);
      setFacilities(fac.data.data || []);
    } catch (err) {
      console.error('Enemy fetch failed:', err.message);
      setError('Enemy intel offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnemy();
    const interval = setInterval(fetchEnemy, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalWeapons = weapons.reduce((s, w) => s + (w.count || 0), 0);
  const totalTroops = troops.reduce((s, t) => s + (t.size || 0), 0);
  const totalEquipment = equipment.reduce((s, e) => s + (e.count || 0), 0);
  const highThreats = troops.filter(t => t.threat === 'HIGH').length;

  const st = {
    container: { padding: '24px', color: '#e0e8f0', maxWidth: '1600px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 700, margin: 0 },
    subtitle: { fontSize: '13px', color: '#8899aa', margin: 0 },
    refreshBtn: { padding: '8px 16px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' },
    statLabel: { fontSize: '11px', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
    statValue: { fontSize: '32px', fontWeight: 700 },
    tabBar: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', flexWrap: 'wrap' },
    tabBtn: (active) => ({ padding: '8px 16px', background: active ? 'rgba(239,68,68,0.15)' : 'transparent', color: active ? '#ef4444' : '#8899aa', border: `1px solid ${active ? '#ef4444' : 'transparent'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }),
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
    card: (color) => ({ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', borderLeft: `3px solid ${color}` }),
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    cardTitle: (color) => ({ fontSize: '16px', fontWeight: 700, color }),
    cardSub: { fontSize: '12px', color: '#8899aa' },
    badge: (color) => ({ padding: '2px 8px', background: `${color}20`, color, borderRadius: '4px', fontSize: '11px', fontWeight: 600, alignSelf: 'flex-start' }),
    row: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' },
    rowLabel: { color: '#8899aa' },
    mapWrapper: { height: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' },
    errorBanner: { padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }
  };

  return (
    <div style={st.container}>
      <div style={st.header}>
        <div>
          <h1 style={st.title}>Enemy Intelligence</h1>
          <p style={st.subtitle}>Hostile Force Tracking & Target Identification</p>
        </div>
        <button style={st.refreshBtn} onClick={fetchEnemy}>Refresh Intel</button>
      </div>

      {error && (
        <div style={st.errorBanner}>
          <AlertTriangle size={20} />
          <span style={{ fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <div style={st.statsGrid}>
        {[
          { label: 'Enemy Personnel', value: totalTroops, color: '#ef4444', icon: Users },
          { label: 'Weapons', value: totalWeapons, color: '#f59e0b', icon: Bomb },
          { label: 'Vehicles', value: totalEquipment, color: '#8b5cf6', icon: Truck },
          { label: 'Facilities', value: facilities.length, color: '#06b6d4', icon: Building2 },
          { label: 'High Threat Cells', value: highThreats, color: '#ef4444', icon: AlertTriangle }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={st.statCard}>
              <div style={st.statLabel}><Icon size={14} color={s.color} /> {s.label}</div>
              <div style={{ ...st.statValue, color: s.color }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      <div style={st.tabBar}>
        {[
          { id: 'weapons', label: 'Weapons', icon: Bomb },
          { id: 'troops', label: 'Troops', icon: Users },
          { id: 'equipment', label: 'Equipment', icon: Truck },
          { id: 'facilities', label: 'Facilities', icon: Building2 },
          { id: 'map', label: 'Map View', icon: MapPin }
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} style={st.tabBtn(tab === id)} onClick={() => setTab(id)}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading && <div style={{ padding: '60px', textAlign: 'center', color: '#8899aa' }}>Loading enemy intel...</div>}

      {!loading && tab === 'weapons' && (
        <div style={st.cardGrid}>
          {weapons.map(w => (
            <div key={w.id} style={st.card('#f59e0b')}>
              <div style={st.cardHeader}>
                <div>
                  <div style={st.cardTitle('#f59e0b')}>{w.model}</div>
                  <div style={st.cardSub}>{w.type}</div>
                </div>
                <div style={st.badge('#f59e0b')}>x{w.count}</div>
              </div>
              <div style={st.row}><span style={st.rowLabel}>Caliber</span><strong>{w.caliber}</strong></div>
              <div style={st.row}><span style={st.rowLabel}>Location</span><strong>{w.location}</strong></div>
              <div style={st.row}><span style={st.rowLabel}>Confidence</span><strong style={{ color: w.confidence > 0.85 ? '#22c55e' : '#f59e0b' }}>{(w.confidence * 100).toFixed(0)}%</strong></div>
              <div style={st.row}><span style={st.rowLabel}>Source</span><strong style={{ color: '#4fc3f7' }}>{w.source}</strong></div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'troops' && (
        <div style={st.cardGrid}>
          {troops.map(t => (
            <div key={t.id} style={st.card(threatColors[t.threat])}>
              <div style={st.cardHeader}>
                <div>
                  <div style={st.cardTitle(threatColors[t.threat])}>{t.unit}</div>
                  <div style={st.cardSub}>{t.location}</div>
                </div>
                <div style={st.badge(threatColors[t.threat])}>{t.threat}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                <Users size={20} color={threatColors[t.threat]} />
                <span style={{ fontSize: '24px', fontWeight: 700, color: threatColors[t.threat] }}>{t.size}</span>
                <span style={st.cardSub}>personnel</span>
              </div>
              <div style={st.row}><span style={st.rowLabel}>Activity</span><strong>{t.activity}</strong></div>
              <div style={st.row}><span style={st.rowLabel}>Last seen</span><strong>{t.lastSeen}</strong></div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'equipment' && (
        <div style={st.cardGrid}>
          {equipment.map(e => (
            <div key={e.id} style={st.card('#8b5cf6')}>
              <div style={st.cardHeader}>
                <div>
                  <div style={st.cardTitle('#8b5cf6')}>{e.model}</div>
                  <div style={st.cardSub}>{e.type}</div>
                </div>
                <div style={st.badge('#8b5cf6')}>x{e.count}</div>
              </div>
              <div style={st.row}><span style={st.rowLabel}>Location</span><strong>{e.location}</strong></div>
              <div style={st.row}><span style={st.rowLabel}>Status</span><strong style={{ color: e.status === 'OPERATIONAL' ? '#22c55e' : '#f59e0b' }}>{e.status}</strong></div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'facilities' && (
        <div style={st.cardGrid}>
          {facilities.map(f => (
            <div key={f.id} style={st.card('#06b6d4')}>
              <div style={st.cardHeader}>
                <div>
                  <div style={st.cardTitle('#06b6d4')}>{f.name}</div>
                  <div style={st.cardSub}>{f.type}</div>
                </div>
                <div style={st.badge('#06b6d4')}>{f.size}</div>
              </div>
              <div style={st.row}><span style={st.rowLabel}>Location</span><strong>{f.location}</strong></div>
              <div style={st.row}><span style={st.rowLabel}>Capacity</span><strong>{f.capacity}</strong></div>
              <div style={st.row}><span style={st.rowLabel}>Status</span><strong style={{ color: f.status === 'ACTIVE' ? '#22c55e' : '#f59e0b' }}>{f.status}</strong></div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'map' && (
        <div style={st.mapWrapper}>
          <MapContainer center={[-4.8, 139.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            {weapons.map(w => (
              <Marker key={w.id} position={[w.lat, w.lng]} icon={weaponIcon}>
                <Popup><strong>{w.model}</strong><br />x{w.count} | {w.location}</Popup>
              </Marker>
            ))}
            {troops.map(t => (
              <Circle key={t.id} center={[t.lat, t.lng]} radius={t.size * 800} pathOptions={{ color: threatColors[t.threat], fillColor: threatColors[t.threat], fillOpacity: 0.2 }}>
                <Tooltip>{t.unit} ({t.size})</Tooltip>
              </Circle>
            ))}
            {troops.map(t => (
              <Marker key={'m-' + t.id} position={[t.lat, t.lng]} icon={troopIcon}>
                <Popup><strong>{t.unit}</strong><br />{t.size} personnel<br />{t.threat}</Popup>
              </Marker>
            ))}
            {facilities.map(f => (
              <Marker key={f.id} position={[f.lat, f.lng]} icon={facilityIcon}>
                <Popup><strong>{f.name}</strong><br />{f.type}<br />Cap: {f.capacity}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default EnemyIntel;

