// D:\AegisGeoInt\frontend\src\pages\AIDetection.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, Thermometer, Activity, Download, Upload, RefreshCw,
  Eye, Crosshair, Clock, Zap, Play, Target, ShieldAlert, Users, Flame, Lock
} from 'lucide-react';

const API_URL = 'http://localhost:8000';
const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1920&auto=format&fit=crop';

const WEAPON_TYPES = [
  { class: 'Assault Rifle', color: '#ef4444' },
  { class: 'Sniper Rifle', color: '#dc2626' },
  { class: 'LMG', color: '#f97316' },
  { class: 'RPG', color: '#eab308' },
  { class: 'Pistol', color: '#a855f7' }
];

const AIDetection = () => {
  const [movement, setMovement] = useState({ status: 'IDLE', count: 0, weapons: 0, lastEvent: null });
  const [captures, setCaptures] = useState([]);
  const [thermal, setThermal] = useState(null);
  const [history, setHistory] = useState([]);
  const [previewImage, setPreviewImage] = useState(SAMPLE_IMAGE);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [scanEffect, setScanEffect] = useState(false);
  const [detections, setDetections] = useState([]);
  
  // State Auto-Track
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTargetId, setTrackingTargetId] = useState(null);
  const [droneDistance, setDroneDistance] = useState(1500);

  const fileInputRef = useRef(null);
  const audioCtxRef = useRef(null);

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  useEffect(() => {
    if (!isAutoMode) {
      setMovement({ status: 'IDLE', count: 0, weapons: 0, lastEvent: movement.lastEvent });
      setScanEffect(false); setDetections([]); return;
    }

    let isCancelled = false;

    const runCycle = () => {
      if (isCancelled) return;
      setScanEffect(true);
      setMovement(prev => ({ ...prev, status: 'SCANNING' }));
      setDetections([]);

      setTimeout(() => {
        if (isCancelled) return;
        setScanEffect(false);

        const personCount = Math.floor(Math.random() * 3) + 2;
        const now = new Date();
        const newDets = [];
        const currentWeapons = [];
        let shouldBeep = false;

        for (let i = 0; i < personCount; i++) {
          const px = 10 + (i * 22) + (Math.random() * 5);
          const py = 30 + (Math.random() * 20);
          const pw = 15 + (Math.random() * 5);
          const ph = 30 + (Math.random() * 10);
          
          const bodyTemp = (36.0 + Math.random() * 3.5).toFixed(1);
          const isFever = bodyTemp > 38.0;

          newDets.push({
            id: `p-${Date.now()}-${i}`, class: 'Person', confidence: (85 + Math.random() * 14).toFixed(1),
            color: isFever ? '#ef4444' : '#22c55e',
            x: px, y: py, w: pw, h: ph, temp: bodyTemp, status: isFever ? 'FEVER' : 'NORMAL'
          });

          if (Math.random() > 0.3) {
            const weapon = WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];
            currentWeapons.push(weapon.class);
            shouldBeep = true;
            newDets.push({
              id: `w-${Date.now()}-${i}`, class: weapon.class, confidence: (70 + Math.random() * 25).toFixed(1),
              color: weapon.color, x: px + (pw * 0.2), y: py + (ph * 0.3), w: pw * 0.8, h: ph * 0.4
            });
          }
        }

        setDetections(newDets);
        setMovement({ status: 'DETECTED', count: personCount, weapons: currentWeapons.length, lastEvent: now.toLocaleTimeString() });

        // Auto-Tracking Logic
        if (isTracking) {
          const target = newDets.find(d => d.class === 'Person');
          if (target) {
            setTrackingTargetId(target.id);
            setDroneDistance(prev => Math.max(100, prev - (Math.random() * 300 + 100))); // Distance decreases
          }
        }

        const avgTemp = (newDets.reduce((acc, curr) => acc + (curr.temp ? parseFloat(curr.temp) : 0), 0) / personCount).toFixed(1);
        setThermal({ mode: 'simulation', anomalies: newDets.filter(d => d.status === 'FEVER').length, objects: [{ temperature: { avg: avgTemp } }] });

        if (shouldBeep) playBeep();

        const newCapture = {
          id: Date.now(), personCount, weaponCount: currentWeapons.length,
          weapons: [...new Set(currentWeapons)].join(', '), timestamp: now.toISOString(), status: 'RECORDED', avgTemp
        };
        setCaptures(prev => [newCapture, ...prev].slice(0, 4));
        
        setHistory(prev => [{
          filename: `intel_${Date.now()}.jpg`, modified: now.toISOString(),
          size_kb: (600 + Math.random() * 100).toFixed(1), weapons: currentWeapons.length
        }, ...prev].slice(0, 10));

        setTimeout(() => {
          if (isCancelled) return;
          setMovement(prev => ({ ...prev, status: 'IDLE' }));
          setDetections([]); setTrackingTargetId(null);
          setTimeout(runCycle, 2000);
        }, 4000);

      }, 2500);
    };

    const initialTimer = setTimeout(runCycle, 1000);
    return () => { isCancelled = true; clearTimeout(initialTimer); };
  }, [isAutoMode, isTracking]); // Dependency added so tracking state is fresh

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
    setIsAutoMode(false);
  };

  const st = {
    container: { padding: '20px', color: '#e0e8f0', background: '#0a0e1a', minHeight: '100vh' },
    header: { padding: '16px', background: 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(79,195,247,0.1))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', position: 'relative' },
    title: { fontSize: '24px', fontWeight: 700, color: '#ef4444', margin: 0, letterSpacing: '2px' },
    subtitle: { fontSize: '12px', color: '#8899aa', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' },
    autoBadge: { position: 'absolute', top: '16px', right: '16px', background: isAutoMode ? 'rgba(239,68,68,0.2)' : 'rgba(79,195,247,0.2)', color: isAutoMode ? '#ef4444' : '#4fc3f7', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' },
    panel: { padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '16px' },
    panelTitle: { fontSize: '13px', fontWeight: 700, color: '#4fc3f7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    camBox: { background: '#000', border: '2px solid #4fc3f7', borderRadius: '8px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    camLabel: { position: 'absolute', top: '8px', left: '8px', padding: '4px 8px', background: 'rgba(79,195,247,0.9)', color: '#0a0e1a', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', zIndex: 10 },
    camStatus: { fontSize: '11px', color: '#22c55e', marginTop: '8px', display: 'flex', justifyContent: 'space-between' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' },
    statCard: { padding: '12px', background: 'rgba(79,195,247,0.05)', border: '1px solid rgba(79,195,247,0.2)', borderRadius: '6px' },
    statLabel: { fontSize: '10px', color: '#8899aa', textTransform: 'uppercase', marginBottom: '4px' },
    statValue: (color) => ({ fontSize: '20px', fontWeight: '700', color: color || '#4fc3f7' }),
    captureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
    captureCard: { padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' },
    captureImg: { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', marginBottom: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#ef4444', fontWeight: 700, position: 'relative', overflow: 'hidden' },
    captureInfo: { fontSize: '11px', color: '#8899aa' },
    captureStatus: (status) => ({ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: status === 'RECORDED' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)', color: status === 'RECORDED' ? '#22c55e' : '#f59e0b', display: 'inline-block', marginTop: '4px' }),
    thermalGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
    thermalCard: { padding: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', textAlign: 'center' },
    thermalLabel: { fontSize: '10px', color: '#8899aa', textTransform: 'uppercase', marginBottom: '8px' },
    thermalValue: { fontSize: '24px', fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
    th: { padding: '8px', textAlign: 'left', background: 'rgba(79,195,247,0.1)', color: '#4fc3f7', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid rgba(79,195,247,0.3)' },
    td: { padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    btn: (color) => ({ padding: '8px 16px', background: `${color}20`, color, border: `1px solid ${color}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }),
    fileInput: { display: 'none' },
    scanLine: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#ef4444', boxShadow: '0 0 15px #ef4444', zIndex: 20, animation: 'scan 1s linear infinite' },
    bbox: (color, isTrackingTarget) => ({ position: 'absolute', border: `2px solid ${isTrackingTarget ? '#eab308' : color}`, background: `${color}20`, zIndex: 15, boxShadow: isTrackingTarget ? '0 0 15px #eab308' : 'none', transition: 'all 0.2s' }),
    bboxLabel: (color, isTrackingTarget) => ({ position: 'absolute', top: '-18px', left: '-2px', background: isTrackingTarget ? '#eab308' : color, color: isTrackingTarget ? '#000' : '#fff', fontSize: '10px', padding: '1px 4px', whiteSpace: 'nowrap', fontWeight: 'bold' })
  };

  return (
    <div style={st.container}>
      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes blink-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={st.header}>
        <h1 style={st.title}>AI DETECTION CONSOLE</h1>
        <p style={st.subtitle}>Weapon & Body Temperature Analysis</p>
        <div style={st.autoBadge}>
          <ShieldAlert size={14} /> {isAutoMode ? 'AUTO-SCANNING ACTIVE' : 'MANUAL MODE'}
        </div>
      </div>

      <div style={st.panel}>
        <div style={st.panelTitle}>
          <Target size={14} /> Live Feed Analysis 
          {isTracking && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12}/> TARGET LOCKED (DIST: {Math.round(droneDistance)}m)</span>}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <button 
            style={{ ...st.btn(isTracking ? '#eab308' : '#8899aa'), background: isTracking ? 'rgba(234,179,8,0.2)' : 'transparent' }}
            onClick={() => setIsTracking(!isTracking)}
          >
            <Crosshair size={14} /> {isTracking ? 'STOP AUTO-TRACK' : 'START AUTO-TRACK (DRONE AI)'}
          </button>
        </div>
        <div style={st.grid2}>
          <div>
            <div style={st.camBox}>
              <span style={st.camLabel}>OPTICAL (RGB)</span>
              {scanEffect && <div style={st.scanLine}></div>}
              {previewImage ? (
                <>
                  <img src={previewImage} alt="RGB" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  {detections.map(det => {
                    const isTarget = isTracking && trackingTargetId === det.id;
                    return (
                      <div key={det.id} style={{ ...st.bbox(det.color, isTarget), left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}>
                        <span style={st.bboxLabel(det.color, isTarget)}>
                          {isTarget && '🔒 '} {det.class} {det.confidence}% {det.temp ? `| ${det.temp}°C` : ''}
                        </span>
                      </div>
                    );
                  })}
                  {movement.status === 'SCANNING' && (
                     <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.1)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', animation: 'blink-red 1s infinite' }}>ANALYZING...</div>
                     </div>
                  )}
                </>
              ) : <div style={{ color: '#444', fontSize: '12px' }}>No Signal</div>}
            </div>
            <div style={st.camStatus}>
              <span>Status: <strong style={{ color: scanEffect ? '#ef4444' : '#22c55e' }}>{scanEffect ? 'SCANNING' : movement.status}</strong></span>
              <span>Model: YOLOv8 + Thermal</span>
            </div>
          </div>

          <div>
            <div style={{ ...st.camBox, borderColor: '#ef4444' }}>
              <span style={{ ...st.camLabel, background: 'rgba(239,68,68,0.9)' }}>THERMAL</span>
              {scanEffect && <div style={{...st.scanLine, background: '#4fc3f7', boxShadow: '0 0 15px #4fc3f7'}}></div>}
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Thermal" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'hue-rotate(180deg) saturate(3) contrast(1.5) brightness(0.8)' }} />
                  {detections.filter(d => d.class === 'Person').map(det => {
                    const isTarget = isTracking && trackingTargetId === det.id;
                    return (
                      <div key={`t-${det.id}`} style={{ ...st.bbox(det.color, isTarget), left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}>
                        <span style={{...st.bboxLabel(det.color, isTarget)}}>{det.temp}°C</span>
                      </div>
                    );
                  })}
                </>
              ) : <div style={{ color: '#444', fontSize: '12px' }}>No Signal</div>}
            </div>
            <div style={st.camStatus}>
              <span>Status: <strong style={{ color: scanEffect ? '#4fc3f7' : '#22c55e' }}>{scanEffect ? 'SCANNING' : movement.status}</strong></span>
              <span>Radiometric: <strong style={{ color: '#f59e0b' }}>SIMULATED</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} style={st.fileInput} />
          <button style={st.btn('#4fc3f7')} onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Upload Manual
          </button>
          <button style={st.btn('#ef4444')} onClick={() => { setIsAutoMode(!isAutoMode); setScanEffect(false); }}>
            <Play size={14} /> {isAutoMode ? 'Stop Scanner' : 'Start Scanner'}
          </button>
        </div>
      </div>

      <div style={st.panel}>
        <div style={st.panelTitle}><Activity size={14} /> Detection Summary</div>
        <div style={st.statGrid}>
          <div style={st.statCard}><div style={st.statLabel}>System Status</div><div style={st.statValue(movement.status === 'DETECTED' ? '#ef4444' : movement.status === 'SCANNING' ? '#4fc3f7' : '#22c55e')}>{movement.status}</div></div>
          <div style={st.statCard}><div style={st.statLabel}>Personnel Detected</div><div style={st.statValue('#22c55e')}>{movement.count || 0}</div></div>
          <div style={st.statCard}><div style={st.statLabel}>Weapons Detected</div><div style={st.statValue('#ef4444')}>{movement.weapons || 0}</div></div>
          <div style={st.statCard}><div style={st.statLabel}>Last Scan</div><div style={st.statValue('#4fc3f7')}>{movement.lastEvent || '--:--:--'}</div></div>
        </div>
      </div>

      <div style={st.panel}>
        <div style={st.panelTitle}><Crosshair size={14} /> Target Captures</div>
        {captures.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#8899aa', fontSize: '12px' }}>Awaiting targets...</div>
        ) : (
          <div style={st.captureGrid}>
            {captures.map((cap, i) => (
              <div key={cap.id} style={st.captureCard}>
                <div style={st.captureImg}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {cap.personCount} Personnel</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#f59e0b' }}><Target size={14} /> {cap.weaponCount} Weapons</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#ef4444' }}><Thermometer size={14} /> Avg: {cap.avgTemp}°C</div>
                  {i === 0 && <div style={{ position: 'absolute', inset: 0, border: '2px solid #ef4444', animation: 'blink-red 2s infinite' }}></div>}
                </div>
                <div style={st.captureInfo}>
                  <div style={{ fontWeight: 'bold', color: '#e0e8f0' }}>INTEL-{String(i + 1).padStart(3, '0')}</div>
                  <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>{cap.weapons || 'No weapons'}</div>
                  <div>{new Date(cap.timestamp).toLocaleTimeString()}</div>
                  <span style={st.captureStatus(cap.status)}>{cap.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={st.panel}>
        <div style={st.panelTitle}><Thermometer size={14} /> Thermal Analysis</div>
        <div style={st.thermalGrid}>
          <div style={st.thermalCard}><div style={st.thermalLabel}>Minimum</div><div style={st.thermalValue}>{thermal?.objects?.[0]?.temperature?.min || '--.-'} °C</div></div>
          <div style={st.thermalCard}><div style={st.thermalLabel}>Average (Body)</div><div style={st.thermalValue}>{thermal?.objects?.[0]?.temperature?.avg || '--.-'} °C</div></div>
          <div style={st.thermalCard}><div style={st.thermalLabel}>Maximum</div><div style={st.thermalValue}>{thermal?.objects?.[0]?.temperature?.max || '--.-'} °C</div></div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '11px', color: thermal?.anomalies > 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
          {thermal?.anomalies > 0 ? `⚠️ ${thermal.anomalies} FEVER SUSPECT DETECTED` : '✅ ALL PERSONNEL NORMAL TEMP'}
        </div>
      </div>

      <div style={st.panel}>
        <div style={st.panelTitle}><Clock size={14} /> Detection History</div>
        <table style={st.table}>
          <thead><tr><th style={st.th}>Time</th><th style={st.th}>File</th><th style={st.th}>Weapons</th><th style={st.th}>Status</th></tr></thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan="4" style={{ ...st.td, textAlign: 'center' }}>No history</td></tr>
            ) : (
              history.map((h, i) => (
                <tr key={i}>
                  <td style={st.td}>{new Date(h.modified).toLocaleTimeString()}</td>
                  <td style={st.td}>{h.filename}</td>
                  <td style={st.td}><strong style={{color: '#ef4444'}}>{h.weapons || 0}</strong> detected</td>
                  <td style={st.td}><span style={{ color: '#22c55e' }}>RECORDED</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIDetection;

