const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Import telemetry service
const telemetryService = require('./services/telemetryService');

app.use(cors());
app.use(express.json());

// API endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/drones', (req, res) => {
  const drones = telemetryService.getDrones();
  res.json({ success: true, data: drones, count: drones.length });
});


// ============ THREATS (mock) ============
const MOCK_THREATS = [
  { event_id: 'EVT-001', threat_level: 'HIGH',   description: 'Unauthorized vessel crossing', sector: 'Delta',   lat: -2.60, lng: 140.82 },
  { event_id: 'EVT-002', threat_level: 'MEDIUM', description: 'Suspicious activity',           sector: 'Echo',    lat: -2.48, lng: 140.65 },
  { event_id: 'EVT-003', threat_level: 'HIGH',   description: 'Illegal logging detected',      sector: 'Foxtrot', lat: -2.65, lng: 140.90 },
];
app.get('/api/threats', (req, res) => {
  res.json({ success: true, data: MOCK_THREATS, count: MOCK_THREATS.length });
});

// ============ SENSORS (mock) ============
const MOCK_SENSORS = [
  { sensor_id: 'SEN-001', sensor_name: 'Radar Alpha',    sensor_type: 'RADAR',    status: 'active', sector: 'Alpha',   lat: -2.55, lng: 140.72 },
  { sensor_id: 'SEN-002', sensor_name: 'AIS Bravo',      sensor_type: 'AIS',      status: 'active', sector: 'Bravo',   lat: -2.58, lng: 140.78 },
  { sensor_id: 'SEN-003', sensor_name: 'Optical Charlie',sensor_type: 'OPTICAL',  status: 'active', sector: 'Charlie', lat: -2.62, lng: 140.85 },
  { sensor_id: 'SEN-004', sensor_name: 'Acoustic Delta', sensor_type: 'ACOUSTIC', status: 'active', sector: 'Delta',   lat: -2.45, lng: 140.68 },
  { sensor_id: 'SEN-005', sensor_name: 'Thermal Echo',   sensor_type: 'THERMAL',  status: 'active', sector: 'Echo',    lat: -2.50, lng: 140.60 },
];
app.get('/api/sensors', (req, res) => {
  res.json({ success: true, data: MOCK_SENSORS, count: MOCK_SENSORS.length });
});

// ============ ZONES (mock polygons) ============
const MOCK_ZONES = [
  { zone_id: 'ZONE-001', zone_name: 'Restricted Border Zone A', zone_type: 'BORDER',   status: 'active',
    coordinates: [[140.75,-2.60],[140.85,-2.60],[140.85,-2.55],[140.75,-2.55],[140.75,-2.60]] },
  { zone_id: 'ZONE-002', zone_name: 'Protected Forest B',      zone_type: 'FOREST',   status: 'active',
    coordinates: [[140.55,-2.50],[140.65,-2.50],[140.65,-2.45],[140.55,-2.45],[140.55,-2.50]] },
  { zone_id: 'ZONE-003', zone_name: 'Maritime Exclusion C',    zone_type: 'MARITIME', status: 'active',
    coordinates: [[140.88,-2.68],[140.95,-2.68],[140.95,-2.62],[140.88,-2.62],[140.88,-2.68]] },
];
app.get('/api/zones', (req, res) => {
  res.json({ success: true, data: MOCK_ZONES, count: MOCK_ZONES.length });
});


// ============ WFS-COMPATIBLE ENDPOINT (untuk Intelligence Center) ============
// Format: WFS GetFeature dengan output GeoJSON FeatureCollection
// Query: ?typeName=aegisgeoint:papua_threat_events&outputFormat=application/json
app.get('/wfs', (req, res) => {
  const typeName = (req.query.typeName || '').toLowerCase();
  const layerName = typeName.split(':').pop();
  
  let features = [];
  
  if (layerName === 'papua_threat_events') {
    features = MOCK_THREATS.map(t => ({
      type: 'Feature',
      id: t.event_id,
      geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
      properties: {
        id: t.event_id,
        event_name: t.description,
        location: t.sector,
        threat_level: t.threat_level,
        detected_at: new Date().toISOString(),
        status: 'ACTIVE',
        sector: t.sector,
        lat: t.lat,
        lng: t.lng
      }
    }));
  } else if (layerName === 'papua_sensors') {
    features = MOCK_SENSORS.map(s => ({
      type: 'Feature',
      id: s.sensor_id,
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: s
    }));
  } else if (layerName === 'papua_restricted_zones') {
    features = MOCK_ZONES.map(z => ({
      type: 'Feature',
      id: z.zone_id,
      geometry: { type: 'Polygon', coordinates: [z.coordinates] },
      properties: z
    }));
  } else if (layerName === 'papua_tracked_objects') {
    const drones = telemetryService.getDrones() || [];
    features = drones.map(d => ({
      type: 'Feature',
      id: d.id,
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      properties: d
    }));
  }
  
  res.json({
    type: 'FeatureCollection',
    features: features,
    totalFeatures: features.length,
    numberMatched: features.length,
    numberReturned: features.length
  });
});

