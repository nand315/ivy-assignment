import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import RentalsPage from './pages/RentalsPage';
import ProjectsPage from './pages/ProjectsPage';
import SavedListingsPage from './pages/SavedListingsPage';
import InsightsDashboardPage from './pages/InsightsDashboardPage';
import AuditExplorerPage from './pages/AuditExplorerPage';
import { getStoredToken } from './services/api';

function ProtectedRoute({ children }) {
  const token = getStoredToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isLoginPage && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/listings" element={
            <ProtectedRoute>
              <ListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/listings/:id" element={
            <ProtectedRoute>
              <ListingDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/rentals" element={
            <ProtectedRoute>
              <RentalsPage />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path="/saved" element={
            <ProtectedRoute>
              <SavedListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <InsightsDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/audit" element={
            <ProtectedRoute>
              <AuditExplorerPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/listings" replace />} />
          <Route path="*" element={<Navigate to="/listings" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      {!isLoginPage && (
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px 20px',
          background: 'rgba(10, 14, 23, 0.95)',
          marginTop: 'auto'
        }}>
          <div style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            <div>
              © 2026 <strong>Ivy Homes</strong> — Built with Spring Boot (Java 17+) &amp; React
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>City: <strong style={{ color: '#fff' }}>Hyderabad</strong></span>
              <span>Assigned Locality: <strong style={{ color: 'var(--primary)' }}>Madhapur</strong></span>
              <span>Audited Reference: <strong style={{ color: '#38bdf8' }}>2026-09-10T00:00:00+05:30</strong></span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
