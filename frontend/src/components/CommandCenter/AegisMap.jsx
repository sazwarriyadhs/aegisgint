// D:\AegisGeoInt\frontend\src\components\CommandCenter\AegisMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';

// ============================================
// CONFIG
// ============================================
const API_URL = 'http://localhost:5000';
const ENABLE_WMS_LAYERS = false; // set true kalau Geoserver udah jalan

// ============================================
// LEAFLET ICON FIX
// ============================================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ============================================
// CUSTOM ICONS (hoisted — gak recreate tiap render)
// ============================================
const droneIcon = L.divIcon({
  className: 'drone-icon',
  html: `<div style="
    width: 28px; height: 28px;
    background: #4fc3f7; border-radius: 50%;
    border: 2px solid white; box-shadow: 0 0 20px #4fc3f780;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: white; font-weight: bold;
  ">✈</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const sensorIcon = L.divIcon({
  className: 'sensor-icon',
  html: `<div style="
    width:12px; height:12px; background:#4fc3f7;
    border-radius:50%; border:2px solid white;
    box-shadow:0 0 15px #4fc3f780;
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const threatIcon = (level) => {
  const colors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e', CRITICAL: '#dc2626' };
  const color = colors[level] || '#6b7280';
  const size = level === 'HIGH' || level === 'CRITICAL' ? 18 : 14;
  return L.divIcon({
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color}; border-radius: 50%;
      border: 2px solid white; box-shadow: 0 0 20px ${color}80;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: white; font-weight: bold;
    ">${level === 'HIGH' || level === 'CRITICAL' ? '!' : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// ============================================
// MOCK DATA (fallback kalau Geoserver mati)
// ============================================
const MOCK_OBJECTS = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 'DRN-001', geometry: { type: 'Point', coordinates: [140.71, -2.54] }, properties: { object_id: 'DRN-001', object_type: 'DRONE', threat_level: 'LOW', speed: 120, heading: 45, sector: 'Alpha', confidence_score: 0.95 } },
    { type: 'Feature', id: 'DRN-002', geometry: { type: 'Point', coordinates: [140.75, -2.56] }, properties: { object_id: 'DRN-002', object_type: 'DRONE', threat_level: 'LOW', speed: 110, heading: 90, sector: 'Bravo', confidence_score: 0.92 } },
    { type: 'Feature', id: 'DRN-003', geometry: { type: 'Point', coordinates: [140.68, -2.50] }, properties: { object_id: 'DRN-003', object_type: 'DRONE', threat_level: 'LOW', speed: 130, heading: 180, sector: 'Charlie', confidence_score: 0.89 } },
    { type: 'Feature', id: 'THR-001', geometry: { type: 'Point', coordinates: [140.82, -2.60] }, properties: { object_id: 'THR-001', object_type: 'VESSEL', threat_level: 'HIGH', speed: 25, heading: 270, sector: 'Delta', confidence_score: 0.88 } },
    { type: 'Feature', id: 'THR-002', geometry: { type: 'Point', coordinates: [140.65, -2.48] }, properties: { object_id: 'THR-002', object_type: 'BOAT', threat_level: 'MEDIUM', speed: 30, heading: 135, sector: 'Echo', confidence_score: 0.78 } },
  ]
};

const MOCK_SENSORS = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 'SEN-001', geometry: { type: 'Point', coordinates: [140.72, -2.55] }, properties: { sensor_id: 'SEN-001', sensor_name: 'Radar Alpha', sensor_type: 'RADAR', status: 'active', sector: 'Alpha' } },
    { type: 'Feature', id: 'SEN-002', geometry: { type: 'Point', coordinates: [140.78, -2.58] }, properties: { sensor_id: 'SEN-002', sensor_name: 'AIS Bravo', sensor_type: 'AIS', status: 'active', sector: 'Bravo' } },
  ]
};

const MOCK_THREATS = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 'EVT-001', geometry: { type: 'Point', coordinates: [140.82, -2.60] }, properties: { threat_level: 'HIGH', description: 'Unauthorized vessel' } },
    { type: 'Feature', id: 'EVT-002', geometry: { type: 'Point', coordinates: [140.65, -2.48] }, properties: { threat_level: 'MEDIUM', description: 'Suspicious activity' } },
  ]
};

const MOCK_ZONES = { type: 'FeatureCollection', features: [] };