app.get('/', (req, res) => {
  res.json({ name: 'AegisGEOINT Backend', version: '2.0.0', status: 'running' });
});

// WebSocket
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  telemetryService.addClient(ws);
  
  ws.on('close', () => {
    telemetryService.removeClient(ws);
  });
});


// ============ ENEMY INTEL ENDPOINTS ============
const MOCK_ENEMY_WEAPONS = [
  { id: 'WPN-001', type: 'Assault Rifle', model: 'AK-47',  count: 24, caliber: '7.62mm', location: 'Nduga',       lat: -4.50, lng: 138.50, confidence: 0.92, source: 'DRONE-ALPHA' },
  { id: 'WPN-002', type: 'Sniper Rifle',  model: 'SVD',    count: 6,  caliber: '7.62mm', location: 'Yahukimo',    lat: -4.80, lng: 139.50, confidence: 0.88, source: 'DRONE-BRAVO' },
  { id: 'WPN-003', type: 'LMG',           model: 'PKM',    count: 4,  caliber: '7.62mm', location: 'Pegunungan Bintang', lat: -4.50, lng: 140.50, confidence: 0.85, source: 'SIGINT' },
  { id: 'WPN-004', type: 'RPG',           model: 'RPG-7',  count: 3,  caliber: '40mm',   location: 'Nduga',       lat: -4.52, lng: 138.48, confidence: 0.78, source: 'SAT-INT' },
  { id: 'WPN-005', type: 'Mortar',        model: '82mm',   count: 2,  caliber: '82mm',   location: 'Asmat',       lat: -5.50, lng: 138.50, confidence: 0.81, source: 'SIGINT' },
];

const MOCK_ENEMY_TROOPS = [
  { id: 'TRP-001', unit: 'Alpha Cell',     size: 45, location: 'Nduga',              lat: -4.50, lng: 138.50, threat: 'HIGH',   activity: 'Fortifying position', lastSeen: '2h ago' },
  { id: 'TRP-002', unit: 'Bravo Cell',     size: 28, location: 'Yahukimo',           lat: -4.80, lng: 139.50, threat: 'MEDIUM', activity: 'Patrolling',          lastSeen: '45m ago' },
  { id: 'TRP-003', unit: 'Charlie Cell',   size: 62, location: 'Pegunungan Bintang', lat: -4.50, lng: 140.50, threat: 'HIGH',   activity: 'Convoy movement',     lastSeen: '15m ago' },
  { id: 'TRP-004', unit: 'Delta Cell',     size: 18, location: 'Asmat',              lat: -5.50, lng: 138.50, threat: 'LOW',    activity: 'Resting',             lastSeen: '6h ago' },
  { id: 'TRP-005', unit: 'Echo Cell',      size: 35, location: 'Boven Digoel',       lat: -6.10, lng: 140.10, threat: 'MEDIUM', activity: 'Training',            lastSeen: '3h ago' },
  { id: 'TRP-006', unit: 'Foxtrot Cell',   size: 12, location: 'Mappi',              lat: -6.50, lng: 139.30, threat: 'LOW',    activity: 'Reconnaissance',      lastSeen: '1h ago' },
];

const MOCK_ENEMY_EQUIPMENT = [
  { id: 'EQP-001', type: 'Light Vehicle',  model: 'Toyota Hilux', count: 8,  location: 'Nduga',              lat: -4.50, lng: 138.50, status: 'OPERATIONAL' },
  { id: 'EQP-002', type: 'Heavy Truck',    model: 'Isuzu',        count: 3,  location: 'Pegunungan Bintang', lat: -4.50, lng: 140.50, status: 'OPERATIONAL' },
  { id: 'EQP-003', type: 'Motorcycle',     model: 'Various',      count: 22, location: 'Yahukimo',           lat: -4.80, lng: 139.50, status: 'OPERATIONAL' },
  { id: 'EQP-004', type: 'Diesel Generator', model: 'Cummins',    count: 2,  location: 'Asmat',              lat: -5.50, lng: 138.50, status: 'OPERATIONAL' },
];

