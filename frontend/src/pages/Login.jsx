// D:\AegisGeoInt\frontend\src\pages\Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import logoUrl from '/logo.png';

const Login = ({ setIsAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // SIMULASI LOGIN (Admin / aegis)
    setTimeout(() => {
      if (username === 'admin' && password === 'aegis') {
        localStorage.setItem('aegis_auth', 'true');
        setIsAuth(true);
        navigate('/');
      } else {
        setError('ACCESS DENIED: Invalid Credentials');
        setLoading(false);
      }
    }, 1000);
  };

  const st = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a', position: 'relative', overflow: 'hidden' },
    gridBg: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,195,247,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 },
    box: { position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', padding: '40px', background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: '12px', boxShadow: '0 0 50px rgba(79,195,247,0.1)' },
    logoContainer: { textAlign: 'center', marginBottom: '30px' },
    logo: { height: '80px', marginBottom: '16px' },
    title: { fontSize: '20px', fontWeight: 700, color: '#4fc3f7', letterSpacing: '2px', margin: '0 0 4px 0' },
    subtitle: { fontSize: '11px', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '11px', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 600 },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '12px', color: '#4fc3f7' },
    input: { width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e0e8f0', fontSize: '14px', outline: 'none', transition: 'border 0.3s' },
    eyeBtn: { position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#8899aa', cursor: 'pointer', padding: 0 },
    submitBtn: { width: '100%', padding: '14px', background: loading ? 'rgba(79,195,247,0.3)' : '#4fc3f7', color: '#0a0e1a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' },
    errorBox: { padding: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
    footer: { textAlign: 'center', marginTop: '24px', fontSize: '10px', color: '#8899aa' }
  };

  return (
    <div style={st.container}>
      <div style={st.gridBg}></div>
      
      <div style={st.box}>
        <div style={st.logoContainer}>
          <img src={logoUrl} alt="Aegis" style={st.logo} />
          <h1 style={st.title}>AEGIS GEOINT</h1>
          <p style={st.subtitle}>Restricted Access Terminal</p>
        </div>

        {error && (
          <div style={st.errorBox}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={st.formGroup}>
            <label style={st.label}>Operator ID</label>
            <div style={st.inputWrapper}>
              <User size={16} style={st.inputIcon} />
              <input 
                type="text" 
                style={st.input} 
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div style={st.formGroup}>
            <label style={st.label}>Passcode</label>
            <div style={st.inputWrapper}>
              <Lock size={16} style={st.inputIcon} />
              <input 
                type={showPass ? "text" : "password"} 
                style={st.input} 
                placeholder="Enter passcode" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button type="button" style={st.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" style={st.submitBtn} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : <><Shield size={18} /> SECURE LOGIN</>}
          </button>
        </form>

        <div style={st.footer}>
          AEGIS SECURE NETWORK • v2.0.0<br/>
          Unauthorized access is strictly prohibited.
        </div>
      </div>
    </div>
  );
};

export default Login;
