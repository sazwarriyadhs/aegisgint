// D:\AegisGeoInt\frontend\src\pages\Analytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Users, Bomb, Truck, Building2, Activity, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const Analytics = () => {
  const [data, setData] = useState({
    drones: [], threats: [], troops: [], equipment: [], facilities: [], sensors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [d, t, tr, eq, fac, s] = await Promise.all([
          axios.get(`${API_URL}/api/drones`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/api/threats`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/api/enemy/troops`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/api/enemy/equipment`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/api/enemy/facilities`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/api/sensors`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }))
        ]);
        setData({
          drones: d.data.data || [],
          threats: t.data.data || [],
          troops: tr.data.data || [],
          equipment: eq.data.data || [],
          facilities: fac.data.data || [],
          sensors: s.data.data || []
        });
      } catch (err) {
        console.error('Fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const int = setInterval(fetchAll, 15000);
    return () => clearInterval(int);
  }, []);

  // Compute stats
  const totalTroops = data.troops.reduce((s, t) => s + t.size, 0);
  const totalWeapons = data.troops.reduce((s, t) => s + (t.size > 40 ? 20 : 10), 0);
  const totalEquipment = data.equipment.reduce((s, e) => s + e.count, 0);
  const totalFacilities = data.facilities.length;
  const totalThreats = data.threats.length;
  const activeDrones = data.drones.filter(d => d.status === 'ACTIVE').length;

  const st = {
    container: { padding: '24px', color: '#e0e8f0', maxWidth: '1600px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
    card: (color) => ({ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', borderLeft: `3px solid ${color}` }),
    cardLabel: { fontSize: '11px', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
    cardValue: (color) => ({ fontSize: '32px', fontWeight: 700, color }),
    chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '24px' },
    chartBox: { padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' },
    chartTitle: { fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' },
    barRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '12px' },
    barLabel: { width: '120px', color: '#8899aa' },
    barTrack: { flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' },
    barFill: (w, color) => ({ width: `${w}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s' }),
    barValue: { width: '60px', textAlign: 'right', fontWeight: 600 }
  };

  if (loading) {
    return <div style={{ ...st.container, textAlign: 'center', padding: '60px' }}>Loading analytics...</div>;
  }

  // Bar chart data
  const droneStatuses = ['ACTIVE', 'WARNING', 'CRITICAL', 'RETURNING', 'IDLE'];
  const droneCounts = droneStatuses.map(s => ({ label: s, value: data.drones.filter(d => d.status === s).length }));
  const maxDrone = Math.max(...droneCounts.map(x => x.value), 1);

  const threatLevels = ['HIGH', 'MEDIUM', 'LOW'];
  const threatCounts = threatLevels.map(l => ({ label: l, value: data.troops.filter(t => t.threat === l).length }));
  const maxThreat = Math.max(...threatCounts.map(x => x.value), 1);

  return (
    <div style={st.container}>
      <div style={st.header}>
        <div>
          <h1 style={st.title}><BarChart3 size={24} color="#4fc3f7" /> Analytics Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#8899aa', margin: '4px 0 0 0' }}>Live Statistics & Threat Assessment</p>
        </div>
        <div style={{ fontSize: '12px', color: '#22c55e' }}>● Auto-refresh 15s</div>
      </div>

      <div style={st.grid}>
        <div style={st.card('#4fc3f7')}>
          <div style={st.cardLabel}><Activity size={14} /> Active Drones</div>
          <div style={st.cardValue('#4fc3f7')}>{activeDrones} <span style={{ fontSize: '16px', color: '#8899aa' }}>/ {data.drones.length}</span></div>
        </div>
        <div style={st.card('#ef4444')}>
          <div style={st.cardLabel}><Users size={14} /> Enemy Personnel</div>
          <div style={st.cardValue('#ef4444')}>{totalTroops}</div>
        </div>
        <div style={st.card('#f59e0b')}>
          <div style={st.cardLabel}><Bomb size={14} /> Weapons Est.</div>
          <div style={st.cardValue('#f59e0b')}>{totalWeapons}</div>
        </div>
        <div style={st.card('#8b5cf6')}>
          <div style={st.cardLabel}><Truck size={14} /> Vehicles</div>
          <div style={st.cardValue('#8b5cf6')}>{totalEquipment}</div>
        </div>
        <div style={st.card('#06b6d4')}>
          <div style={st.cardLabel}><Building2 size={14} /> Facilities</div>
          <div style={st.cardValue('#06b6d4')}>{totalFacilities}</div>
        </div>
        <div style={st.card('#22c55e')}>
          <div style={st.cardLabel}><AlertTriangle size={14} /> Active Threats</div>
          <div style={st.cardValue('#22c55e')}>{totalThreats}</div>
        </div>
      </div>

      <div style={st.chartGrid}>
        <div style={st.chartBox}>
          <div style={st.chartTitle}><TrendingUp size={16} color="#4fc3f7" /> Drone Fleet Status</div>
          {droneCounts.map(({ label, value }) => (
            <div key={label} style={st.barRow}>
              <div style={st.barLabel}>{label}</div>
              <div style={st.barTrack}><div style={st.barFill((value / maxDrone) * 100, label === 'ACTIVE' ? '#22c55e' : label === 'WARNING' ? '#f59e0b' : label === 'CRITICAL' ? '#ef4444' : '#4fc3f7')} /></div>
              <div style={st.barValue}>{value}</div>
            </div>
          ))}
        </div>

        <div style={st.chartBox}>
          <div style={st.chartTitle}><AlertTriangle size={16} color="#ef4444" /> Threat Level Distribution</div>
          {threatCounts.map(({ label, value }) => (
            <div key={label} style={st.barRow}>
              <div style={st.barLabel}>{label}</div>
              <div style={st.barTrack}><div style={st.barFill((value / maxThreat) * 100, label === 'HIGH' ? '#ef4444' : label === 'MEDIUM' ? '#f59e0b' : '#22c55e')} /></div>
              <div style={st.barValue}>{value}</div>
            </div>
          ))}
        </div>

        <div style={st.chartBox}>
          <div style={st.chartTitle}><Users size={16} color="#8b5cf6" /> Enemy Units by Location</div>
          {data.troops.map(t => {
            const maxSize = Math.max(...data.troops.map(x => x.size), 1);
            return (
              <div key={t.id} style={st.barRow}>
                <div style={st.barLabel}>{t.location}</div>
                <div style={st.barTrack}><div style={st.barFill((t.size / maxSize) * 100, t.threat === 'HIGH' ? '#ef4444' : t.threat === 'MEDIUM' ? '#f59e0b' : '#22c55e')} /></div>
                <div style={st.barValue}>{t.size}</div>
              </div>
            );
          })}
        </div>

        <div style={st.chartBox}>
          <div style={st.chartTitle}><Truck size={16} color="#06b6d4" /> Equipment Inventory</div>
          {data.equipment.map(e => {
            const maxCount = Math.max(...data.equipment.map(x => x.count), 1);
            return (
              <div key={e.id} style={st.barRow}>
                <div style={st.barLabel}>{e.model}</div>
                <div style={st.barTrack}><div style={st.barFill((e.count / maxCount) * 100, '#06b6d4')} /></div>
                <div style={st.barValue}>{e.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