const MOCK_ENEMY_FACILITIES = [
  { id: 'FAC-001', name: 'Nduga Camp',         type: 'MILITARY_CAMP',     location: 'Nduga',              lat: -4.50, lng: 138.50, size: 'LARGE',  capacity: 80, status: 'ACTIVE' },
  { id: 'FAC-002', name: 'Yahukimo Depot',     type: 'LOGISTICS_DEPOT',   location: 'Yahukimo',           lat: -4.80, lng: 139.50, size: 'MEDIUM', capacity: 40, status: 'ACTIVE' },
  { id: 'FAC-003', name: 'Bintang Bunker',     type: 'BUNKER',            location: 'Pegunungan Bintang', lat: -4.50, lng: 140.50, size: 'SMALL',  capacity: 15, status: 'ACTIVE' },
  { id: 'FAC-004', name: 'Asmat Landing Strip', type: 'AIRSTRIP',         location: 'Asmat',              lat: -5.50, lng: 138.50, size: 'SMALL',  capacity: 5,  status: 'DAMAGED' },
];

app.get('/api/enemy/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalPersonnel: MOCK_ENEMY_TROOPS.reduce((s,t)=>s+t.size,0),
      totalWeapons: MOCK_ENEMY_WEAPONS.reduce((s,w)=>s+w.count,0),
      totalEquipment: MOCK_ENEMY_EQUIPMENT.reduce((s,e)=>s+e.count,0),
      totalFacilities: MOCK_ENEMY_FACILITIES.length,
      highThreatCells: MOCK_ENEMY_TROOPS.filter(t => t.threat === 'HIGH').length,
      lastUpdate: new Date().toISOString()
    }
  });
});

app.get('/api/enemy/weapons',   (req, res) => res.json({ success: true, data: MOCK_ENEMY_WEAPONS,   count: MOCK_ENEMY_WEAPONS.length }));
app.get('/api/enemy/troops',    (req, res) => res.json({ success: true, data: MOCK_ENEMY_TROOPS,    count: MOCK_ENEMY_TROOPS.length }));
app.get('/api/enemy/equipment', (req, res) => res.json({ success: true, data: MOCK_ENEMY_EQUIPMENT, count: MOCK_ENEMY_EQUIPMENT.length }));
app.get('/api/enemy/facilities',(req, res) => res.json({ success: true, data: MOCK_ENEMY_FACILITIES,count: MOCK_ENEMY_FACILITIES.length }));

app.get('/api/enemy', (req, res) => {
  res.json({
    success: true,
    data: {
      overview: {
        totalPersonnel: MOCK_ENEMY_TROOPS.reduce((s,t)=>s+t.size,0),
        totalWeapons:   MOCK_ENEMY_WEAPONS.reduce((s,w)=>s+w.count,0),
        totalEquipment: MOCK_ENEMY_EQUIPMENT.reduce((s,e)=>s+e.count,0),
        totalFacilities: MOCK_ENEMY_FACILITIES.length
      },
      weapons:    MOCK_ENEMY_WEAPONS,
      troops:     MOCK_ENEMY_TROOPS,
      equipment:  MOCK_ENEMY_EQUIPMENT,
      facilities: MOCK_ENEMY_FACILITIES
    }
  });
});


