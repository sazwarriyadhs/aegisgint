// D:\AegisGeoInt\frontend\src\pages\AIDetection.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Thermometer, Activity, Download, Upload, RefreshCw, Crosshair, Clock } from 'lucide-react';

const AI_API = 'http://localhost:8000';

const AIDetection = () => {
  const [movement, setMovement] = useState({ status: 'IDLE', count: 0, lastEvent: null, processing: false });
  const [captures, setCaptures] = useState([]);
  const [thermal, setThermal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const checkHealth = async () => {
    try {
      const res = await axios.get(`${AI_API}/health`, { timeout: 5000 });
      console.log('AI Engine:', res.data);
    } catch (err) {
      setError('AI Engine offline — pastikan docker ai-engine jalan');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${AI_API}/history`, { timeout: 5000 });
      setHistory(res.data.captures || []);
    } catch (err) {
      console.warn('History fetch failed:', err.message);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchHistory();
    const int = setInterval(fetchHistory, 10000);
    return () => clearInterval(int);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const runMovementDetection = async () => {
    if (!previewFile) return;
    try {
      setLoading(true);
      setMovement(prev => ({ ...prev, processing: true }));
      const form = new FormData();
      form.append('file', previewFile);
      form.append('confidence', '0.5');
      form.append('save_capture', 'true');
      
      const res = await axios.post(`${AI_API}/detect/movement`, form, { timeout: 60000 });
      const data = res.data;
      
      setMovement({
        status: data.movement_detected ? 'DETECTED' : 'CLEAR',
        count: data.count || 0,
        lastEvent: new Date().toLocaleTimeString(),
        processing: false,
        objects: data.objects,
        processingMs: data.processing_ms
      });
      
      if (data.capture_path) {
        setCaptures(prev => [{
          id: Date.now(),
          path: data.capture_path,
          objects: data.objects,
          timestamp: data.timestamp,
          status: 'RECORDED'
        }, ...prev].slice(0, 6));
      }
      
      fetchHistory();
    } catch (err) {
      setError('Movement detection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const runThermalAnalysis = async () => {
    if (!previewFile) return;
    try {
      setLoading(true);
      const form = new FormData();
      form.append('file', previewFile);
      form.append('ambient_temp', '28');
      form.append('anomaly_threshold', '38');
      
      const res = await axios.post(`${AI_API}/detect/thermal`, form, { timeout: 60000 });
      setThermal(res.data);
    } catch (err) {
      setError('Thermal analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = { movement, captures, thermal, history, generated: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis_report_${Date.now()}.json`;
    a.click();
  };

  const st = {
    container: { padding: '20px', color: '#e0e8f0', background: '#0a0e1a', minHeight: '100vh' },
    header: { padding: '16px', background: 'linear-gradient(90deg, rgba(79,195,247,0.1), rgba(239,68,68,0.1))', border: '1px solid rgba(79,195,247,0.3)', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
    title: { fontSize: '24px', fontWeight: 700, color: '#4fc3f7', margin: 0, letterSpacing: '2px' },
    subtitle: { fontSize: '12px', color: '#8899aa', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' },
    panel: { padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '16px' },
    panelTitle: { fontSize: '13px', fontWeight: 700, color: '#4fc3f7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    camBox: { background: '#000', border: '2px solid #4fc3f7', borderRadius: '8px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    camLabel: { position: 'absolute', top: '8px', left: '8px', padding: '4px 8px', background: 'rgba(79,195,247,0.9)', color: '#0a0e1a', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' },
    camStatus: { fontSize: '11px', color: '#22c55e', marginTop: '8px', display: 'flex', justifyContent: 'space-between' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' },
    statCard: { padding: '12px', background: 'rgba(79,195,247,0.05)', border: '1px solid rgba(79,195,247,0.2)', borderRadius: '6px' },
    statLabel: { fontSize: '10px', color: '#8899aa', textTransform: 'uppercase', marginBottom: '4px' },
    statValue: (color) => ({ fontSize: '18px', fontWeight: 700, color: color || '#4fc3f7' }),
    captureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
    captureCard: { padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' },
    captureImg: { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', background: 'rgba(79,195,247,0.1)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#4fc3f7', fontWeight: 700 },
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
    actionBar: { display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' },
    fileInput: { display: 'none' }
  };

  return (
    <div style={st.container}>
      <div style={st.header}>
        <h1 style={st.title}>AI DETECTION CONSOLE</h1>
        <p style={st.subtitle}>Tropical UAV Intelligence • v1.0</p>
      </div>

      {error && (
        <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '6px', marginBottom: '16px', color: '#ef4444', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Camera Monitoring */}
      <div style={st.panel}>
        <div style={st.panelTitle}><Camera size={14} /> Camera Monitoring</div>
        <div style={st.grid2}>
          <div>
            <div style={st.camBox}>
              <span style={st.camLabel}>RGB</span>
              {previewImage ? (
                <img src={previewImage} alt="RGB" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#444', textAlign: 'center', fontSize: '12px' }}>
                  <Camera size={32} style={{ opacity: 0.3, marginBottom: '8px' }} /><br />
                  Upload image to preview
                </div>
              )}
            </div>
            <div style={st.camStatus}>
              <span>Status: <strong style={{ color: '#22c55e' }}>ACTIVE</strong></span>
              <span>Resolution: 1920x1080</span>
            </div>
          </div>
          <div>
            <div style={{ ...st.camBox, borderColor: '#ef4444' }}>
              <span style={{ ...st.camLabel, background: 'rgba(239,68,68,0.9)' }}>THERMAL</span>
              {previewImage ? (
                <img src={previewImage} alt="Thermal" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'hue-rotate(180deg) saturate(2)' }} />
              ) : (
                <div style={{ color: '#444', textAlign: 'center', fontSize: '12px' }}>
                  <Thermometer size={32} style={{ opacity: 0.3, marginBottom: '8px' }} /><br />
                  Thermal preview
                </div>
              )}
            </div>
            <div style={st.camStatus}>
              <span>Status: <strong style={{ color: '#22c55e' }}>ACTIVE</strong></span>
              <span>Radiometric: <strong style={{ color: '#f59e0b' }}>SIMULATED</strong></span>
            </div>
          </div>
        </div>

        {/* Upload + Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} style={st.fileInput} />
          <button style={st.btn('#4fc3f7')} onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Upload Image
          </button>
          <button style={st.btn('#22c55e')} onClick={runMovementDetection} disabled={!previewFile || loading}>
            <Activity size={14} /> {loading ? 'Processing...' : 'Detect Movement'}
          </button>
          <button style={st.btn('#ef4444')} onClick={runThermalAnalysis} disabled={!previewFile || loading}>
            <Thermometer size={14} /> Thermal Analysis
          </button>
        </div>
      </div>

      {/* Movement Detection */}
      <div style={st.panel}>
        <div style={st.panelTitle}><Activity size={14} /> Movement Detection</div>
        <div style={st.statGrid}>
          <div style={st.statCard}>
            <div style={st.statLabel}>Detection Status</div>
            <div style={st.statValue(movement.status === 'DETECTED' ? '#ef4444' : '#22c55e')}>
              {movement.status === 'IDLE' ? 'IDLE' : movement.status === 'DETECTED' ? 'DETECTED' : 'CLEAR'}
            </div>
          </div>
          <div style={st.statCard}>
            <div style={st.statLabel}>Movement Events</div>
            <div style={st.statValue('#f59e0b')}>{movement.count}</div>
          </div>
          <div style={st.statCard}>
            <div style={st.statLabel}>Last Event</div>
            <div style={st.statValue('#4fc3f7')}>{movement.lastEvent || '--:--:--'}</div>
          </div>
          <div style={st.statCard}>
            <div style={st.statLabel}>Processing</div>
            <div style={st.statValue(movement.processing ? '#f59e0b' : '#22c55e')}>
              {movement.processing ? 'RUNNING' : 'IDLE'}
            </div>
          </div>
        </div>
      </div>

      {/* Object Capture */}
      <div style={st.panel}>
        <div style={st.panelTitle}><Crosshair size={14} /> Object Detection & Capture</div>
        {captures.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#8899aa', fontSize: '12px' }}>
            No captures yet — upload image and detect movement
          </div>
        ) : (
          <div style={st.captureGrid}>
            {captures.map((cap, i) => (
              <div key={cap.id} style={st.captureCard}>
                <div style={st.captureImg}>{cap.objects?.length || 0}</div>
                <div style={st.captureInfo}>
                  <div><strong>OBJECT {String(i + 1).padStart(3, '0')}</strong></div>
                  <div>Objects: {cap.objects?.length || 0}</div>
                  <div>{new Date(cap.timestamp).toLocaleTimeString()}</div>
                  <span style={st.captureStatus(cap.status)}>{cap.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thermal Analysis */}
      <div style={st.panel}>
        <div style={st.panelTitle}><Thermometer size={14} /> Thermal Temperature Analysis</div>
        <div style={st.thermalGrid}>
          <div style={st.thermalCard}>
            <div style={st.thermalLabel}>Minimum</div>
            <div style={st.thermalValue}>{thermal?.objects?.[0]?.temperature?.min || '--.-'} °C</div>
          </div>
          <div style={st.thermalCard}>
            <div style={st.thermalLabel}>Average</div>
            <div style={st.thermalValue}>{thermal?.objects?.[0]?.temperature?.avg || '--.-'} °C</div>
          </div>
          <div style={st.thermalCard}>
            <div style={st.thermalLabel}>Maximum</div>
            <div style={st.thermalValue}>{thermal?.objects?.[0]?.temperature?.max || '--.-'} °C</div>
          </div>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8899aa' }}>
          <span>Sensor Calibration: <strong style={{ color: '#f59e0b' }}>SIMULATED</strong></span>
          <span>Measurement: <strong style={{ color: '#4fc3f7' }}>{thermal?.mode === 'simulation' ? 'SIMULATED' : 'RADIOMETRIC'}</strong></span>
          <span>Anomalies: <strong style={{ color: '#ef4444' }}>{thermal?.anomalies || 0}</strong></span>
        </div>
      </div>

      {/* History */}
      <div style={st.panel}>
        <div style={st.panelTitle}><Clock size={14} /> Detection History</div>
        <table style={st.table}>
          <thead>
            <tr>
              <th style={st.th}>Time</th>
              <th style={st.th}>File</th>
              <th style={st.th}>Size</th>
              <th style={st.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan="4" style={{ ...st.td, textAlign: 'center', color: '#8899aa' }}>No history yet</td></tr>
            ) : (
              history.map((h, i) => (
                <tr key={i}>
                  <td style={st.td}>{new Date(h.modified).toLocaleTimeString()}</td>
                  <td style={st.td}>{h.filename}</td>
                  <td style={st.td}>{h.size_kb} KB</td>
                  <td style={st.td}><span style={{ color: '#22c55e' }}>RECORDED</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Bar */}
      <div style={st.actionBar}>
        <button style={st.btn('#22c55e')} onClick={runMovementDetection} disabled={!previewFile || loading}>
          <Activity size={14} /> Run Detection
        </button>
        <button style={st.btn('#4fc3f7')} onClick={fetchHistory}>
          <RefreshCw size={14} /> Refresh History
        </button>
        <button style={st.btn('#f59e0b')} onClick={exportReport}>
          <Download size={14} /> Export Report
        </button>
      </div>
    </div>
  );
};

export default AIDetection;
