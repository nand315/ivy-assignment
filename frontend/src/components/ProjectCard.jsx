import React from 'react';
import { Building2, MapPin, Calendar, CheckCircle2, ShieldCheck, Home } from 'lucide-react';
import { formatIndianPrice } from './ListingCard';

export function normalizeProjectPrice(val) {
  if (val === null || val === undefined) return 0;
  if (val < 10.0) return Math.round(val * 10000000);
  return Math.round(val * 100000);
}

export default function ProjectCard({ project }) {
  const minInr = normalizeProjectPrice(project.price_min);
  const maxInr = normalizeProjectPrice(project.price_max);

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'transform 0.2s ease'
    }}>
      {/* Top Banner */}
      <div style={{
        padding: 16,
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="badge badge-verified">
            <Building2 size={11} /> {project.developer_name || 'Builder'}
          </span>
          <span className={`badge ${project.project_status === 'ready to move' ? 'badge-live' : 'badge-tag'}`} style={{ textTransform: 'capitalize' }}>
            {project.project_status || 'Under Construction'}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            {formatIndianPrice(minInr)} - {formatIndianPrice(maxInr)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Area: {project.min_area_sqft || 0} - {project.max_area_sqft || 0} sq.ft
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#f9fafb', marginBottom: 4 }}>
            {project.apartment_name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <MapPin size={14} color="var(--primary)" />
            <span style={{ textTransform: 'capitalize' }}>{project.locality || 'Hyderabad'}</span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span>RERA: <strong style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{project.rera_number || 'Registered'}</strong></span>
          </div>
        </div>

        {/* Project Specs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Units</span>
            <strong>{project.total_units || 0}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Towers/Floors</span>
            <strong>{project.total_towers || 1} T / {project.total_floors || 0} F</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Listings</span>
            <strong style={{ color: 'var(--primary)' }}>{project.total_listings || 0} Avail</strong>
          </div>
        </div>

        {/* Possession & Amenities */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>Possession: <strong style={{ color: '#fff' }}>{project.possession_date || 'N/A'}</strong></div>
          {project.amenities && project.amenities.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {project.amenities.slice(0, 4).map((a, idx) => (
                <span key={idx} className="badge-tag" style={{ textTransform: 'capitalize' }}>
                  {a}
                </span>
              ))}
              {project.amenities.length > 4 && (
                <span className="badge-tag">+{project.amenities.length - 4} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
