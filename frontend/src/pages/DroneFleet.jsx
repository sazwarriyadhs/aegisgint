// D:\AegisGeoInt\frontend\src\pages\DroneFleet.jsx
import React, { useState, useEffect } from 'react';
import { 
  Drone, 
  Plus, 
  Filter, 
  Search, 
  MoreVertical,
  Battery,
  Signal,
  Wifi,
  MapPin,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Server,
  WifiOff
} from 'lucide-react';
import axios from 'axios';
import logoUrl from '/logo.png';

const DroneFleet = () => {
  const [drones, setDrones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ============================================
  // FETCH REAL DATA FROM BACKEND + GEOSERVER
  // ============================================
  const fetchDrones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch dari Backend API
      const backendRes = await axios.get('http://localhost:5000/api/drones', {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('📡 RAW API RESPONSE:', backendRes.data);
      console.log('📡 DATA LENGTH:', backendRes.data?.data?.length);

      let droneData = [];
      
      if (backendRes.data && backendRes.data.data && backendRes.data.data.length > 0) {
        // Map data dengan aman
        droneData = backendRes.data.data.map((d, index) => {
          console.log(`📡 Processing drone ${index}:`, d);
          return {
            id: d.drone_id || d.id || `DRN-${String(index + 1).padStart(3, '0')}`,
            name: d.callsign || d.name || `DRONE ${String(index + 1).padStart(2, '0')}`,
            model: 'DJI M30T',
            status: (d.status || 'ACTIVE').toLowerCase(),
            battery: d.battery ?? Math.floor(Math.random() * 40 + 60),
            signal: d.signal ?? Math.floor(Math.random() * 30 + 70),
            altitude: d.altitude ?? Math.floor(Math.random() * 200 + 50),
            speed: d.speed ?? Math.floor(Math.random() * 30 + 10),
            lat: d.lat ?? -2.5 + Math.random() * 2,
            lng: d.lon ?? 140.5 + Math.random() * 2,
            flightTime: d.flight_time || `${Math.floor(Math.random() * 4 + 1)}h ${Math.floor(Math.random() * 60)}m`,
            mission: d.mission || 'Surveillance',
            threatLevel: d.threat_level || 'LOW',
            confidence: d.confidence_score || 0.85,
            sector: d.sector || 'Unknown',
            image: `https://picsum.photos/seed/${d.drone_id || d.id || index}/200/150`,
            lastMaintenance: Math.floor(Math.random() * 30 + 1) + ' days ago',
            firmware: 'v' + (Math.floor(Math.random() * 2 + 3)) + '.' + (Math.floor(Math.random() * 5)) + '.' + (Math.floor(Math.random() * 10)),
            totalFlights: Math.floor(Math.random() * 500 + 100)
          };
        });
      } else {
        console.warn('⚠️ No data from API, using fallback');
        droneData = generateFallbackDrones();
      }

      console.log('✅ MAPPED DRONES:', droneData.length, 'drones');
      console.log('✅ FIRST DRONE:', droneData[0]);

      setDrones(droneData);
      setLastUpdate(new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error('❌ Error fetching drone data:', error);
      setError('Failed to load drone data. Please check connection.');
      
      // Fallback to sample data
      const fallback = generateFallbackDrones();
      console.log('✅ USING FALLBACK:', fallback.length, 'drones');
      setDrones(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FALLBACK DATA
  // ============================================
  const generateFallbackDrones = () => {
    const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];
    const statuses = ['active', 'active', 'active', 'warning', 'active', 'idle', 'active', 'critical'];
    const models = ['DJI M30T', 'DJI M300', 'Autel EVO', 'Parrot', 'Skydio', 'DJI M30T', 'Autel EVO', 'DJI M300'];
    
    return names.map((name, i) => ({
      id: `DRN-${String(i+1).padStart(3, '0')}`,
      name: `DRONE ${String(i+1).padStart(2, '0')} - ${name}`,
      model: models[i],
      status: statuses[i] || 'active',
      battery: Math.floor(Math.random() * 40 + 60),
      signal: Math.floor(Math.random() * 30 + 70),
      altitude: Math.floor(Math.random() * 200 + 50),
      speed: Math.floor(Math.random() * 30 + 10),
      lat: -2.5 + Math.random() * 5,
      lng: 138 + Math.random() * 5,
      flightTime: `${Math.floor(Math.random() * 4 + 1)}h ${Math.floor(Math.random() * 60)}m`,
      mission: ['Surveillance', 'Mapping', 'Search & Rescue', 'Patrol', 'Idle'][Math.floor(Math.random() * 5)],
      lastMaintenance: `${Math.floor(Math.random() * 30 + 1)} days ago`,
      firmware: `v${Math.floor(Math.random() * 2 + 3)}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
      totalFlights: Math.floor(Math.random() * 500 + 100),
      image: `https://picsum.photos/seed/${i}/200/150`,
      threatLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
      confidence: 0.7 + Math.random() * 0.25,
      sector: ['Sector Alpha', 'Sector Bravo', 'Sector Charlie'][Math.floor(Math.random() * 3)]
    }));
  };

  // ============================================
  // AUTO REFRESH
  // ============================================
  useEffect(() => {
    fetchDrones();
    const interval = setInterval(fetchDrones, 15000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // FILTERS
  // ============================================
  const filteredDrones = drones.filter(drone => {
    const matchesSearch = drone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          drone.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drone.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log('🔍 FILTERED DRONES:', filteredDrones.length);

  const getStatusBadge = (status) => {
    const config = {
      active: { icon: <CheckCircle size={14} />, color: 'green', label: 'Active' },
      warning: { icon: <AlertTriangle size={14} />, color: 'yellow', label: 'Warning' },
      critical: { icon: <XCircle size={14} />, color: 'red', label: 'Critical' },
      idle: { icon: <Pause size={14} />, color: 'gray', label: 'Idle' }
    };
    return config[status] || config.idle;
  };

  const getBatteryColor = (level) => {
    if (level > 75) return 'battery-high';
    if (level > 50) return 'battery-medium';
    if (level > 25) return 'battery-low';
    return 'battery-critical';
  };

  if (isLoading) {
    return (
      <div className="fleet-loading">
        <div className="loading-spinner">
          <img src={logoUrl} alt="Loading" style={{ width: 60, height: 60, marginBottom: 16 }} />
          <RefreshCw className="spinning" size={40} />
          <p>Loading Fleet Data...</p>
          <small>Connecting to AegisGEOINT system</small>
        </div>
      </div>
    );
  }

  return (
    <div className="drone-fleet-page">
      <div className="fleet-header">
        <div className="header-left">
          <h1 className="page-title">
            <Drone size={28} />
            Drone Fleet Management
          </h1>
          <span className="fleet-count">{filteredDrones.length} Drones</span>
        </div>
        <div className="header-actions">
          <div className="connection-status">
            {error ? (
              <span className="status-offline">
                <WifiOff size={16} />
                Offline
              </span>
            ) : (
              <span className="status-online">
                <Server size={16} />
                {lastUpdate ? `Updated: ${lastUpdate}` : 'Online'}
              </span>
            )}
          </div>
          <button className="btn-primary" onClick={fetchDrones}>
            <RefreshCw size={18} />
            Sync
          </button>
          <button className="btn-secondary">
            <Plus size={18} />
            Add Drone
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={fetchDrones}>Retry</button>
        </div>
      )}

      <div className="fleet-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search drones by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
          <button className={`filter-btn active-filter ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}><CheckCircle size={14} />Active</button>
          <button className={`filter-btn warning-filter ${statusFilter === 'warning' ? 'active' : ''}`} onClick={() => setStatusFilter('warning')}><AlertTriangle size={14} />Warning</button>
          <button className={`filter-btn critical-filter ${statusFilter === 'critical' ? 'active' : ''}`} onClick={() => setStatusFilter('critical')}><XCircle size={14} />Critical</button>
          <button className={`filter-btn idle-filter ${statusFilter === 'idle' ? 'active' : ''}`} onClick={() => setStatusFilter('idle')}><Pause size={14} />Idle</button>
        </div>
      </div>

      <div className="fleet-grid">
        {filteredDrones.length === 0 ? (
          <div className="empty-state">
            <Drone size={48} />
            <h3>No drones found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredDrones.map((drone) => {
            const status = getStatusBadge(drone.status);
            return (
              <div key={drone.id} className={`fleet-card ${selectedDrone === drone.id ? 'selected' : ''}`} onClick={() => setSelectedDrone(drone.id === selectedDrone ? null : drone.id)}>
                <div className="card-image">
                  <img src={drone.image} alt={drone.name} />
                  <div className={`status-indicator ${drone.status}`}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <div>
                      <h3 className="drone-name">{drone.name}</h3>
                      <span className="drone-id">{drone.id}</span>
                    </div>
                    <button className="more-btn"><MoreVertical size={18} /></button>
                  </div>
                  <div className="drone-specs">
                    <div className="spec-item"><span className="spec-label">Model</span><span className="spec-value">{drone.model}</span></div>
                    <div className="spec-item"><span className="spec-label">Mission</span><span className="spec-value">{drone.mission}</span></div>
                  </div>
                  <div className="drone-metrics-grid">
                    <div className="metric-item">
                      <Battery size={16} />
                      <div className="metric-bar"><div className={`metric-fill ${getBatteryColor(drone.battery)}`} style={{ width: `${drone.battery}%` }} /></div>
                      <span className="metric-value">{drone.battery}%</span>
                    </div>
                    <div className="metric-item">
                      <Signal size={16} />
                      <div className="metric-bar"><div className="metric-fill signal" style={{ width: `${drone.signal}%` }} /></div>
                      <span className="metric-value">{drone.signal}%</span>
                    </div>
                  </div>
                  <div className="drone-stats">
                    <div className="stat"><MapPin size={14} /><span>{drone.altitude}m</span></div>
                    <div className="stat"><Wifi size={14} /><span>{drone.speed} km/h</span></div>
                    <div className="stat"><span>🕐</span><span>{drone.flightTime}</span></div>
                    {drone.threatLevel && (
                      <div className={`stat threat-${drone.threatLevel.toLowerCase()}`}>
                        <AlertTriangle size={14} />
                        <span>{drone.threatLevel}</span>
                      </div>
                    )}
                  </div>
                  {selectedDrone === drone.id && (
                    <div className="drone-details-expanded">
                      <div className="detail-row"><span className="detail-label">Last Maintenance:</span><span>{drone.lastMaintenance}</span></div>
                      <div className="detail-row"><span className="detail-label">Firmware:</span><span>{drone.firmware}</span></div>
                      <div className="detail-row"><span className="detail-label">Total Flights:</span><span>{drone.totalFlights}</span></div>
                      <div className="detail-row"><span className="detail-label">Position:</span><span>{drone.lat.toFixed(4)}, {drone.lng.toFixed(4)}</span></div>
                      {drone.confidence && <div className="detail-row"><span className="detail-label">Confidence:</span><span>{(drone.confidence * 100).toFixed(0)}%</span></div>}
                      {drone.sector && <div className="detail-row"><span className="detail-label">Sector:</span><span>{drone.sector}</span></div>}
                      <div className="detail-actions">
                        <button className="action-btn primary"><Play size={14} />Deploy</button>
                        <button className="action-btn warning"><AlertTriangle size={14} />Ground</button>
                        <button className="action-btn info"><Search size={14} />Details</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .drone-fleet-page { padding: 24px; background: #0a0e1a; min-height: 100vh; color: #e0e8f0; }
        .fleet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .page-title { display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 700; color: #e0e8f0; }
        .page-title svg { color: #4fc3f7; }
        .fleet-count { font-size: 14px; color: #8899aa; background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 12px; }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .connection-status { font-size: 13px; padding: 6px 12px; border-radius: 6px; }
        .status-online { color: #4caf50; display: flex; align-items: center; gap: 6px; }
        .status-offline { color: #ef5350; display: flex; align-items: center; gap: 6px; }
        .btn-primary, .btn-secondary { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; transition: all 0.3s ease; }
        .btn-primary { background: linear-gradient(135deg, #4fc3f7, #00bcd4); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79,195,247,0.3); }
        .btn-secondary { background: rgba(255,255,255,0.05); color: #e0e8f0; border: 1px solid rgba(255,255,255,0.08); }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .error-alert { display: flex; align-items: center; gap: 12px; padding: 12px 20px; margin-bottom: 16px; background: rgba(239,83,80,0.1); border: 1px solid rgba(239,83,80,0.2); border-radius: 8px; color: #ef5350; }
        .error-alert button { margin-left: auto; padding: 4px 16px; background: rgba(239,83,80,0.2); border: 1px solid rgba(239,83,80,0.3); border-radius: 4px; color: #ef5350; cursor: pointer; }
        .fleet-filters { display: flex; gap: 16px; margin-bottom: 24px; padding: 16px 20px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); min-width: 200px; }
        .search-box svg { color: #8899aa; }
        .search-box input { background: transparent; border: none; color: #e0e8f0; outline: none; width: 100%; font-size: 14px; }
        .search-box input::placeholder { color: #8899aa; }
        .filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: transparent; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; color: #8899aa; cursor: pointer; transition: all 0.3s ease; font-size: 13px; }
        .filter-btn:hover { background: rgba(255,255,255,0.05); color: #e0e8f0; }
        .filter-btn.active { background: rgba(79,195,247,0.15); border-color: #4fc3f7; color: #4fc3f7; }
        .filter-btn.active-filter.active { background: rgba(76,175,80,0.15); border-color: #4caf50; color: #4caf50; }
        .filter-btn.warning-filter.active { background: rgba(255,193,7,0.15); border-color: #ffc107; color: #ffc107; }
        .filter-btn.critical-filter.active { background: rgba(239,83,80,0.15); border-color: #ef5350; color: #ef5350; }
        .filter-btn.idle-filter.active { background: rgba(136,153,170,0.15); border-color: #8899aa; color: #8899aa; }
        .fleet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #8899aa; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.06); }
        .empty-state svg { color: #4fc3f7; margin-bottom: 16px; }
        .empty-state h3 { margin-bottom: 8px; color: #e0e8f0; }
        .fleet-card { background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; transition: all 0.3s ease; cursor: pointer; }
        .fleet-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-color: rgba(79,195,247,0.2); }
        .fleet-card.selected { border-color: #4fc3f7; box-shadow: 0 0 0 2px rgba(79,195,247,0.2); }
        .card-image { position: relative; height: 160px; overflow: hidden; background: #1a1f33; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; }
        .status-indicator { position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .status-indicator.active { background: rgba(76,175,80,0.9); color: white; }
        .status-indicator.warning { background: rgba(255,193,7,0.9); color: #1a1f33; }
        .status-indicator.critical { background: rgba(239,83,80,0.9); color: white; }
        .status-indicator.idle { background: rgba(136,153,170,0.9); color: white; }
        .card-content { padding: 16px; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .drone-name { font-size: 16px; font-weight: 600; color: #e0e8f0; margin: 0; }
        .drone-id { font-size: 12px; color: #8899aa; }
        .more-btn { background: transparent; border: none; color: #8899aa; cursor: pointer; padding: 4px; transition: color 0.3s ease; }
        .more-btn:hover { color: #e0e8f0; }
        .drone-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .spec-item { display: flex; flex-direction: column; gap: 2px; }
        .spec-label { font-size: 10px; color: #8899aa; text-transform: uppercase; letter-spacing: 0.5px; }
        .spec-value { font-size: 13px; font-weight: 500; color: #e0e8f0; }
        .drone-metrics-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .metric-item { display: flex; align-items: center; gap: 10px; }
        .metric-item svg { color: #8899aa; width: 16px; height: 16px; }
        .metric-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .metric-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease; }
        .metric-fill.battery-high { background: #4caf50; }
        .metric-fill.battery-medium { background: #ffc107; }
        .metric-fill.battery-low { background: #ff9800; }
        .metric-fill.battery-critical { background: #ef5350; }
        .metric-fill.signal { background: #4fc3f7; }
        .metric-value { font-size: 12px; font-weight: 600; color: #e0e8f0; min-width: 40px; text-align: right; }
        .drone-stats { display: flex; gap: 16px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; }
        .stat { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #8899aa; }
        .stat svg { color: #4fc3f7; }
        .stat.threat-high { color: #ef5350; }
        .stat.threat-medium { color: #ffc107; }
        .stat.threat-low { color: #4caf50; }
        .stat.threat-high svg, .stat.threat-medium svg, .stat.threat-low svg { color: currentColor; }
        .drone-details-expanded { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .detail-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .detail-label { color: #8899aa; }
        .detail-actions { display: flex; gap: 8px; margin-top: 12px; }
        .action-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; flex: 1; justify-content: center; }
        .action-btn.primary { background: rgba(79,195,247,0.2); color: #4fc3f7; }
        .action-btn.primary:hover { background: rgba(79,195,247,0.3); }
        .action-btn.warning { background: rgba(255,193,7,0.2); color: #ffc107; }
        .action-btn.warning:hover { background: rgba(255,193,7,0.3); }
        .action-btn.info { background: rgba(136,153,170,0.2); color: #8899aa; }
        .action-btn.info:hover { background: rgba(136,153,170,0.3); }
        .fleet-loading { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .loading-spinner { text-align: center; color: #8899aa; }
        .loading-spinner svg { color: #4fc3f7; }
        .loading-spinner p { margin-top: 16px; font-size: 16px; }
        .loading-spinner small { display: block; margin-top: 8px; color: #4fc3f7; font-size: 13px; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .fleet-header { flex-direction: column; gap: 12px; align-items: stretch; }
          .header-actions { flex-wrap: wrap; justify-content: center; }
          .btn-primary, .btn-secondary { flex: 1; justify-content: center; }
          .fleet-filters { flex-direction: column; }
          .search-box { width: 100%; }
          .filter-group { justify-content: center; }
          .fleet-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default DroneFleet;
