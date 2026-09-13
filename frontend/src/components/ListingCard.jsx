import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Compass, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { isFavourite, saveFavourite, removeFavourite } from '../services/api';

export function formatIndianPrice(amount) {
  if (amount === null || amount === undefined) return 'Price on Request';
  if (amount < 0) return `Corrupt (₹ ${amount.toLocaleString('en-IN')})`;
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} L`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export default function ListingCard({ listing, onFavouriteChange }) {
  const [favourited, setFavourited] = useState(isFavourite(listing.listing_id));

  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (favourited) {
      removeFavourite(listing.listing_id);
      setFavourited(false);
    } else {
      saveFavourite(listing);
      setFavourited(true);
    }
    if (onFavouriteChange) onFavouriteChange();
  };

  const isCorrupt = 
    (listing.floor !== null && listing.total_floors !== null && listing.floor > listing.total_floors) ||
    (listing.carpet_area && listing.super_built_up_area && listing.carpet_area > listing.super_built_up_area) ||
    (listing.price !== null && listing.price < 0);

  const isFake = 
    /token\s+amount|booking\s+amount|site\s+visit\s+only\s+after/i.test(listing.description || '') ||
    /below\s+market\s+price,\s*this\s+week\s+only/i.test(listing.description || '') ||
    (listing.price !== null && listing.price > 0 && listing.price < 50000);

  const pricePerSqft = (listing.price && listing.carpet_area && listing.carpet_area > 0 && listing.price > 0)
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      transition: 'transform 0.2s ease, border-color 0.2s ease'
    }}>
      {/* Visual Top Header / Gradient Banner */}
      <div style={{
        height: 140,
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {listing.is_live ? (
              <span className="badge badge-live">
                <span className="pulse-dot" style={{ width: 6, height: 6 }}></span> Active
              </span>
            ) : (
              <span className="badge badge-inactive">Inactive</span>
            )}
            {listing.is_verified && (
              <span className="badge badge-verified">
                <CheckCircle2 size={11} /> Verified
              </span>
            )}
            {isCorrupt && (
              <span className="badge badge-anomaly" title="Corrupt: Physical impossibility detected">
                <AlertTriangle size={11} /> Corrupt Spec
              </span>
            )}
            {isFake && (
              <span className="badge badge-anomaly" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }} title="Flagged: Fake/Lead generation honeypot">
                <AlertTriangle size={11} /> Fraud Flag
              </span>
            )}
          </div>

          {/* Favourite Heart Toggle */}
          <button
            onClick={toggleFav}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: favourited ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.4)',
              border: `1px solid ${favourited ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 2
            }}
            title={favourited ? 'Remove from saved' : 'Save property'}
          >
            <Heart size={16} color={favourited ? '#ef4444' : '#fff'} fill={favourited ? '#ef4444' : 'none'} />
          </button>
        </div>

        {/* Pricing Block */}
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            {formatIndianPrice(listing.price)}
          </div>
          {pricePerSqft && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ₹ {pricePerSqft.toLocaleString('en-IN')}/sq.ft
            </div>
          )}
        </div>
      </div>

      {/* Property Details Body */}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div>
          <Link to={`/listings/${listing.listing_id}`}>
            <h3 style={{
              fontSize: '1.05rem',
              color: '#f9fafb',
              marginBottom: 4,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {listing.apartment_name || 'Independent Residence'}
            </h3>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <MapPin size={14} color="var(--primary)" />
            <span style={{ textTransform: 'capitalize' }}>{listing.locality || 'Hyderabad'}</span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ textTransform: 'capitalize', color: 'var(--accent)' }}>{listing.property_type}</span>
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
            <span>{listing.bedroom || 0} BHK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bath size={15} color="var(--text-muted)" />
            <span>{listing.bathroom || 0} Baths</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Maximize2 size={15} color="var(--text-muted)" />
            <span>{listing.carpet_area || 0} sqft</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={15} color="var(--text-muted)" />
            <span>Floor {listing.floor || 0}/{listing.total_floors || 0}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass size={15} color="var(--text-muted)" />
            <span style={{ textTransform: 'capitalize' }}>{listing.facing_direction || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>
              {listing.furnishing || 'Unfurnished'}
            </span>
          </div>
        </div>

        {/* Seller Info & Action Link */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{listing.listing_id}</span>
          </div>
          <Link
            to={`/listings/${listing.listing_id}`}
            className="btn-glass"
            style={{ padding: '6px 12px' }}
          >
            <span>View Details</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
