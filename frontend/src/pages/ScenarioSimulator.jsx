// D:\AegisGeoInt\frontend\src\pages\ScenarioSimulator.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import {
  Swords, Target, Zap, Shield, Heart, Bomb, Plane, AlertTriangle,
  CheckCircle, Clock, Users, TrendingUp, Play, ChevronRight, Crosshair
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

const ICON_MAP = {
  BOMB: Bomb,
  DRONE: Plane,
  SOLDIER: Users,
  SHIELD: Shield,
  HEART: Heart,
  ZAP: Zap
};

// Custom Marker Icons
const targetIcon = L.divIcon({
  className: 'target-icon',
  html: `<div style="width:30px;height:30px;background:#ef4444;border-radius:50%;border:2px solid white;box-shadow:0 0 20px #ef4444;display:flex;align-items:center;justify-content:center;font-size:16px;color:white;font-weight:bold;animation: pulse 1.5s infinite;">✖</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15]
});

const ScenarioSimulator = () => {
  const [scenarios, setScenarios] = useState([]);
  const [targets, setTargets] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simPhase, setSimPhase] = useState('IDLE'); // IDLE, LAUNCH, IMPACT

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, t, h] = await Promise.all([
        axios.get(`${API_URL}/api/scenario/types`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/enemy/troops`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/scenario/history`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }))
      ]);
      
      setScenarios(s.data.data || []);
      
      // Fallback targets kalau backend kosong
      let tList = t.data.data || [];
      if (tList.length === 0) {
        tList = [
          { id: 'G-001', unit: 'Alpha Cell', size: 45, location: 'Nduga', lat: -4.45, lng: 138.20, threat: 'HIGH' },
          { id: 'G-002', unit: 'Bravo Cell', size: 28, location: 'Yahukimo', lat: -4.75, lng: 139.30, threat: 'MEDIUM' },
          { id: 'G-003', unit: 'Charlie Cell', size: 62, location: 'Pegunungan Bintang', lat: -4.55, lng: 140.45, threat: 'HIGH' },
        ];
      }
      setTargets(tList);
      setHistory(h.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const runSimulation = async () => {
    if (!selectedScenario || !selectedTarget) return;
    try {
      setSimulating(true);
      setSimulation(null);
      setSimPhase('LAUNCH');

      // Animasi: Tunggu 2 detik (Launching)
      setTimeout(() => {
        setSimPhase('IMPACT');
      }, 2000);

      const res = await axios.post(`${API_URL}/api/scenario/simulate`, {
        scenarioType: selectedScenario.id,
        targetId: selectedTarget.unit,
        targetType: 'TROOP',
        targetSize: selectedTarget.size
      }, { timeout: 10000 });

      // Tunggu total 4 detik biar animasi kerasa
      setTimeout(() => {
        setSimulation(res.data.data);
        setSimPhase('IDLE');
        setSimulating(false);
      }, 4000);

    } catch (err) {
      console.error('Simulation error:', err.message);
      setSimPhase('IDLE');
      setSimulating(false);
    }
  };

  const st = {
    container: { padding: '24px', color: '#e0e8f0', maxWidth: '1600px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    subtitle: { fontSize: '13px', color: '#8899aa', margin: 0 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    section: { padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' },
    sectionTitle: { fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    optionCard: (selected, color) => ({ padding: '12px', marginBottom: '8px', background: selected ? `${color}20` : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? color : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }),
    optionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
    optionName: { fontSize: '13px', fontWeight: 600 },
    optionDesc: { fontSize: '11px', color: '#8899aa' },
    simulateBtn: { width: '100%', padding: '14px', background: 'linear-gradient(90deg, #ef4444, #f59e0b)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' },
    simulateBtnDisabled: { background: 'rgba(255,255,255,0.05)', color: '#666' },
    resultBox: { padding: '24px', background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.15))', border: '2px solid #ef4444', borderRadius: '12px', marginTop: '24px' },
    resultGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' },
    resultCard: { padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' },
    resultLabel: { fontSize: '11px', color: '#8899aa', textTransform: 'uppercase', marginBottom: '8px' },
    resultValue: (color) => ({ fontSize: '24px', fontWeight: 700, color }),
    mapWrapper: { height: '500px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(239,68,68,0.4)', position: 'relative' },
    overlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }
  };

  return (
    <div style={st.container}>
      <style>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes fly { 0% { transform: translateY(-50px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div style={st.header}>
        <div>
          <h1 style={st.title}><Swords size={24} color="#ef4444" /> Scenario Simulator</h1>
          <p style={st.subtitle}>What-If Analysis & Military Action Planning</p>
        </div>
      </div>

      <div style={st.grid2}>
        <div style={st.section}>
          <div style={st.sectionTitle}><Target size={16} color="#4fc3f7" /> 1. Select Action Type</div>
          {scenarios.map(s => {
            const Icon = ICON_MAP[s.icon] || Swords;
            const selected = selectedScenario?.id === s.id;
            return (
              <div key={s.id} style={st.optionCard(selected, '#4fc3f7')} onClick={() => { setSelectedScenario(s); setSimulation(null); setSimPhase('IDLE'); }}>
                <div style={st.optionHeader}>
                  <Icon size={18} color={selected ? '#4fc3f7' : '#8899aa'} />
                  <span style={st.optionName}>{s.name}</span>
                  {selected && <CheckCircle size={14} color="#22c55e" />}
                </div>
                <div style={st.optionDesc}>{s.description}</div>
              </div>
            );
          })}
        </div>

        <div style={st.section}>
          <div style={st.sectionTitle}><Target size={16} color="#ef4444" /> 2. Select Target</div>
          {targets.map(t => {
            const selected = selectedTarget?.id === t.id;
            return (
              <div key={t.id} style={st.optionCard(selected, t.threat === 'HIGH' ? '#ef4444' : t.threat === 'MEDIUM' ? '#f59e0b' : '#22c55e')} onClick={() => { setSelectedTarget(t); setSimulation(null); setSimPhase('IDLE'); }}>
                <div style={st.optionHeader}>
                  <Users size={16} color={selected ? '#ef4444' : '#8899aa'} />
                  <span style={st.optionName}>{t.unit}</span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', background: t.threat === 'HIGH' ? '#ef444420' : t.threat === 'MEDIUM' ? '#f59e0b20' : '#22c55e20', color: t.threat === 'HIGH' ? '#ef4444' : t.threat === 'MEDIUM' ? '#f59e0b' : '#22c55e', borderRadius: '4px' }}>{t.threat}</span>
                </div>
                <div style={st.optionDesc}>{t.location} • {t.size} personnel</div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        style={{ ...st.simulateBtn, ...((!selectedScenario || !selectedTarget || simulating) ? st.simulateBtnDisabled : {}) }}
        onClick={runSimulation}
        disabled={!selectedScenario || !selectedTarget || simulating}
      >
        {simulating ? (simPhase === 'LAUNCH' ? '🚀 LAUNCHING ASSETS...' : '💥 IMPACT IMMINENT...') : <><Play size={18} /> Execute Simulation</>}
      </button>

      {/* PETA KONFLIK & HASIL SIMULASI */}
      {(selectedTarget || simulation) && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={20} /> Conflict Map Simulation
          </h2>
          
          <div style={st.mapWrapper}>
            <MapContainer center={[-4.5, 139.5]} zoom={6} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              
              {/* Marker Target Utama */}
              {selectedTarget && (
                <Marker position={[selectedTarget.lat, selectedTarget.lng]} icon={targetIcon}>
                  <Popup>
                    <strong>{selectedTarget.unit}</strong><br/>
                    {selectedTarget.location}<br/>
                    {selectedTarget.size} personnel
                  </Popup>
                </Marker>
              )}

              {/* Animasi Efek */}
              {simPhase === 'LAUNCH' && selectedScenario && selectedTarget && (
                <>
                  {/* Airstrike / Misil */}
                  {(selectedScenario.id === 'AIRSTRIKE' || selectedScenario.id === 'CYBER_ATTACK') && (
                    <Polyline 
                      positions={[[selectedTarget.lat + 1.5, selectedTarget.lng], [selectedTarget.lat, selectedTarget.lng]]} 
                      pathOptions={{ color: '#ef4444', weight: 3, dashArray: '10, 10', className: 'animate-pulse' }} 
                    />
                  )}
                  {/* Drone Recon */}
                  {selectedScenario.id === 'DRONE_RECON' && (
                    <Circle 
                      center={[selectedTarget.lat, selectedTarget.lng]} 
                      radius={30000} 
                      pathOptions={{ color: '#4fc3f7', fillColor: '#4fc3f7', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} 
                    />
                  )}
                  {/* Ground Assault */}
                  {selectedScenario.id === 'GROUND_ASSAULT' && (
                    <Polyline 
                      positions={[[selectedTarget.lat - 0.5, selectedTarget.lng - 0.5], [selectedTarget.lat, selectedTarget.lng]]} 
                      pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '20, 10' }} 
                    />
                  )}
                </>
              )}

              {/* Efek Impact (Ledakan) */}
              {simPhase === 'IMPACT' && selectedTarget && (
                <Circle 
                  center={[selectedTarget.lat, selectedTarget.lng]} 
                  radius={15000} 
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.5, weight: 0 }} 
                >
                  <Popup>Target Hit</Popup>
                </Circle>
              )}
            </MapContainer>

            {/* Overlay Animasi Text */}
            {simPhase !== 'IDLE' && (
              <div style={{...st.overlay, pointerEvents: 'none'}}>
                {simPhase === 'LAUNCH' && (
                  <div style={{ textAlign: 'center', animation: 'fly 1s ease-out' }}>
                    <Plane size={48} color="#4fc3f7" style={{ marginBottom: '16px', animation: 'pulse 1s infinite' }} />
                    <h2 style={{ margin: 0, letterSpacing: '4px', color: '#4fc3f7' }}>ASSETS INBOUND</h2>
                    <p style={{ color: '#8899aa', marginTop: '8px' }}>{selectedScenario?.name} executing...</p>
                  </div>
                )}
                {simPhase === 'IMPACT' && (
                  <div style={{ textAlign: 'center' }}>
                    <Bomb size={64} color="#ef4444" style={{ marginBottom: '16px', animation: 'pulse 0.5s infinite' }} />
                    <h2 style={{ margin: 0, letterSpacing: '4px', color: '#ef4444' }}>TARGET IMPACTED</h2>
                    <p style={{ color: '#8899aa', marginTop: '8px' }}>Analyzing damage assessment...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hasil Simulasi Text */}
          {simulation && (
            <div style={st.resultBox}>
              <h3 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} /> Battle Damage Assessment
              </h3>
              <div style={st.resultGrid}>
                <div style={st.resultCard}><div style={st.resultLabel}>Success Chance</div><div style={st.resultValue('#22c55e')}>{simulation.simulation.successChance}%</div></div>
                <div style={st.resultCard}><div style={st.resultLabel}>Enemy Casualties</div><div style={st.resultValue('#ef4444')}>{simulation.simulation.enemyCasualty}</div></div>
                <div style={st.resultCard}><div style={st.resultLabel}>Friendly Casualties</div><div style={st.resultValue('#f59e0b')}>{simulation.simulation.friendlyCasualty}</div></div>
                <div style={st.resultCard}><div style={st.resultLabel}>Collateral Risk</div><div style={st.resultValue(simulation.simulation.risk === 'HIGH' ? '#ef4444' : '#22c55e')}>{simulation.simulation.risk}</div></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;