// ============ SCENARIO SIMULATION (What-If Analysis) ============
const SCENARIO_TYPES = {
  AIRSTRIKE: {
    name: 'Airstrike',
    icon: 'BOMB',
    description: 'Precision strike on hostile position',
    baseCasualtyRate: 0.65,
    collateralRisk: 0.25,
    duration: '15-30 min',
    resources: '2x F-16, 1x AWACS',
    successRate: 0.78
  },
  DRONE_RECON: {
    name: 'Drone Reconnaissance',
    icon: 'DRONE',
    description: 'ISR mission over target area',
    baseCasualtyRate: 0.0,
    collateralRisk: 0.02,
    duration: '1-2 hours',
    resources: '2x MQ-9 Reaper',
    successRate: 0.95
  },
  GROUND_ASSAULT: {
    name: 'Ground Assault',
    icon: 'SOLDIER',
    description: 'Infantry assault with armor support',
    baseCasualtyRate: 0.55,
    collateralRisk: 0.35,
    duration: '2-6 hours',
    resources: '1x Battalion, 4x APC, 2x Tank',
    successRate: 0.68
  },
  BLOCKADE: {
    name: 'Logistics Blockade',
    icon: 'SHIELD',
    description: 'Cut supply lines to enemy',
    baseCasualtyRate: 0.15,
    collateralRisk: 0.10,
    duration: '24-72 hours',
    resources: '2x Frigate, 3x Helicopter',
    successRate: 0.82
  },
  EVACUATION: {
    name: 'Civilian Evacuation',
    icon: 'HEART',
    description: 'Extract civilians from combat zone',
    baseCasualtyRate: 0.05,
    collateralRisk: 0.15,
    duration: '3-8 hours',
    resources: '4x Helicopter, 2x Transport',
    successRate: 0.88
  },
  CYBER_ATTACK: {
    name: 'Cyber Attack',
    icon: 'ZAP',
    description: 'Disable enemy communications',
    baseCasualtyRate: 0.05,
    collateralRisk: 0.08,
    duration: '1-4 hours',
    resources: 'Cyber Command Team',
    successRate: 0.72
  }
};

app.get('/api/scenario/types', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(SCENARIO_TYPES).map(([id, t]) => ({ id, ...t }))
  });
});

app.post('/api/scenario/simulate', express.json(), (req, res) => {
  const { scenarioType, targetId, targetType, targetSize } = req.body || {};
  
  if (!scenarioType || !SCENARIO_TYPES[scenarioType]) {
    return res.status(400).json({ success: false, error: 'Invalid scenarioType' });
  }
  
  const scenario = SCENARIO_TYPES[scenarioType];
  const size = targetSize || 50;
  const targetLabel = targetId || 'Unknown Target';
  
  // Hitung estimasi berdasarkan skenario + target
  const friendlyCasualty = Math.round(size * 0.05 * (1 - scenario.successRate) * 10) / 10;
  const enemyCasualty = Math.round(size * scenario.baseCasualtyRate);
  const collateralDamage = Math.round(size * scenario.collateralRisk * 100) / 100;
  const successChance = Math.round((scenario.successRate * 100) + (Math.random() * 10 - 5));
  const duration = scenario.duration;
  const resourcesUsed = scenario.resources;
  
  // Risk assessment
  const risk = collateralDamage > 10 ? 'HIGH' : collateralDamage > 5 ? 'MEDIUM' : 'LOW';
  
  res.json({
    success: true,
    data: {
      scenario: { id: scenarioType, ...scenario },
      target: { id: targetId, type: targetType, size },
      simulation: {
        friendlyCasualty,
        enemyCasualty,
        collateralDamage,
        successChance: Math.min(99, Math.max(50, successChance)),
        duration,
        resourcesUsed,
        risk,
        recommendation: risk === 'HIGH' 
          ? '⚠️ HIGH collateral risk — consider alternative approach' 
          : risk === 'MEDIUM' 
            ? '⚡ MEDIUM risk — proceed with caution' 
            : '✅ LOW risk — recommended action',
        timestamp: new Date().toISOString()
      }
    }
  });
});

app.get('/api/scenario/history', (req, res) => {
  // Mock history
  res.json({
    success: true,
    data: [
      { id: 'SIM-001', type: 'AIRSTRIKE',     target: 'Nduga Camp',       date: '2026-11-03T10:15:00Z', result: 'COMPLETED', successChance: 82 },
      { id: 'SIM-002', type: 'DRONE_RECON',   target: 'Yahukimo Depot',   date: '2026-11-03T09:30:00Z', result: 'COMPLETED', successChance: 95 },
      { id: 'SIM-003', type: 'BLOCKADE',      target: 'Bintang Bunker',   date: '2026-11-02T22:00:00Z', result: 'ONGOING',   successChance: 78 },
    ]
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================');
  console.log('AEGIS GEOINT BACKEND');
  console.log('==========================================');
  console.log('API: http://0.0.0.0:' + PORT);
  console.log('WebSocket: ws://localhost:' + PORT);
  console.log('Telemetry: Connected');
  console.log('==========================================');
});





