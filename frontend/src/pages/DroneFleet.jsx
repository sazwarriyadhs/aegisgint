// D:\AegisGeoInt\frontend\src\pages\DroneFleet.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Drone, Battery, Wifi, MapPin, Activity, RefreshCw, AlertTriangle,
  Search, Filter, Zap, Eye, MoreVertical
} from 'lucide-react';
import logoUrl from '/logo.png';

const API_URL = 'http://localhost:5000';
const TROPICAL_IMAGES = [
  'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800&auto=format&fit=crop'
];

const DroneFleet = () => {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);

  const generateFallbackDrones = () => {
    const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];
    const missions = ['BORDER_PATROL', 'FOREST_PATROL', 'COASTAL_PATROL', 'SEARCH_RESCUE',
      'SURVEILLANCE', 'RECON', 'ESCORT', 'INTERDICTION'];
    
    return names.map((name, i) => ({
      id: `DRN-${String(i+1).padStart(3, '0')}`,
      name: `DRONE ${String(i+1).padStart(2, '0')} - ${name}`,
      model: i % 2 === 0 ? 'DJI M30T' : 'DJI M300',
      status: 'ACTIVE',
      battery: Math.floor(Math.random() * 30 + 70),
      signal: Math.floor(Math.random() * 30 + 70),
      altitude: Math.floor(Math.random() * 200 + 50),
      speed: Math.floor(Math.random() * 30 + 15),
      heading: Math.floor(Math.random() * 360),
      mission: missions[i],
      lat: -4.5 + (Math.random() - 0.5) * 2,
      lng: 139.5 + (Math.random() - 0.5) * 2,
      sector: names[i],
      image: TROPICAL_IMAGES[i % TROPICAL_IMAGES.length],
      lastMaintenance: Math.floor(Math.random() * 30 + 1) + ' days ago',
      firmware: 'v' + (Math.floor(Math.random() * 2 + 3)) + '.' + (Math.floor(Math.random() * 5)) + '.' + (Math.floor(Math.random() * 10)),
      totalFlights: Math.floor(Math.random() * 500 + 100),
      flightHours: Math.floor(Math.random() * 200 + 50),
      threatLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
    }));
  };

  const fetchDrones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`${API_URL}/api/drones`, { timeout: 5000 });
        const data = res.data.data || [];
        
        if (data.length > 0) {
          const mapped = data.map((d, index) => ({
            id: d.id || d.drone_id || `DRN-${String(index+1).padStart(3, '0')}`,
            name: d.name || `DRONE ${String(index+1).padStart(2, '0')}`,
            model: d.model || 'DJI M30T',
            status: d.status || 'ACTIVE',
            battery: Math.floor(d.battery || 85),
            signal: Math.floor(d.signal || 80),
            altitude: Math.floor(d.altitude || d.alt || 100),
            speed: Math.floor(d.speed || 30),
            heading: d.heading || 0,
            mission: d.mission || 'PATROL',
            lat: d.lat || -4.5,
            lng: d.lng || 139.5,
            sector: d.sector || 'Unknown',
            image: TROPICAL_IMAGES[index % TROPICAL_IMAGES.length],
            lastMaintenance: Math.floor(Math.random() * 30 + 1) + ' days ago',
            firmware: 'v3.' + Math.floor(Math.random() * 5) + '.' + Math.floor(Math.random() * 10),
            totalFlights: Math.floor(Math.random() * 500 + 100),
            flightHours: Math.floor(Math.random() * 200 + 50),
            threatLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
          }));
          setDrones(mapped);
        } else {
          setDrones(generateFallbackDrones());
        }
      } catch (err) {
        console.warn('Backend offline, pakai fallback');
        setDrones(generateFallbackDrones());
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load drone data');
      setDrones(generateFallbackDrones());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrones();
    const interval = setInterval(fetchDrones, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredDrones = drones.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || d.status === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  if (loading && drones.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#e0e8f0', background: '#0a0e1a' }}>
        <img src={logoUrl} alt="Loading" style={{ width: 60, height: 60, marginBottom: 16, opacity: 0.5 }} />
        <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: '#4fc3f7' }} />
        <p style={{ marginTop: 16, color: '#8899aa' }}>Loading fleet...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', color: '#e0e8f0', background: '#0a0e1a', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79,195,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Drone size={28} color="#4fc3f7" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Drone Fleet Management</h1>
            <p style={{ fontSize: '13px', color: '#8899aa', margin: '4px 0 0 0' }}>
              {drones.length} Drones
              {lastUpdate && ` • Updated: ${lastUpdate.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchDrones} style={{ padding: '10px 20px', background: 'rgba(79,195,247,0.15)', color: '#4fc3f7', border: '1px solid #4fc3f7', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <RefreshCw size={16} /> Sync
          </button>
          <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#e0e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Zap size={16} /> Add Drone
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8899aa' }} />
          <input
            type="text"
            placeholder="Search drones by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e0e8f0', fontSize: '14px', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['all', 'active', 'warning', 'critical', 'idle'].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              style={{ padding: '10px 16px', background: filterStatus === f ? 'rgba(79,195,247,0.15)' : 'rgba(255,255,255,0.03)', color: filterStatus === f ? '#4fc3f7' : '#8899aa', border: '1px solid ' + (filterStatus === f ? '#4fc3f7' : 'rgba(255,255,255,0.1)'), borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Drone Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredDrones.map(drone => (
          <div
            key={drone.id}
            onClick={() => setSelectedDrone(drone.id === selectedDrone ? null : drone.id)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid ' + (selectedDrone === drone.id ? '#4fc3f7' : 'rgba(255,255,255,0.08)'), borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', boxShadow: selectedDrone === drone.id ? '0 0 0 2px rgba(79,195,247,0.2)' : 'none' }}
          >
            {/* Image */}
            <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#1a1f33' }}>
              <img src={drone.image} alt={drone.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: drone.status === 'ACTIVE' ? 'rgba(34,197,94,0.9)' : drone.status === 'WARNING' ? 'rgba(245,158,11,0.9)' : drone.status === 'CRITICAL' ? 'rgba(239,68,68,0.9)' : 'rgba(136,153,170,0.9)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} /> {drone.status}
              </div>
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#e0e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                {drone.id}
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{drone.name}</h3>
                  <p style={{ fontSize: '12px', color: '#8899aa', margin: '4px 0 0 0' }}>{drone.model}</p>
                </div>
                <button onClick={(e) => e.stopPropagation()} style={{ background: 'none', border: 'none', color: '#8899aa', cursor: 'pointer', padding: '4px' }}>
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Battery */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#8899aa', display: 'flex', alignItems: 'center', gap: '4px' }}><Battery size={12} /> Battery</span>
                  <span style={{ fontWeight: 700, color: drone.battery > 50 ? '#22c55e' : drone.battery > 20 ? '#f59e0b' : '#ef4444' }}>{drone.battery}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${drone.battery}%`, height: '100%', background: drone.battery > 50 ? '#22c55e' : drone.battery > 20 ? '#f59e0b' : '#ef4444', borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Signal */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#8899aa', display: 'flex', alignItems: 'center', gap: '4px' }}><Wifi size={12} /> Signal</span>
                  <span style={{ fontWeight: 700, color: '#4fc3f7' }}>{drone.signal}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${drone.signal}%`, height: '100%', background: '#4fc3f7', borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Footer Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8899aa', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {drone.altitude}m</span>
                <span>✈ {drone.speed} km/h</span>
                <span>🔋 {drone.flightHours}h</span>
                <span style={{ color: drone.threatLevel === 'HIGH' ? '#ef4444' : drone.threatLevel === 'MEDIUM' ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>{drone.threatLevel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrones.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8899aa' }}>
          <Drone size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>No drones found</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
        <span style={{ color: '#8899aa' }}>Showing {filteredDrones.length} of {drones.length} drones</span>
        <a href="/" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
      </div>
    </div>
  );
};

export default DroneFleet;
