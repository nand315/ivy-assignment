import React from 'react';
import { MapPin, Bed, Bath, Maximize2, Layers, Key, ShieldCheck } from 'lucide-react';
import { formatIndianPrice } from './ListingCard';

export default function RentalCard({ rental }) {
  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'transform 0.2s ease'
    }}>
      {/* Top Banner */}
      <div style={{
        height: 125,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="badge badge-live">
            <Key size={11} /> For Rent
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Deposit: {formatIndianPrice(rental.deposit)}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
            ₹ {rental.price?.toLocaleString('en-IN') || 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span>
          </div>
          {rental.maintenance ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              + ₹ {rental.maintenance.toLocaleString('en-IN')} maintenance
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <h3 style={{
            fontSize: '1.05rem',
            color: '#f9fafb',
            marginBottom: 4,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {rental.title || rental.apartment_name || 'Rental Apartment'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <MapPin size={14} color="var(--primary)" />
            <span style={{ textTransform: 'capitalize' }}>{rental.locality || 'Hyderabad'}</span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ textTransform: 'capitalize', color: 'var(--accent)' }}>{rental.furnishing || 'Unfurnished'}</span>
          </div>
        </div>

        {/* Spec Grid */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bed size={15} color="var(--text-muted)" />
            <span>{rental.bedroom || 0} BHK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bath size={15} color="var(--text-muted)" />
            <span>{rental.bathroom || 0} Baths</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Maximize2 size={15} color="var(--text-muted)" />
            <span>{rental.carpet_area || 0} sqft</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={15} color="var(--text-muted)" />
            <span>Floor {rental.floor || 0}/{rental.total_floors || 0}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ textTransform: 'capitalize' }}>Facing: {rental.facing_direction || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>By: {rental.posted_by || 'Owner'}</span>
          </div>
        </div>

        {/* Contact Strip */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <span>Contact: <strong style={{ color: '#fff' }}>{rental.posted_by_name || 'Agent'}</strong></span>
          <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{rental.posted_by_contact || ''}</span>
        </div>
      </div>
    </div>
  );
}
