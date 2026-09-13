import React, { useState, useEffect } from 'react';
import { Key, Search, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import RentalCard from '../components/RentalCard';
import { fetchRentals } from '../services/api';

const LOCALITIES = [
  'All Localities',
  'madhapur',
  'gachibowli',
  'banjara hills',
  'jubilee hills',
  'kukatpally',
  'kondapur',
  'manikonda',
  'miyapur',
  'kompally',
  'nallagandla'
];

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 24;

  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchRentals({
        locality: locality && locality !== 'All Localities' ? locality : undefined,
        bhk: bhk ? parseInt(bhk, 10) : undefined,
        furnishing: furnishing && furnishing !== 'All Furnishing' ? furnishing : undefined,
        sort_by: sortBy || undefined,
        order: order || undefined,
        limit,
        offset
      });
      setRentals(data.results || []);
      setTotal(data.total || (data.results || []).length);
    } catch (err) {
      console.error('Failed to fetch rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [offset, locality, bhk, furnishing, sortBy, order]);

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Browse Rental Properties</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Explore residential rentals with verified monthly prices, security deposits, and amenities in Hyderabad
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        alignItems: 'center'
      }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Locality
          </label>
          <select
            className="input-field"
            value={locality}
            onChange={(e) => { setLocality(e.target.value); setOffset(0); }}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          >
            {LOCALITIES.map(l => (
              <option key={l} value={l === 'All Localities' ? '' : l} style={{ background: '#1e293b' }}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Bedrooms
          </label>
          <select
            className="input-field"
            value={bhk}
            onChange={(e) => { setBhk(e.target.value); setOffset(0); }}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          >
            <option value="" style={{ background: '#1e293b' }}>All Bedrooms</option>
            <option value="1" style={{ background: '#1e293b' }}>1 BHK</option>
            <option value="2" style={{ background: '#1e293b' }}>2 BHK</option>
            <option value="3" style={{ background: '#1e293b' }}>3 BHK</option>
            <option value="4" style={{ background: '#1e293b' }}>4 BHK</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Furnishing
          </label>
          <select
            className="input-field"
            value={furnishing}
            onChange={(e) => { setFurnishing(e.target.value); setOffset(0); }}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          >
            <option value="" style={{ background: '#1e293b' }}>All Furnishing</option>
            <option value="unfurnished" style={{ background: '#1e293b' }}>Unfurnished</option>
            <option value="semi-furnished" style={{ background: '#1e293b' }}>Semi-Furnished</option>
            <option value="fully-furnished" style={{ background: '#1e293b' }}>Fully-Furnished</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Sort by Rent
          </label>
          <select
            className="input-field"
            value={`${sortBy}_${order}`}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) { setSortBy(''); setOrder('asc'); }
              else { const [s, o] = val.split('_'); setSortBy(s); setOrder(o); }
              setOffset(0);
            }}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          >
            <option value="" style={{ background: '#1e293b' }}>Default</option>
            <option value="price_asc" style={{ background: '#1e293b' }}>Rent: Low to High</option>
            <option value="price_desc" style={{ background: '#1e293b' }}>Rent: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
          minHeight: 400
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: 320, opacity: 0.5 }}></div>
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--warning)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>No Rental Properties Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {rentals.map((r) => (
            <RentalCard key={r.listing_id} rental={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{
        marginTop: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}>
        <button
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0 || loading}
          className="btn-secondary"
          style={{ opacity: offset === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 8px' }}>
          Page {Math.floor(offset / limit) + 1}
        </span>
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={rentals.length < limit || loading}
          className="btn-secondary"
          style={{ opacity: rentals.length < limit ? 0.4 : 1 }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
