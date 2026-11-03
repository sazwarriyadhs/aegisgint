// D:\AegisGeoInt\frontend\src\pages\ScenarioSimulator.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Swords, Target, Zap, Shield, Heart, Bomb, Plane, AlertTriangle,
  CheckCircle, Clock, Users, TrendingUp, Play, ChevronRight
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

const ScenarioSimulator = () => {
  const [scenarios, setScenarios] = useState([]);
  const [targets, setTargets] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, t, h] = await Promise.all([
        axios.get(`${API_URL}/api/scenario/types`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/enemy/troops`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/scenario/history`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }))
      ]);
      setScenarios(s.data.data || []);
      setTargets(t.data.data || []);
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
      const res = await axios.post(`${API_URL}/api/scenario/simulate`, {
        scenarioType: selectedScenario.id,
        targetId: selectedTarget.unit,
        targetType: 'TROOP',
        targetSize: selectedTarget.size
      }, { timeout: 10000 });
      setSimulation(res.data.data);
    } catch (err) {
      console.error('Simulation error:', err.message);
    } finally {
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
    resultValue: (color) => ({ fontSize: '24px', fontWeight: 700, color })
  };

  if (loading) {
    return <div style={{ ...st.container, textAlign: 'center', padding: '60px' }}>Loading scenarios...</div>;
  }

  return (
    <div style={st.container}>
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
              <div key={s.id} style={st.optionCard(selected, '#4fc3f7')} onClick={() => setSelectedScenario(s)}>
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
              <div key={t.id} style={st.optionCard(selected, t.threat === 'HIGH' ? '#ef4444' : t.threat === 'MEDIUM' ? '#f59e0b' : '#22c55e')} onClick={() => setSelectedTarget(t)}>
                <div style={st.optionHeader}>
                  <Users size={16} color={selected ? '#ef4444' : '#8899aa'} />
                  <span style={st.optionName}>{t.unit}</span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', background: t.threat === 'HIGH' ? '#ef444420' : t.threat === 'MEDIUM' ? '#f59e0b20' : '#22c55e20', color: t.threat === 'HIGH' ? '#ef4444' : t.threat === 'MEDIUM' ? '#f59e0b' : '#22c55e', borderRadius: '4px' }}>{t.threat}</span>
                </div>
                <div style={st.optionDesc}>{t.location} • {t.size} personnel • {t.activity}</div>
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
        {simulating ? '⏳ Simulating...' : <><Play size={18} /> Run Simulation</>}
      </button>

      {simulation && (
        <div style={st.resultBox}>
          <h2 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={24} /> Simulation Results
          </h2>
          <p style={{ color: '#8899aa', fontSize: '12px', margin: '4px 0 0 0' }}>
            {simulation.scenario.name} → {simulation.target.id}
          </p>

          <div style={st.resultGrid}>
            <div style={st.resultCard}>
              <div style={st.resultLabel}>Success Chance</div>
              <div style={st.resultValue('#22c55e')}>{simulation.simulation.successChance}%</div>
            </div>
            <div style={st.resultCard}>
              <div style={st.resultLabel}>Enemy Casualties</div>
              <div style={st.resultValue('#ef4444')}>{simulation.simulation.enemyCasualty}</div>
            </div>
            <div style={st.resultCard}>
              <div style={st.resultLabel}>Friendly Casualties</div>
              <div style={st.resultValue('#f59e0b')}>{simulation.simulation.friendlyCasualty}</div>
            </div>
            <div style={st.resultCard}>
              <div style={st.resultLabel}>Collateral Risk</div>
              <div style={st.resultValue(simulation.simulation.risk === 'HIGH' ? '#ef4444' : simulation.simulation.risk === 'MEDIUM' ? '#f59e0b' : '#22c55e')}>
                {simulation.simulation.risk}
              </div>
            </div>
            <div style={st.resultCard}>
              <div style={st.resultLabel}>Duration</div>
              <div style={{ ...st.resultValue('#4fc3f7'), fontSize: '18px' }}>{simulation.simulation.duration}</div>
            </div>
            <div style={st.resultCard}>
              <div style={st.resultLabel}>Resources</div>
              <div style={{ ...st.resultValue('#8b5cf6'), fontSize: '13px' }}>{simulation.simulation.resourcesUsed}</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '13px' }}>
            {simulation.simulation.recommendation}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ ...st.section, marginTop: '24px' }}>
          <div style={st.sectionTitle}><Clock size={16} color="#8899aa" /> Recent Simulations</div>
          {history.map(h => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' }}>
              <div>
                <strong style={{ color: '#4fc3f7' }}>{h.type}</strong> → {h.target}
              </div>
              <div style={{ color: h.result === 'COMPLETED' ? '#22c55e' : '#f59e0b' }}>{h.result} ({h.successChance}%)</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;
