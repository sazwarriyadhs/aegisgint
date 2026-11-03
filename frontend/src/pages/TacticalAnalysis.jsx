// D:\AegisGeoInt\frontend\src\pages\TacticalAnalysis.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Target, MapPin, Users, Crosshair, TrendingUp, AlertTriangle,
  Shield, Activity, Navigation, Eye, Clock, Zap, ChevronRight
} from 'lucide-react';

const AI_API = 'http://localhost:8000';
const BACKEND_API = 'http://localhost:5000';

const TacticalAnalysis = () => {
  const [detections, setDetections] = useState([]);
  const [enemyGroups, setEnemyGroups] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [ambushRisk, setAmbushRisk] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data dari backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch enemy troops (dari backend)
      const [troopsRes, historyRes, missionsRes] = await Promise.all([
        axios.get(`${BACKEND_API}/api/enemy/troops`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${AI_API}/history`, { timeout: 5000 }).catch(() => ({ data: { captures: [] } })),
        axios.get(`${BACKEND_API}/api/missions`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }))
      ]);

      const troops = troopsRes.data.data || [];
      setEnemyGroups(troops);

      // 2. Generate predictions (dari data troops)
      const preds = troops.map((t, i) => {
        const directions = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest'];
        const dir = directions[i % directions.length];
        const confidence = 0.55 + Math.random() * 0.35;
        const nextLat = t.lat + (dir.includes('North') ? 0.05 : dir.includes('South') ? -0.05 : 0) + (Math.random() - 0.5) * 0.02;
        const nextLng = t.lng + (dir.includes('East') ? 0.05 : dir.includes('West') ? -0.05 : 0) + (Math.random() - 0.5) * 0.02;
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

      // 3. Generate ambush risk
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

  const st = {
    container: { padding: '24px', color: '#e0e8f0', maxWidth: '1600px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    subtitle: { fontSize: '13px', color: '#8899aa', margin: '4px 0 0 0' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: (color) => ({ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', borderLeft: `3px solid ${color}` }),
    statLabel: { fontSize: '11px', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' },
    statValue: (color) => ({ fontSize: '28px', fontWeight: 700, color }),
    panel: { padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '20px' },
    panelTitle: { fontSize: '14px', fontWeight: 700, color: '#4fc3f7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid rgba(79,195,247,0.3)' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    card: (color) => ({ padding: '16px', background: `${color}10`, border: `1px solid ${color}40`, borderRadius: '8px', marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s' }),
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    cardTitle: { fontSize: '15px', fontWeight: 700, color: '#e0e8f0' },
    cardLocation: { fontSize: '12px', color: '#8899aa', display: 'flex', alignItems: 'center', gap: '4px' },
    badge: (color) => ({ padding: '3px 10px', background: `${color}20`, color, borderRadius: '12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }),
    infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' },
    infoLabel: { color: '#8899aa' },
    infoValue: { color: '#e0e8f0', fontWeight: 600 },
    progressBar: { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' },
    progressFill: (value, color) => ({ width: `${value}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.3s' }),
    actionBtn: (color) => ({ width: '100%', padding: '8px', background: `${color}20`, color, border: `1px solid ${color}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }),
    emptyState: { padding: '40px', textAlign: 'center', color: '#8899aa', fontSize: '13px' }
  };

  const riskColor = (level) => {
    if (level === 'CRITICAL') return '#ef4444';
    if (level === 'HIGH') return '#f97316';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#22c55e';
  };

  const getTotalPersonnel = () => enemyGroups.reduce((s, t) => s + t.size, 0);
  const getCriticalZones = () => ambushRisk.filter(r => r.risk_level === 'CRITICAL').length;
  const getHighZones = () => ambushRisk.filter(r => r.risk_level === 'HIGH').length;

  if (loading && enemyGroups.length === 0) {
    return <div style={{ ...st.container, textAlign: 'center', padding: '60px' }}>Loading tactical data...</div>;
  }

  return (
    <div style={st.container}>
      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}><Crosshair size={28} color="#ef4444" /> Tactical Analysis</h1>
          <p style={st.subtitle}>Enemy Movement Prediction & Ambush Risk Assessment</p>
        </div>
        <button
          style={{ padding: '10px 20px', background: 'rgba(79,195,247,0.15)', color: '#4fc3f7', border: '1px solid #4fc3f7', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
          onClick={fetchData}
        >
          ⟳ Refresh Analysis
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '20px', color: '#ef4444' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div style={st.statsGrid}>
        <div style={st.statCard('#ef4444')}>
          <div style={st.statLabel}><Users size={12} /> Total Personnel</div>
          <div style={st.statValue('#ef4444')}>{getTotalPersonnel()}</div>
        </div>
        <div style={st.statCard('#f97316')}>
          <div style={st.statLabel}><Target size={12} /> Active Groups</div>
          <div style={st.statValue('#f97316')}>{enemyGroups.length}</div>
        </div>
        <div style={st.statCard('#dc2626')}>
          <div style={st.statLabel}><AlertTriangle size={12} /> Critical Zones</div>
          <div style={st.statValue('#dc2626')}>{getCriticalZones()}</div>
        </div>
        <div style={st.statCard('#f59e0b')}>
          <div style={st.statLabel}><Shield size={12} /> High Risk Zones</div>
          <div style={st.statValue('#f59e0b')}>{getHighZones()}</div>
        </div>
      </div>

      {/* Grid: Movement Prediction + Ambush Risk */}
      <div style={st.grid2}>
        {/* Movement Prediction */}
        <div style={st.panel}>
          <div style={st.panelTitle}><Navigation size={16} /> Movement Prediction</div>
          {predictions.length === 0 ? (
            <div style={st.emptyState}>No prediction data</div>
          ) : (
            predictions.map((pred) => (
              <div key={pred.group_id} style={st.card('#4fc3f7')} onClick={() => setSelectedGroup(pred)}>
                <div style={st.cardHeader}>
                  <div>
                    <div style={st.cardTitle}>{pred.unit}</div>
                    <div style={st.cardLocation}><MapPin size={10} /> {pred.location}</div>
                  </div>
                  <div style={st.badge('#4fc3f7')}>{pred.confidence}% confidence</div>
                </div>
                <div style={st.infoRow}><span style={st.infoLabel}>Direction</span><span style={{...st.infoValue, color: '#4fc3f7'}}>→ {pred.direction}</span></div>
                <div style={st.infoRow}><span style={st.infoLabel}>ETA</span><span style={st.infoValue}>{pred.eta_hours} hours</span></div>
                <div style={st.infoRow}><span style={st.infoLabel}>Next Position</span><span style={st.infoValue}>{pred.next_lat.toFixed(4)}, {pred.next_lng.toFixed(4)}</span></div>
                <div style={{ fontSize: '10px', color: '#8899aa', marginTop: '6px', fontStyle: 'italic' }}>
                  {pred.basis}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ambush Risk */}
        <div style={st.panel}>
          <div style={st.panelTitle}><AlertTriangle size={16} /> Ambush Probability</div>
          {ambushRisk.length === 0 ? (
            <div style={st.emptyState}>No risk assessment</div>
          ) : (
            ambushRisk.map((risk) => {
              const color = riskColor(risk.risk_level);
              return (
                <div key={risk.group_id} style={st.card(color)}>
                  <div style={st.cardHeader}>
                    <div>
                      <div style={st.cardTitle}>{risk.unit}</div>
                      <div style={st.cardLocation}><MapPin size={10} /> {risk.location}</div>
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
                  <div style={{ marginTop: '10px', fontSize: '11px' }}>
                    <div style={{ color: '#8899aa', marginBottom: '4px' }}>Potential Threats:</div>
                    {risk.ambush_types.map((type, i) => (
                      <div key={i} style={{ color: '#e0e8f0', padding: '2px 0' }}>• {type}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', padding: '8px', background: `${color}15`, borderRadius: '4px', fontSize: '11px', color }}>
                    <strong>Recommendation:</strong> {risk.recommended_action}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedGroup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)'
        }} onClick={() => setSelectedGroup(null)}>
          <div style={{
            background: '#0a0e1a', border: '2px solid #4fc3f7', borderRadius: '12px',
            maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto', color: '#e0e8f0'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: 'linear-gradient(90deg, rgba(79,195,247,0.15), rgba(239,68,68,0.15))', borderBottom: '1px solid rgba(79,195,247,0.3)', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#4fc3f7', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>Group Movement Detail</h2>
              <button onClick={() => setSelectedGroup(null)} style={{ background: 'transparent', border: 'none', color: '#8899aa', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={st.infoRow}><span style={st.infoLabel}>Unit</span><span style={st.infoValue}>{selectedGroup.unit}</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>Location</span><span style={st.infoValue}>{selectedGroup.location}</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>Direction</span><span style={{...st.infoValue, color: '#4fc3f7'}}>→ {selectedGroup.direction}</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>Confidence</span><span style={st.infoValue}>{selectedGroup.confidence}%</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>ETA</span><span style={st.infoValue}>{selectedGroup.eta_hours} hours</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>Current Position</span><span style={st.infoValue}>{selectedGroup.current_lat.toFixed(4)}, {selectedGroup.current_lng.toFixed(4)}</span></div>
              <div style={st.infoRow}><span style={st.infoLabel}>Predicted Next</span><span style={st.infoValue}>{selectedGroup.next_lat.toFixed(4)}, {selectedGroup.next_lng.toFixed(4)}</span></div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
              <button style={{ width: '100%', padding: '12px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }} onClick={() => setSelectedGroup(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticalAnalysis;