// ============================================
// MAIN COMPONENT
// ============================================
const AegisMap = () => {
  const [trackedObjects, setTrackedObjects] = useState([]);
  const [threats, setThreats] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown'); // 'live' | 'mock'
  const [selectedObject, setSelectedObject] = useState(null);
  const [mapCenter] = useState([-2.54, 140.71]);
  const [mapZoom] = useState(9);
  const [basemap, setBasemap] = useState('satellite');
  const [stats, setStats] = useState({ drones: 0, threats: 0, sensors: 0 });

  const basemaps = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'ESRI'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: 'OpenStreetMap'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: 'CartoDB'
    }
  };

  const fetchFromGeoserver = async (typeName) => {
    return axios.get(`${GEOSERVER_URL}/wfs`, {
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: `aegisgeoint:${typeName}`,
        outputFormat: 'application/json'
      },
      timeout: 5000
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let objectsRes, threatsRes, sensorsRes, zonesRes;
      let usingMock = false;

      try {
        [objectsRes, threatsRes, sensorsRes, zonesRes] = await Promise.all([
          fetchFromBackend('/api/drones'),
          fetchFromBackend('/api/threats'),
          fetchFromBackend('/api/sensors'),
          fetchFromBackend('/api/zones'),
        ]);
        console.log('[AegisMap] ✅ Geoserver OK — live data');
      } catch (geoErr) {
        console.warn('[AegisMap] ⚠️ Geoserver unreachable, pakai MOCK data:', geoErr.message);
        usingMock = true;
        objectsRes = { data: MOCK_OBJECTS };
        threatsRes = { data: MOCK_THREATS };
        sensorsRes = { data: MOCK_SENSORS };
        zonesRes = { data: MOCK_ZONES };
      }

      let objects = [];
      if (objectsRes.data?.features) {
        objects = objectsRes.data.features.map(f => ({
          id: f.properties.object_id || f.id,
          type: f.properties.object_type || 'Unknown',
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          threat: f.properties.threat_level || 'LOW',
          speed: f.properties.speed || 0,
          heading: f.properties.heading || 0,
          sector: f.properties.sector || 'Unknown',
          confidence: f.properties.confidence_score || 0.85
        }));
        setTrackedObjects(objects);
      }

      if (threatsRes.data?.features) setThreats(threatsRes.data.features);
      if (sensorsRes.data?.features) setSensors(sensorsRes.data.features);
      if (zonesRes.data?.features) setZones(zonesRes.data.features);

      setStats({
        drones: objects.filter(o => o.type === 'DRONE' || o.type === 'drone').length,
        threats: threatsRes.data?.features?.length || 0,
        sensors: sensorsRes.data?.features?.length || 0
      });

      setDataSource(usingMock ? 'mock' : 'live');
      setLoading(false);
    } catch (err) {
      console.error('[AegisMap] Fatal error:', err);
      setError('Failed to load map data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && trackedObjects.length === 0) {
    return (
      <div className="map-loading">
        <div className="loading-spinner">🗺️</div>
        <p>Loading Tactical Map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <AlertTriangle size={32} />
        <p>{error}</p>
        <button onClick={fetchData} className="retry-btn">Retry</button>
      </div>
    );
  }

  const currentBasemap = basemaps[basemap] || basemaps.satellite;

  return (
    <div className="aegis-map-container">
      {/* Header */}
      <div className="map-header">
        <div className="map-title">
          <span>🗺️</span>
          <span className="title-text">Tactical Map</span>
          {dataSource === 'mock' && (
            <span title="Geoserver offline — pakai mock data" style={{
              fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
              background: 'rgba(245,158,11,0.2)', color: '#f59e0b',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>MOCK</span>
          )}
          {dataSource === 'live' && (
            <span title="Data live dari Geoserver" style={{
              fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
              background: 'rgba(34,197,94,0.2)', color: '#22c55e',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>LIVE</span>
          )}
        </div>
        <div className="map-stats">
          <div className="stat-item">
            <span className="stat-icon">✈</span>
            <span className="stat-value">{stats.drones}</span>
            <span className="stat-label">Drones</span>
          </div>
          <div className="stat-item threat">
            <span className="stat-icon">⚠️</span>
            <span className="stat-value">{stats.threats}</span>
            <span className="stat-label">Threats</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📡</span>
            <span className="stat-value">{stats.sensors}</span>
            <span className="stat-label">Sensors</span>
          </div>
        </div>
        <div className="basemap-selector">
          <button className={`basemap-btn ${basemap === 'satellite' ? 'active' : ''}`}
            onClick={() => setBasemap('satellite')}>🛰️</button>
          <button className={`basemap-btn ${basemap === 'osm' ? 'active' : ''}`}
            onClick={() => setBasemap('osm')}>🗺️</button>
          <button className={`basemap-btn ${basemap === 'dark' ? 'active' : ''}`}
            onClick={() => setBasemap('dark')}>🌙</button>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '500px', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url={currentBasemap.url}
          attribution={currentBasemap.attribution}
        />

        {/* WMS Layers — optional, aktifin kalau Geoserver udah jalan */}
        {ENABLE_WMS_LAYERS && (
          <>
            <WMSTileLayer
              url={`${GEOSERVER_URL}/wms`}
              layers="aegisgeoint:papua_restricted_zones"
              format="image/png"
              transparent={true}
              version="1.1.0"
              opacity={0.4}
            />
            <WMSTileLayer
              url={`${GEOSERVER_URL}/wms`}
              layers="aegisgeoint:papua_threat_events"
              format="image/png"
              transparent={true}
              version="1.1.0"
              opacity={0.6}
            />
          </>
        )}

        {/* Tracked Objects */}
        {trackedObjects.map((obj) => {
          const isDrone = obj.type === 'DRONE' || obj.type === 'drone';
          return (
            <Marker
              key={obj.id}
              position={[obj.lat, obj.lng]}
              icon={isDrone ? droneIcon : threatIcon(obj.threat)}
              eventHandlers={{ click: () => setSelectedObject(obj) }}
            >
              <Popup>
                <div className="popup-content">
                  <div className="popup-header">
                    <strong>{obj.id}</strong>
                    <span className={`threat-badge ${obj.threat.toLowerCase()}`}>
                      {obj.threat}
                    </span>
                  </div>
                  <div className="popup-body">
                    <div className="popup-row"><span>Type:</span><span>{obj.type}</span></div>
                    <div className="popup-row"><span>Speed:</span><span>{obj.speed} km/h</span></div>
                    <div className="popup-row"><span>Heading:</span><span>{obj.heading}°</span></div>
                    <div className="popup-row"><span>Sector:</span><span>{obj.sector}</span></div>
                    <div className="popup-row"><span>Confidence:</span><span>{(obj.confidence * 100).toFixed(0)}%</span></div>
                    <div className="popup-row"><span>Position:</span><span>{obj.lat.toFixed(4)}, {obj.lng.toFixed(4)}</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Sensors */}
        {sensors.map((sensor, idx) => {
          const props = sensor.properties;
          if (!props || !sensor.geometry) return null;
          const coords = sensor.geometry.coordinates;
          const key = props.sensor_id || props.object_id || props.id || `sensor-${idx}`;
          return (
            <Marker
              key={`sensor-${key}`}
              position={[coords[1], coords[0]]}
              icon={sensorIcon}
            >
              <Popup>
                <div className="popup-content">
                  <h4 style={{ color: '#4fc3f7', margin: '0 0 8px 0' }}>
                    📡 {props.sensor_name || props.name || 'Sensor'}
                  </h4>
                  <div className="popup-row"><span>Type:</span><span>{props.sensor_type || 'N/A'}</span></div>
                  <div className="popup-row"><span>Status:</span><span style={{ color: '#22c55e' }}>{props.status || 'active'}</span></div>
                  <div className="popup-row"><span>Sector:</span><span>{props.sector || 'N/A'}</span></div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-title">LEGEND</div>
        <div className="legend-item"><span className="legend-dot drone">✈</span><span>Drone</span></div>
        <div className="legend-item"><span className="legend-dot threat-high"></span><span>High Threat</span></div>
        <div className="legend-item"><span className="legend-dot threat-medium"></span><span>Medium Threat</span></div>
        <div className="legend-item"><span className="legend-dot threat-low"></span><span>Low Threat</span></div>
        <div className="legend-item"><span className="legend-dot sensor">📡</span><span>Sensor</span></div>
        <div className="legend-item"><span className="legend-dot geofence"></span><span>Restricted Zone</span></div>
      </div>

      {/* Selected Object Panel */}
      {selectedObject && (
        <div className="selected-panel">
          <div className="selected-header">
            <span className="selected-title">{selectedObject.id}</span>
            <button className="close-btn" onClick={() => setSelectedObject(null)}>✕</button>
          </div>
          <div className="selected-body">
            <div className="selected-row"><span>Type:</span><span>{selectedObject.type}</span></div>
            <div className="selected-row"><span>Threat:</span><span style={{ color: selectedObject.threat === 'HIGH' ? '#ef4444' : selectedObject.threat === 'MEDIUM' ? '#f59e0b' : '#22c55e' }}>{selectedObject.threat}</span></div>
            <div className="selected-row"><span>Speed:</span><span>{selectedObject.speed} km/h</span></div>
            <div className="selected-row"><span>Heading:</span><span>{selectedObject.heading}°</span></div>
            <div className="selected-row"><span>Sector:</span><span>{selectedObject.sector}</span></div>
            <div className="selected-row"><span>Confidence:</span><span>{(selectedObject.confidence * 100).toFixed(0)}%</span></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .aegis-map-container { position: relative; width: 100%; background: #0a0e1a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
        .map-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(10,14,26,0.95); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .map-title { display: flex; align-items: center; gap: 8px; color: #e0e8f0; font-weight: 600; font-size: 14px; }
        .map-stats { display: flex; gap: 20px; }
        .stat-item { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #e0e8f0; }
        .stat-item .stat-icon { font-size: 14px; }
        .stat-item .stat-value { font-weight: 700; color: #4fc3f7; }
        .stat-item.threat .stat-value { color: #ef4444; }
        .stat-item .stat-label { font-size: 11px; color: #8899aa; }
        .basemap-selector { display: flex; gap: 4px; background: rgba(255,255,255,0.05); padding: 3px; border-radius: 6px; }
        .basemap-btn { padding: 4px 10px; background: transparent; border: none; border-radius: 4px; color: #8899aa; cursor: pointer; font-size: 16px; transition: all 0.3s ease; }
        .basemap-btn:hover { background: rgba(255,255,255,0.05); }
        .basemap-btn.active { background: rgba(79,195,247,0.15); color: #4fc3f7; }
        .map-loading, .map-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; background: rgba(255,255,255,0.03); border-radius: 12px; color: #8899aa; }
        .map-loading .loading-spinner { font-size: 48px; animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .map-error .retry-btn { margin-top: 12px; padding: 8px 24px; background: rgba(79,195,247,0.15); border: 1px solid rgba(79,195,247,0.2); border-radius: 6px; color: #4fc3f7; cursor: pointer; }
        .map-legend { position: absolute; bottom: 20px; left: 20px; z-index: 1000; background: rgba(10,14,26,0.92); backdrop-filter: blur(10px); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); min-width: 120px; }
        .legend-title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8899aa; margin-bottom: 6px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #e0e8f0; padding: 2px 0; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 8px; }
        .legend-dot.drone { background: #4fc3f7; color: white; font-size: 10px; }
        .legend-dot.threat-high { background: #ef4444; }
        .legend-dot.threat-medium { background: #f59e0b; }
        .legend-dot.threat-low { background: #22c55e; }
        .legend-dot.sensor { background: #4fc3f7; border-color: #4fc3f7; font-size: 10px; }
        .legend-dot.geofence { background: transparent; border: 2px dashed #ef4444; width: 14px; height: 10px; border-radius: 2px; }
        .selected-panel { position: absolute; bottom: 80px; right: 20px; z-index: 1000; background: rgba(10,14,26,0.95); backdrop-filter: blur(10px); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); min-width: 200px; max-width: 280px; }
        .selected-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .selected-title { font-weight: 600; color: #4fc3f7; }
        .close-btn { background: none; border: none; color: #8899aa; cursor: pointer; font-size: 16px; }
        .selected-body { display: flex; flex-direction: column; gap: 4px; }
        .selected-row { display: flex; justify-content: space-between; font-size: 13px; color: #e0e8f0; }
        .selected-row span:first-child { color: #8899aa; }
        .popup-content { min-width: 200px; }
        .popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .popup-header strong { color: #e0e8f0; font-size: 14px; }
        .threat-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .threat-badge.high { background: rgba(239,83,80,0.2); color: #ef4444; }
        .threat-badge.medium { background: rgba(245,158,11,0.2); color: #f59e0b; }
        .threat-badge.low { background: rgba(34,197,94,0.2); color: #22c55e; }
        .popup-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 13px; color: #e0e8f0; }
        .popup-row span:first-child { color: #8899aa; }
        :global(.leaflet-popup-content-wrapper) { background: #1a1f33 !important; color: #e0e8f0 !important; border-radius: 8px !important; border: 1px solid rgba(255,255,255,0.06) !important; }
        :global(.leaflet-popup-tip) { background: #1a1f33 !important; }
        :global(.leaflet-control-zoom a) { background: #1a1f33 !important; color: #e0e8f0 !important; border-color: rgba(255,255,255,0.06) !important; }
        :global(.leaflet-control-zoom a:hover) { background: rgba(255,255,255,0.05) !important; }
        @media (max-width: 768px) {
          .map-header { flex-direction: column; gap: 8px; }
          .map-stats { gap: 12px; }
          .selected-panel { bottom: 80px; right: 10px; left: 10px; max-width: none; }
          .map-legend { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AegisMap;
