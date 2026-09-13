import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home, ArrowLeft, Trash2 } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { getSavedFavourites, getStoredUser, clearSession } from '../services/api';

export default function SavedListingsPage() {
  const [saved, setSaved] = useState([]);
  const user = getStoredUser();

  const loadSaved = () => {
    setSaved(getSavedFavourites());
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Saved Favourites</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Properties bookmarked for account: <strong style={{ color: '#fff' }}>{user?.email || 'demo1@ivy.homes'}</strong> (Persisted across sessions)
          </p>
        </div>
        <Link to="/listings" className="btn-secondary">
          <Home size={16} />
          <span>Browse More Listings</span>
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Heart size={32} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>No Saved Properties Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
            Click the heart icon on any listing card to bookmark it to your personal shortlist.
          </p>
          <Link to="/listings" className="btn-primary">
            <span>Explore Listings Now</span>
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {saved.map((listing) => (
            <ListingCard key={listing.listing_id} listing={listing} onFavouriteChange={loadSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
