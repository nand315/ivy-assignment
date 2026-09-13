import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Home, 
  Key, 
  Heart, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  User, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { getStoredUser, getSavedFavourites, logoutUser } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [favCount, setFavCount] = useState(getSavedFavourites().length);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    const interval = setInterval(() => {
      setFavCount(getSavedFavourites().length);
      setUser(getStoredUser());
    }, 1000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { to: '/listings', label: 'Sale Listings', icon: Home },
    { to: '/rentals', label: 'Rentals', icon: Key },
    { to: '/projects', label: 'Projects', icon: Building2 },
    { to: '/saved', label: 'Saved', icon: Heart, count: favCount },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/audit', label: 'Data Auditor', icon: ShieldCheck, badge: 'Live Audit' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: 1360,
        margin: '0 auto',
        padding: '0 20px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/listings" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Building2 size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
                Ivy<span style={{ color: 'var(--primary)' }}>Homes</span>
              </span>
              <span className="badge badge-live" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Hyderabad</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Property Intelligence &amp; Verified Data</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span>{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 9999,
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    fontWeight: 700
                  }}>
                    {link.count}
                  </span>
                )}
                {link.badge && (
                  <span className="badge badge-verified" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Account Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #1e40af 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={14} color="#fff" />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e7eb' }}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                title="Logout"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <User size={16} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
