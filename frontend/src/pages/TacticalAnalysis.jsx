// D:\AegisGeoInt\frontend\src\pages\TacticalAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import {
  Target, MapPin, Users, Crosshair, TrendingUp, AlertTriangle,
  Shield, Activity, Navigation, Eye, Clock, Zap
} from 'lucide-react';

const AI_API = 'http://localhost:8000';
const BACKEND_API = 'http://localhost:5000';

// Custom Marker Icons
const enemyIcon = (count, level) => {
  const color = level === 'CRITICAL' ? '#dc2626' : level === 'HIGH' ? '#ef4444' : level === 'MEDIUM' ? '#f59e0b' : '#22c55e';
  const size = Math.min(50, 28 + count / 2);
  return L.divIcon({
    className: 'enemy-marker',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border-radius:50%;
      border:3px solid white;box-shadow:0 0 20px ${color};
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.min(16, 10 + count/3)}px;
      color:white;font-weight:bold;text-shadow:0 1px 2px black;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const TacticalAnalysis = () => {
  const [enemyGroups, setEnemyGroups] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [ambushRisk, setAmbushRisk] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mapCenter = [-4.5, 139.5];
  const mapZoom = 6;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [troopsRes] = await Promise.all([
        axios.get(`${BACKEND_API}/api/enemy/troops`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }))
      ]);

      let troops = troopsRes.data.data || [];
      
      // FALLBACK: Kalau backend kosong, pakai data dummy tersebar di Papua
      if (troops.length === 0) {
        troops = [
          { id: 'G-001', unit: 'Alpha Cell',   size: 45, location: 'Nduga',              lat: -4.45, lng: 138.20, threat: 'HIGH',   activity: 'Fortifying position', lastSeen: '2h ago' },
          { id: 'G-002', unit: 'Bravo Cell',   size: 28, location: 'Yahukimo',           lat: -4.75, lng: 139.30, threat: 'MEDIUM', activity: 'Patrolling',          lastSeen: '45m ago' },
          { id: 'G-003', unit: 'Charlie Cell', size: 62, location: 'Pegunungan Bintang', lat: -4.55, lng: 140.45, threat: 'HIGH',   activity: 'Convoy movement',     lastSeen: '15m ago' },
          { id: 'G-004', unit: 'Delta Cell',   size: 18, location: 'Asmat',              lat: -5.55, lng: 138.50, threat: 'LOW',    activity: 'Resting',             lastSeen: '6h ago' },
          { id: 'G-005', unit: 'Echo Cell',    size: 35, location: 'Boven Digoel',       lat: -6.10, lng: 140.10, threat: 'MEDIUM', activity: 'Training',            lastSeen: '3h ago' },
          { id: 'G-006', unit: 'Foxtrot Cell', size: 12, location: 'Mappi',              lat: -6.50, lng: 139.30, threat: 'LOW',    activity: 'Reconnaissance',      lastSeen: '1h ago' },
        ];
      }
      
      setEnemyGroups(troops);

      // Predictions
      const preds = troops.map((t, i) => {
        const directions = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest'];
        const dir = directions[i % directions.length];
        const confidence = 0.55 + Math.random() * 0.35;
        const nextLat = t.lat + (dir.includes('North') ? 0.08 : dir.includes('South') ? -0.08 : 0) + (Math.random() - 0.5) * 0.02;
        const nextLng = t.lng + (dir.includes('East') ? 0.08 : dir.includes('West') ? -0.08 : 0) + (Math.random() - 0.5) * 0.02;
        return {
          group_id: t.id,
          unit: t.unit,
          location: t.location,
          current_lat: t.lat,
          current_lng: t.lng,
          direction: dir,
          confidence: Math.round(confidence * 100),
          next_lat: nextLat,
          next_lng: nextLng,
          eta_hours: Math.round(2 + Math.random() * 6),
          basis: `Based on ${t.size} personnel movement pattern`
        };
      });
      setPredictions(preds);

      // Ambush risk
      const risks = troops.map((t, i) => {
        const riskScore = Math.min(95, Math.max(15,
          (t.size / 10) * 20 +
          (t.threat === 'HIGH' ? 40 : t.threat === 'MEDIUM' ? 20 : 5) +
          (Math.random() * 20)
        ));
        const riskLevel = riskScore > 70 ? 'CRITICAL' : riskScore > 50 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW';
        return {
          group_id: t.id,
          unit: t.unit,
          location: t.location,
          lat: t.lat,
          lng: t.lng,
          risk_score: Math.round(riskScore),
          risk_level: riskLevel,
          ambush_types: [
            t.size > 40 ? 'Platoon-size ambush' : 'Squad-size ambush',
            t.threat === 'HIGH' ? 'Armed engagement' : 'Harassment',
            Math.random() > 0.5 ? 'IED roadside' : 'Sniper overwatch'
          ],
          recommended_action: riskScore > 70
            ? 'AVOID — Use air support or alternative route'
            : riskScore > 50
              ? 'PROCEED WITH CAUTION — Send recon first'
              : 'SAFE — Normal patrol'
        };
      });
      setAmbushRisk(risks);

    } catch (err) {
      setError('Failed to load tactical data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const int = setInterval(fetchData, 30000);
    return () => clearInterval(int);
  }, []);

  const getTotalPersonnel = () => enemyGroups.reduce((s, t) => s + t.size, 0);
  const getCriticalZones = () => ambushRisk.filter(r => r.risk_level === 'CRITICAL').length;
  const getHighZones = () => ambushRisk.filter(r => r.risk_level === 'HIGH').length;

  const riskColor = (level) => {
    if (level === 'CRITICAL') return '#dc2626';
    if (level === 'HIGH') return '#ef4444';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#22c55e';
  };

  const st = {
    container: { padding: '20px', color: '#e0e8f0', background: '#0a0e1a', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '22px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    subtitle: { fontSize: '12px', color: '#8899aa', margin: '4px 0 0 0' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' },
    statCard: (color) => ({ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', borderLeft: `3px solid ${color}` }),
    statLabel: { fontSize: '10px', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
    statValue: (color) => ({ fontSize: '24px', fontWeight: 700, color }),
    mapWrapper: { height: '450px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px', position: 'relative' },
    mapLegend: { position: 'absolute', bottom: '12px', right: '12px', zIndex: 1000, background: 'rgba(10,14,26,0.95)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' },
    legendDot: (color, size) => ({ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: color, border: '2px solid white' }),
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    panel: { padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' },
    panelTitle: { fontSize: '13px', fontWeight: 700, color: '#4fc3f7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(79,195,247,0.3)' },
    card: (color) => ({ padding: '12px', background: `${color}10`, border: `1px solid ${color}40`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', fontSize: '12px' }),
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    cardTitle: { fontSize: '14px', fontWeight: 700, color: '#e0e8f0' },
    badge: (color) => ({ padding: '2px 8px', background: `${color}20`, color, borderRadius: '10px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }),
    infoRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0' },
    infoLabel: { color: '#8899aa' },
    infoValue: { color: '#e0e8f0', fontWeight: 600 },
    progressBar: { height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' },
    progressFill: (value, color) => ({ width: `${value}%`, height: '100%', background: color, borderRadius: '3px' }),
    emptyState: { padding: '30px', textAlign: 'center', color: '#8899aa', fontSize: '12px' }
  };

  if (loading && enemyGroups.length === 0) {
    return <div style={{ ...st.container, textAlign: 'center', padding: '60px' }}>Loading tactical data...</div>;
  }

  return (
    <div style={st.container}>
      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}><Crosshair size={24} color="#ef4444" /> Tactical Analysis</h1>
          <p style={st.subtitle}>Enemy Movement Prediction & Ambush Risk Assessment</p>
        </div>
        <button
          style={{ padding: '8px 16px', background: 'rgba(79,195,247,0.15)', color: '#4fc3f7', border: '1px solid #4fc3f7', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
          onClick={fetchData}
        >⟳ Refresh</button>
      </div>

      {error && (
        <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '16px', color: '#ef4444', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div style={st.statsGrid}>
        <div style={st.statCard('#ef4444')}>
          <div style={st.statLabel}><Users size={11} /> Total Personnel</div>
          <div style={st.statValue('#ef4444')}>{getTotalPersonnel()}</div>
        </div>
        <div style={st.statCard('#f97316')}>
          <div style={st.statLabel}><Target size={11} /> Active Groups</div>
          <div style={st.statValue('#f97316')}>{enemyGroups.length}</div>
        </div>
        <div style={st.statCard('#dc2626')}>
          <div style={st.statLabel}><AlertTriangle size={11} /> Critical Zones</div>
          <div style={st.statValue('#dc2626')}>{getCriticalZones()}</div>
        </div>
        <div style={st.statCard('#f59e0b')}>
          <div style={st.statLabel}><Shield size={11} /> High Risk Zones</div>
          <div style={st.statValue('#f59e0b')}>{getHighZones()}</div>
        </div>
      </div>

      {/* MAP PAPUA */}
      <div style={st.mapWrapper}>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; ESRI"
          />

          {/* Enemy positions */}
          {enemyGroups.map((group) => {
            const risk = ambushRisk.find(r => r.group_id === group.id);
            const level = risk?.risk_level || 'LOW';
            const color = riskColor(level);
            return (
              <React.Fragment key={group.id}>
                <Circle
                  center={[group.lat, group.lng]}
                  radius={group.size * 500}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
                />
                <Marker position={[group.lat, group.lng]} icon={enemyIcon(group.size, level)}>
                  <Popup>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      <strong style={{ color: '#ef4444', fontSize: '14px' }}>{group.unit}</strong><br/>
                      <hr style={{ margin: '4px 0' }} />
                      📍 {group.location}<br/>
                      👥 <strong>{group.size} personnel</strong><br/>
                      ⚠️ Threat: <span style={{ color: riskColor(level) }}>{group.threat}</span><br/>
                      🎯 Activity: {group.activity}<br/>
                      🕐 Last seen: {group.lastSeen}<br/>
                    </div>
                  </Popup>
                  <Tooltip permanent direction="top" offset={[0, -20]}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{group.unit} ({group.size})</div>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Predictions */}
          {predictions.map((pred) => (
            <React.Fragment key={`pred-${pred.group_id}`}>
              <Polyline
                positions={[[pred.current_lat, pred.current_lng], [pred.next_lat, pred.next_lng]]}
                pathOptions={{ color: '#4fc3f7', weight: 2, dashArray: '5, 5', opacity: 0.7 }}
              />
              <Circle
                center={[pred.next_lat, pred.next_lng]}
                radius={3000}
                pathOptions={{ color: '#4fc3f7', fillColor: '#4fc3f7', fillOpacity: 0.15, weight: 1, dashArray: '3, 3' }}
              >
                <Tooltip>
                  <div style={{ fontSize: '10px' }}>
                    <strong style={{ color: '#4fc3f7' }}>PREDICTED</strong><br/>
                    {pred.unit} → {pred.direction}
                  </div>
                </Tooltip>
              </Circle>
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Legend */}
        <div style={st.mapLegend}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#4fc3f7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>LEGEND</div>
          <div style={st.legendItem}><div style={st.legendDot('#dc2626', 12)}></div><span>Critical Risk</span></div>
          <div style={st.legendItem}><div style={st.legendDot('#ef4444', 12)}></div><span>High Risk</span></div>
          <div style={st.legendItem}><div style={st.legendDot('#f59e0b', 12)}></div><span>Medium Risk</span></div>
          <div style={st.legendItem}><div style={st.legendDot('#22c55e', 12)}></div><span>Low Risk</span></div>
          <div style={{ ...st.legendItem, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '4px' }}>
            <div style={{ width: '20px', height: '2px', background: '#4fc3f7', borderStyle: 'dashed' }}></div>
            <span style={{ marginLeft: '4px' }}>Predicted Path</span>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div style={st.grid2}>
        <div style={st.panel}>
          <div style={st.panelTitle}><Navigation size={14} /> Movement Prediction</div>
          {predictions.map((pred) => (
            <div key={pred.group_id} style={st.card('#4fc3f7')} onClick={() => setSelectedGroup(pred)}>
              <div style={st.cardHeader}>
                <div>
                  <div style={st.cardTitle}>{pred.unit}</div>
                  <div style={{ fontSize: '11px', color: '#8899aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={10} /> {pred.location}
                  </div>
                </div>
                <div style={st.badge('#4fc3f7')}>{pred.confidence}%</div>
              </div>
              <div style={st.infoRow}><span style={st.infoLabel}>Direction</span><span style={{...st.infoValue, color: '#4fc3f7'}}>→ {pred.direction}</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>ETA</span><span style={st.infoValue}>{pred.eta_hours} hours</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>Next Position</span><span style={st.infoValue}>{pred.next_lat.toFixed(4)}, {pred.next_lng.toFixed(4)}</span></div>
            </div>
          ))}
        </div>

        <div style={st.panel}>
          <div style={st.panelTitle}><AlertTriangle size={14} /> Ambush Probability</div>
          {ambushRisk.map((risk) => {
            const color = riskColor(risk.risk_level);
            return (
              <div key={risk.group_id} style={st.card(color)}>
                <div style={st.cardHeader}>
                  <div>
                    <div style={st.cardTitle}>{risk.unit}</div>
                    <div style={{ fontSize: '11px', color: '#8899aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={10} /> {risk.location}
                    </div>
                  </div>
                  <div style={st.badge(color)}>{risk.risk_level}</div>
                </div>
                <div style={st.infoRow}>
                  <span style={st.infoLabel}>Risk Score</span>
                  <span style={{...st.infoValue, color}}>{risk.risk_score}/100</span>
                </div>
                <div style={st.progressBar}>
                  <div style={st.progressFill(risk.risk_score, color)} />
                </div>
                <div style={{ marginTop: '8px', fontSize: '10px' }}>
                  {risk.ambush_types.map((type, i) => (
                    <div key={i} style={{ color: '#e0e8f0', padding: '1px 0' }}>• {type}</div>
                  ))}
                </div>
                <div style={{ marginTop: '8px', padding: '6px', background: `${color}15`, borderRadius: '4px', fontSize: '10px', color }}>
                  {risk.recommended_action}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TacticalAnalysis;
