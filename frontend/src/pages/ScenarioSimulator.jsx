// D:\AegisGeoInt\frontend\src\pages\ScenarioSimulator.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import {
  Swords, Target, Zap, Shield, Heart, Bomb, Plane, AlertTriangle,
  CheckCircle, Clock, Users, TrendingUp, Play, Crosshair, Flame, Skull
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

// Icons
const targetIcon = L.divIcon({
  className: 'target-icon',
  html: `<div style="width:30px;height:30px;background:#ef4444;border-radius:50%;border:2px solid white;box-shadow:0 0 20px #ef4444;display:flex;align-items:center;justify-content:center;font-size:16px;color:white;font-weight:bold;">✖</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15]
});

const allyIcon = L.divIcon({
  className: 'ally-icon',
  html: `<div style="width:24px;height:24px;background:#4fc3f7;border-radius:4px;border:2px solid white;box-shadow:0 0 10px #4fc3f7;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:bold;">★</div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
};

const ScenarioSimulator = () => {
  const [scenarios, setScenarios] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  
  // State untuk Battle Sim
  const [battleState, setBattleState] = useState('IDLE'); // IDLE, DEPLOYING, COMBAT, ENDED
  const [combatLog, setCombatLog] = useState([]);
  const [stats, setStats] = useState({ ally: 100, enemy: 100, allyCasualties: 0, enemyCasualties: 0 });
  const [tracers, setTracers] = useState([]);
  const [winner, setWinner] = useState(null);

  const battleTimerRef = useRef(null);

  const fetchData = async () => {
    try {
      const [s, t] = await Promise.all([
        axios.get(`${API_URL}/api/scenario/types`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/enemy/troops`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }))
      ]);
      setScenarios(s.data.data || []);
      
      let tList = t.data.data || [];
      if (tList.length === 0) {
        tList = [
          { id: 'G-001', unit: 'Alpha Cell', size: 45, location: 'Nduga', lat: -4.45, lng: 138.20, threat: 'HIGH' },
          { id: 'G-002', unit: 'Bravo Cell', size: 28, location: 'Yahukimo', lat: -4.75, lng: 139.30, threat: 'MEDIUM' },
        ];
      }
      setTargets(tList);
    } catch (err) {}
  };

  useEffect(() => { fetchData(); }, []);

  // LOGIKA SIMULASI PERTEMPURAN
  const startBattle = () => {
    if (!selectedTarget) return;
    
    setBattleState('DEPLOYING');
    setCombatLog([{ time: new Date().toLocaleTimeString(), msg: 'Pasukan TNI/Polri bergerak menuju target...', color: '#4fc3f7' }]);
    setStats({ ally: 100, enemy: 100, allyCasualties: 0, enemyCasualties: 0 });
    setWinner(null);
    setTracers([]);

    // Fase 1: Deploying (3 detik)
    setTimeout(() => {
      setBattleState('COMBAT');
      setCombatLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'KONTAK SENJATA! Pertempuran dimulai.', color: '#f59e0b' }]);
      
      // Fase 2: Combat Loop (Tiap 1 detik)
      let tick = 0;
      battleTimerRef.current = setInterval(() => {
        tick++;
        
        // Generate Tracer Fire (Garis Tembak)
        const newTracers = Array.from({ length: 3 }).map(() => ({
          id: Date.now() + Math.random(),
          startLat: selectedTarget.lat + (Math.random() - 0.5) * 0.1, // Dari arah kita
          startLng: selectedTarget.lng + (Math.random() - 0.5) * 0.1,
          endLat: selectedTarget.lat + (Math.random() - 0.5) * 0.05,
          endLng: selectedTarget.lng + (Math.random() - 0.5) * 0.05
        }));
        setTracers(prev => [...prev, ...newTracers].slice(-10)); // Max 10 tracer

        // Kalkulasi Damage
        const enemyDmg = Math.floor(Math.random() * 15) + 5;
        const allyDmg = Math.floor(Math.random() * 10) + 2;

        setStats(prev => {
          const newAlly = Math.max(0, prev.ally - allyDmg);
          const newEnemy = Math.max(0, prev.enemy - enemyDmg);
          
          // Log Random
          if (Math.random() > 0.5) {
            setCombatLog(logs => [...logs, { time: new Date().toLocaleTimeString(), msg: `Tembakan musuh melukai ${allyDmg} personel kita.`, color: '#ef4444' }].slice(-5));
          } else {
            setCombatLog(logs => [...logs, { time: new Date().toLocaleTimeString(), msg: `Serangan kita menghabisi ${enemyDmg} KKB.`, color: '#22c55e' }].slice(-5));
          }

          // Cek Pemenang
          if (newEnemy <= 0 || newAlly <= 0 || tick > 15) {
            clearInterval(battleTimerRef.current);
            setBattleState('ENDED');
            const isWin = newEnemy <= 0 || (newAlly > newEnemy && tick > 15);
            setWinner(isWin ? 'ALLY' : 'ENEMY');
            setCombatLog(logs => [...logs, { 
              time: new Date().toLocaleTimeString(), 
              msg: isWin ? 'KEMENANGAN! KKB berhasil dieliminasi.' : 'MUNDUR! Pasukan kita kewalahan.', 
              color: isWin ? '#22c55e' : '#ef4444' 
            }]);
          }
          
          return { ally: newAlly, enemy: newEnemy, allyCasualties: 100 - newAlly, enemyCasualties: 100 - newEnemy };
        });

      }, 1000);
    }, 3000);
  };

  // Cleanup
  useEffect(() => {
    return () => { if (battleTimerRef.current) clearInterval(battleTimerRef.current); };
  }, []);

  const st = {
    container: { padding: '24px', color: '#e0e8f0', maxWidth: '1600px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    section: { padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' },
    optionCard: (selected, color) => ({ padding: '12px', marginBottom: '8px', background: selected ? `${color}20` : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? color : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', cursor: 'pointer' }),
    btn: { width: '100%', padding: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '2px' },
    mapWrapper: { height: '500px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #ef4444', position: 'relative' },
    panelOverlay: { position: 'absolute', top: '10px', right: '10px', zIndex: 1000, width: '300px', background: 'rgba(10,14,26,0.9)', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', backdropFilter: 'blur(5px)' },
    barBg: { height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px', marginBottom: '12px' },
    barFill: (w, color) => ({ width: `${w}%`, height: '100%', background: color, transition: 'width 0.3s' }),
    logBox: { position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, width: '400px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', maxHeight: '150px', overflowY: 'auto' },
    winnerOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }
  };

  return (
    <div style={st.container}>
      <style>{`
        @keyframes tracer { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>

      <div style={st.header}>
        <h1 style={st.title}><Swords size={28} color="#ef4444" /> Battle Simulation</h1>
      </div>

      <div style={st.grid2}>
        <div style={st.section}>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: '#4fc3f7' }}>1. Pilih Target Operasi</div>
          {targets.map(t => (
            <div key={t.id} style={st.optionCard(selectedTarget?.id === t.id, '#ef4444')} onClick={() => { setSelectedTarget(t); setBattleState('IDLE'); }}>
              <div style={{ fontWeight: 700, color: selectedTarget?.id === t.id ? '#ef4444' : '#e0e8f0' }}>{t.unit}</div>
              <div style={{ fontSize: '12px', color: '#8899aa' }}>{t.location} • {t.size} personel KKB</div>
            </div>
          ))}
        </div>

        <div style={st.section}>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: '#4fc3f7' }}>2. Eksekusi Serangan</div>
          <p style={{ fontSize: '13px', color: '#8899aa', lineHeight: '1.6' }}>Simulasi pertempuran terbuka antara Pasukan TNI/Polri vs KKB. Peta akan menampilkan tembak-menembak secara real-time.</p>
          <button style={{...st.btn, opacity: selectedTarget ? 1 : 0.5}} disabled={!selectedTarget || battleState === 'COMBAT' || battleState === 'DEPLOYING'} onClick={startBattle}>
            <Flame size={24} /> {battleState === 'COMBAT' ? 'PERTEMPURAN BERLANGSUNG...' : 'GAS PERTEMPURAN'}
          </button>
        </div>
      </div>

      {selectedTarget && (
        <div style={st.mapWrapper}>
          <MapContainer center={[selectedTarget.lat, selectedTarget.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <MapController center={[selectedTarget.lat, selectedTarget.lng]} zoom={12} />
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            
            {/* Posisi KKB */}
            <Marker position={[selectedTarget.lat, selectedTarget.lng]} icon={targetIcon} />
            <Circle center={[selectedTarget.lat, selectedTarget.lng]} radius={500} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }} />

            {/* Garis Tembakan (Tracers) */}
            {tracers.map(tr => (
              <Polyline 
                key={tr.id} 
                positions={[[tr.startLat, tr.startLng], [tr.endLat, tr.endLng]]} 
                pathOptions={{ color: '#f59e0b', weight: 2, opacity: 0.8 }} 
              />
            ))}

            {/* Efek Ledakan saat Combat */}
            {battleState === 'COMBAT' && Array.from({length: 3}).map((_, i) => (
              <Circle 
                key={i}
                center={[selectedTarget.lat + (Math.random()-0.5)*0.002, selectedTarget.lng + (Math.random()-0.5)*0.002]} 
                radius={100} 
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.5, weight: 0 }} 
              />
            ))}
          </MapContainer>

          {/* HUD STATUS PERTEMPURAN */}
          {(battleState === 'COMBAT' || battleState === 'DEPLOYING' || battleState === 'ENDED') && (
            <div style={st.panelOverlay}>
              <h3 style={{ margin: '0 0 12px 0', color: '#ef4444', fontSize: '14px', borderBottom: '1px solid #ef4444', paddingBottom: '8px' }}>STATUS PERTEMPURAN</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#4fc3f7' }}>★ PASUKAN KITA</span>
                <span style={{ fontWeight: 700 }}>{stats.ally}%</span>
              </div>
              <div style={st.barBg}><div style={st.barFill(stats.ally, '#4fc3f7')} /></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#ef4444' }}>✖ KKB (MUSUH)</span>
                <span style={{ fontWeight: 700 }}>{stats.enemy}%</span>
              </div>
              <div style={st.barBg}><div style={st.barFill(stats.enemy, '#ef4444')} /></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8899aa', marginTop: '12px' }}>
                <span>Korban Kita: {stats.allyCasualties}</span>
                <span>Korban Musuh: {stats.enemyCasualties}</span>
              </div>
            </div>
          )}

          {/* COMBAT LOG */}
          {combatLog.length > 0 && (
            <div style={st.logBox}>
              {combatLog.map((log, i) => (
                <div key={i} style={{ color: log.color, marginBottom: '4px' }}>
                  <span style={{ color: '#8899aa' }}>[{log.time}]</span> {log.msg}
                </div>
              ))}
            </div>
          )}

          {/* WINNER OVERLAY */}
          {battleState === 'ENDED' && (
            <div style={st.winnerOverlay}>
              {winner === 'ALLY' ? (
                <>
                  <Shield size={80} color="#22c55e" style={{ marginBottom: '20px' }} />
                  <h1 style={{ color: '#22c55e', fontSize: '48px', margin: 0, letterSpacing: '4px' }}>MISSION ACCOMPLISHED</h1>
                  <p style={{ color: '#8899aa', fontSize: '18px', marginTop: '10px' }}>Pasukan KKB berhasil dieliminasi.</p>
                </>
              ) : (
                <>
                  <Skull size={80} color="#ef4444" style={{ marginBottom: '20px' }} />
                  <h1 style={{ color: '#ef4444', fontSize: '48px', margin: 0, letterSpacing: '4px' }}>MISSION FAILED</h1>
                  <p style={{ color: '#8899aa', fontSize: '18px', marginTop: '10px' }}>Pasukan kita terpaksa mundur.</p>
                </>
              )}
              <button style={{ ...st.btn, width: 'auto', marginTop: '30px', padding: '12px 30px' }} onClick={() => setBattleState('IDLE')}>
                TUTUP LAPORAN
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;
