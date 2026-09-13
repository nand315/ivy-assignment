import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState(import.meta.env.VITE_DEMO_PASSWORD || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const demoAccounts = [
    { email: 'demo1@ivy.homes', label: 'Demo User 1' },
    { email: 'demo2@ivy.homes', label: 'Demo User 2' },
    { email: 'demo3@ivy.homes', label: 'Demo User 3' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginUser(email, password);
      navigate('/listings');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(import.meta.env.VITE_DEMO_PASSWORD || '');
    setError(null);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div className="glass-panel" style={{
        maxWidth: 460,
        width: '100%',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)'
          }}>
            <Building2 size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Sign in with your verified Ivy Homes credentials
            </p>
          </div>
        </div>

        {/* Demo Accounts Quick Select */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: 14,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>Select Demo Account</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => selectDemo(acc.email)}
                style={{
                  padding: '8px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: email === acc.email ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${email === acc.email ? 'var(--primary)' : 'transparent'}`,
                  color: email === acc.email ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e7eb', marginBottom: 6, display: 'block' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="input-field"
                style={{ paddingLeft: 38 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo1@ivy.homes"
              />
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e7eb', marginBottom: 6, display: 'block' }}>
              Account Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="input-field"
                style={{ paddingLeft: 38 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              justifyContent: 'center',
              padding: '12px',
              fontSize: '1rem',
              marginTop: 6
            }}
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Ivy Homes</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Scoped City: <strong>Hyderabad</strong> • Token Duration: <strong>15m (Auto-Refreshed)</strong>
        </div>
      </div>
    </div>
  );
}
