// D:\AegisGeoInt\frontend\src\App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Drone, 
  Target, 
  Brain,
  Crosshair,
  Map as MapIcon,
  BarChart3,
  Swords,
  Camera,
  Menu,
  X
} from 'lucide-react';
import logoUrl from '/logo.png';

import Dashboard from './pages/Dashboard';
import DroneFleet from './pages/DroneFleet';
import MissionControl from './pages/MissionControl';
import IntelligenceCenter from './pages/IntelligenceCenter';
import EnemyIntel from './pages/EnemyIntel';
import ThreatMap from './pages/ThreatMap';
import Analytics from './pages/Analytics';
import ScenarioSimulator from './pages/ScenarioSimulator';
import AIDetection from './pages/AIDetection';
import TacticalAnalysis from './pages/TacticalAnalysis';

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/fleet', icon: <Drone size={20} />, label: 'Drone Fleet' },
    { path: '/missions', icon: <Target size={20} />, label: 'Mission Control' },
    { path: '/intel', icon: <Brain size={20} />, label: 'Intelligence' },
    { path: '/enemy', icon: <Crosshair size={20} />, label: 'Enemy Intel' },
    { path: '/threat-map', icon: <MapIcon size={20} />, label: 'Threat Map' },
    { path: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/scenarios', icon: <Swords size={20} />, label: 'Scenarios' },
    { path: '/ai-detection', icon: <Camera size={20} />, label: 'AI Detection' },
    { path: '/tactical', icon: <Crosshair size={20} />, label: 'Tactical Analysis' },
  ];

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <img src={logoUrl} alt="AegisGEOINT" className="nav-logo" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
          </div>

          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="nav-footer">
            <div className="nav-version">v2.0.0</div>
            <div className="nav-status">
              <span className="status-dot"></span>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </nav>

      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-brand">
              <img src={logoUrl} alt="AegisGEOINT" style={{ height: '40px', width: 'auto' }} />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fleet" element={<DroneFleet />} />
          <Route path="/missions" element={<MissionControl />} />
          <Route path="/intel" element={<IntelligenceCenter />} />
          <Route path="/enemy" element={<EnemyIntel />} />
          <Route path="/threat-map" element={<ThreatMap />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/scenarios" element={<ScenarioSimulator />} />
          <Route path="/ai-detection" element={<AIDetection />} />
          <Route path="/tactical" element={<TacticalAnalysis />} />
        </Routes>
      </main>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0e1a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e8f0; }
        .app { display: flex; min-height: 100vh; background: #0a0e1a; }
        .app-nav { width: 240px; background: rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.06); position: fixed; height: 100vh; overflow-y: auto; z-index: 100; backdrop-filter: blur(10px); }
        .app-nav::-webkit-scrollbar { width: 3px; }
        .app-nav::-webkit-scrollbar-track { background: transparent; }
        .app-nav::-webkit-scrollbar-thumb { background: rgba(79,195,247,0.3); border-radius: 2px; }
        .nav-container { padding: 20px 16px; display: flex; flex-direction: column; height: 100%; }
        .nav-brand { display: flex; align-items: center; justify-content: center; padding: 8px 8px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
        .nav-logo { height: 50px; width: auto; object-fit: contain; }
        .nav-links { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: #8899aa; text-decoration: none; border-radius: 8px; transition: all 0.3s ease; font-size: 14px; font-weight: 500; }
        .nav-link:hover { background: rgba(255,255,255,0.05); color: #e0e8f0; }
        .nav-link.active { background: rgba(79,195,247,0.1); color: #4fc3f7; box-shadow: inset 3px 0 0 #4fc3f7; }
        .nav-link svg { flex-shrink: 0; }
        .nav-link span { white-space: nowrap; }
        .nav-footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-top: 8px; }
        .nav-version { font-size: 11px; color: #8899aa; text-align: center; margin-bottom: 4px; }
        .nav-status { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #4caf50; }
        .status-dot { width: 6px; height: 6px; background: #4caf50; border-radius: 50%; animation: pulse-dot 2s infinite; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
        .mobile-menu-toggle { display: none; position: fixed; top: 16px; left: 16px; z-index: 200; background: rgba(26,31,51,0.9); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #e0e8f0; padding: 8px; cursor: pointer; backdrop-filter: blur(10px); }
        .mobile-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 150; backdrop-filter: blur(4px); }
        .mobile-menu { position: fixed; top: 0; left: 0; width: 280px; height: 100vh; background: rgba(10,14,26,0.98); border-right: 1px solid rgba(255,255,255,0.06); padding: 20px 16px; display: flex; flex-direction: column; gap: 8px; z-index: 160; }
        .mobile-brand { display: flex; align-items: center; justify-content: center; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 12px; }
        .mobile-brand img { height: 40px; width: auto; }
        .mobile-link { display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: #8899aa; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 500; transition: all 0.3s ease; }
        .mobile-link:hover { background: rgba(255,255,255,0.05); color: #e0e8f0; }
        .mobile-link.active { background: rgba(79,195,247,0.1); color: #4fc3f7; }
        .main-content { margin-left: 240px; flex: 1; min-height: 100vh; background: #0a0e1a; }
        @media (max-width: 768px) {
          .app-nav { display: none; }
          .mobile-menu-toggle { display: block; }
          .mobile-overlay { display: block; }
          .main-content { margin-left: 0; }
        }
        @media (min-width: 769px) {
          .mobile-menu-toggle, .mobile-overlay, .mobile-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

export default AppWrapper;




