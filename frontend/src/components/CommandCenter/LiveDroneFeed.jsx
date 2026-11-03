// D:\AegisGeoInt\frontend\src\components\CommandCenter\LiveDroneFeed.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Video, Radio, Eye, Thermometer, Crosshair, Maximize2 } from 'lucide-react';

const API_URL = 'http://localhost:5000';

// Sample video URLs (drone forest flight)
const SAMPLE_VIDEOS = [
  '/drone-sample.mp4',
  '/drone-sample.mp4',
  '/drone-sample.mp4',
];

const LiveDroneFeed = () => {
  const [drones, setDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEOS[0]);
  const [thermalMode, setThermalMode] = useState(false);
  const [hudEnabled, setHudEnabled] = useState(true);
  const [detections, setDetections] = useState([]);
  const [recording, setRecording] = useState(true);
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const videoRef = useRef(null);

  // Clock update
  useEffect(() => {
    const int = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(int);
  }, []);

  // Fetch drones
  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/drones`, { timeout: 5000 });
        const data = res.data.data || [];
        setDrones(data);
        if (data.length > 0 && !selectedDrone) setSelectedDrone(data[0]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDrones();
    const interval = setInterval(fetchDrones, 5000);
    return () => clearInterval(interval);
  }, [selectedDrone]);

  // Generate random detections (simulasi)
  useEffect(() => {
    if (!selectedDrone) return;
    const classes = ['Person', 'Vehicle', 'Boat', 'Animal', 'Structure'];
    const int = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      const newDets = Array.from({ length: count }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        class: classes[Math.floor(Math.random() * classes.length)],
        confidence: Math.round((70 + Math.random() * 28) * 10) / 10,
        x: 10 + Math.random() * 60, // percent
        y: 15 + Math.random() * 60,
        w: 8 + Math.random() * 15,
        h: 12 + Math.random() * 20,
      }));
      setDetections(newDets);
    }, 2500);
    return () => clearInterval(int);
  }, [selectedDrone]);

  // Rotate video
  useEffect(() => {
    if (!selectedDrone) return;
    const idx = drones.findIndex(d => d.id === selectedDrone.id);
    setVideoUrl(SAMPLE_VIDEOS[idx % SAMPLE_VIDEOS.length]);
  }, [selectedDrone, drones]);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#8899aa' }}>Loading feed...</div>;

  const st = {
    container: { padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    title: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#e0e8f0' },
    controls: { display: 'flex', gap: '6px' },
    ctrlBtn: (active, color) => ({
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', background: active ? `${color}20` : 'rgba(255,255,255,0.05)',
      color: active ? color : '#8899aa',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 700
    }),
    feedBox: {
      position: 'relative', width: '100%', height: '260px',
      background: '#000', borderRadius: '8px', overflow: 'hidden'
    },
    video: {
      width: '100%', height: '100%', objectFit: 'cover',
      filter: thermalMode
        ? 'hue-rotate(180deg) saturate(3) contrast(1.5) brightness(1.1)'
        : 'none',
      transition: 'filter 0.3s ease'
    },
    hud: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      fontFamily: 'monospace', color: '#22c55e',
      fontSize: '11px', textShadow: '0 0 4px rgba(34,197,94,0.8)'
    },
    hudTopLeft: { position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.4)' },
    hudTopRight: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.6)', textAlign: 'right' },
    hudBottomLeft: { position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(79,195,247,0.4)' },
    hudBottomRight: { position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' },
    recDot: { display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', marginRight: '4px', animation: 'blink 1s infinite' },
    detectionBox: (color) => ({
      position: 'absolute', border: `2px solid ${color}`,
      background: `${color}15`, pointerEvents: 'none',
      boxShadow: `0 0 8px ${color}`
    }),
    detectionLabel: (color) => ({
      position: 'absolute', top: '-16px', left: '-2px',
      background: color, color: 'white',
      padding: '1px 4px', fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap'
    }),
    crosshair: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' },
    droneTabs: { display: 'flex', gap: '6px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' },
    droneTab: (active) => ({
      flex: '0 0 auto', padding: '6px 10px',
      background: active ? 'rgba(79,195,247,0.15)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? '#4fc3f7' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '6px', color: active ? '#4fc3f7' : '#8899aa',
      cursor: 'pointer', fontSize: '10px', textAlign: 'left', minWidth: '80px'
    }),
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '10px', color: '#8899aa' }
  };

  return (
    <div style={st.container}>
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0.2 } }
        @keyframes scanline { 0% { transform: translateY(-100%) } 100% { transform: translateY(100%) } }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div style={st.title}>
          <Camera size={16} color="#4fc3f7" />
          LIVE DRONE FEED
        </div>
        <div style={st.controls}>
          <button style={st.ctrlBtn(hudEnabled, '#22c55e')} onClick={() => setHudEnabled(!hudEnabled)}>
            <Eye size={12} /> HUD
          </button>
          <button style={st.ctrlBtn(thermalMode, '#ef4444')} onClick={() => setThermalMode(!thermalMode)}>
            <Thermometer size={12} /> THERMAL
          </button>
          <button style={st.ctrlBtn(recording, '#ef4444')} onClick={() => setRecording(!recording)}>
            <Radio size={12} /> REC
          </button>
        </div>
      </div>

      {/* Video Feed */}
      <div style={st.feedBox}>
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={st.video}
        />

        {/* HUD Overlay */}
        {hudEnabled && selectedDrone && (
          <div style={st.hud}>
            {/* Top Left — Drone Info */}
            <div style={st.hudTopLeft}>
              <div style={{ color: '#4fc3f7', fontWeight: 'bold' }}>◉ {selectedDrone.name || selectedDrone.id}</div>
              <div>ALT: {Math.round(selectedDrone.alt || 0)}m</div>
              <div>SPD: {Math.round(selectedDrone.speed || 0)} km/h</div>
              <div>BAT: {Math.round(selectedDrone.battery || 0)}%</div>
              <div>SIG: {Math.round(selectedDrone.signal || 0)}%</div>
            </div>

            {/* Top Right — REC */}
            <div style={st.hudTopRight}>
              {recording && <div><span style={st.recDot}></span><span style={{ color: '#ef4444' }}>REC</span></div>}
              <div style={{ color: '#22c55e' }}>{clock}</div>
              <div style={{ fontSize: '9px' }}>CAM-{selectedDrone.id?.split('-')[1] || '01'}</div>
            </div>

            {/* Bottom Left — GPS */}
            <div style={st.hudBottomLeft}>
              <div>LAT: {selectedDrone.lat?.toFixed(6) || '0.000000'}</div>
              <div>LNG: {selectedDrone.lng?.toFixed(6) || '0.000000'}</div>
              <div style={{ color: '#f59e0b' }}>HDG: {Math.round(selectedDrone.heading || 0)}°</div>
            </div>

            {/* Bottom Right — Status */}
            <div style={st.hudBottomRight}>
              <div style={{ color: '#22c55e' }}>● {selectedDrone.status || 'ACTIVE'}</div>
              <div>30 FPS | 1080p</div>
              <div>{Math.round(selectedDrone.alt || 0)}m AGL</div>
            </div>

            {/* Crosshair */}
            <svg width="60" height="60" viewBox="0 0 60 60" style={st.crosshair}>
              <circle cx="30" cy="30" r="20" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
              <line x1="30" y1="10" x2="30" y2="25" stroke="#22c55e" strokeWidth="1" opacity="0.8" />
              <line x1="30" y1="35" x2="30" y2="50" stroke="#22c55e" strokeWidth="1" opacity="0.8" />
              <line x1="10" y1="30" x2="25" y2="30" stroke="#22c55e" strokeWidth="1" opacity="0.8" />
              <line x1="35" y1="30" x2="50" y2="30" stroke="#22c55e" strokeWidth="1" opacity="0.8" />
              <circle cx="30" cy="30" r="2" fill="#22c55e" />
            </svg>

            {/* Scanline */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 0%, rgba(34,197,94,0.05) 50%, transparent 100%)', animation: 'scanline 4s linear infinite', pointerEvents: 'none' }} />
          </div>
        )}

        {/* Detection Bounding Boxes */}
        {hudEnabled && detections.map(det => {
          const color = det.class === 'Person' ? '#ef4444' : det.class === 'Vehicle' ? '#f59e0b' : '#4fc3f7';
          return (
            <div key={det.id} style={{ ...st.detectionBox(color), left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}>
              <div style={st.detectionLabel(color)}>{det.class} {det.confidence}%</div>
            </div>
          );
        })}

        {/* Thermal Badge */}
        {thermalMode && (
          <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(239,68,68,0.9)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
            🌡️ THERMAL
          </div>
        )}
      </div>

      {/* Drone Tabs */}
      <div style={st.droneTabs}>
        {drones.slice(0, 8).map(d => (
          <button key={d.id} style={st.droneTab(selectedDrone?.id === d.id)} onClick={() => setSelectedDrone(d)}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px' }}>
              <Camera size={10} /> {d.name?.split('-')[1]?.trim() || d.id}
            </div>
            <div style={{ fontSize: '8px', color: '#22c55e' }}>● {d.status}</div>
          </button>
        ))}
      </div>

      {/* Footer Stats */}
      <div style={st.footer}>
        <div>FPS: <strong style={{color:'#e0e8f0'}}>30</strong></div>
        <div>Bitrate: <strong style={{color:'#e0e8f0'}}>5.2 Mbps</strong></div>
        <div>Latency: <strong style={{color:'#e0e8f0'}}>120ms</strong></div>
        <div>Res: <strong style={{color:'#e0e8f0'}}>1080p</strong></div>
      </div>
    </div>
  );
};

export default LiveDroneFeed;

