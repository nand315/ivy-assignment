import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Home, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { fetchListings } from '../services/api';

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

const PROPERTY_TYPES = [
  'All Types',
  'apartment',
  'villa',
  'independent house',
  'plot',
  'builder floor'
];

const FURNISHINGS = [
  'All Furnishing',
  'unfurnished',
  'semi-furnished',
  'fully-furnished'
];

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 24;

  // Filters State
  const [search, setSearch] = useState('');
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [liveOnly, setLiveOnly] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchListings({
        locality: locality && locality !== 'All Localities' ? locality : undefined,
        bhk: bhk ? parseInt(bhk, 10) : undefined,
        property_type: propertyType && propertyType !== 'All Types' ? propertyType : undefined,
        furnishing: furnishing && furnishing !== 'All Furnishing' ? furnishing : undefined,
        min_price: minPrice ? parseInt(minPrice, 10) : undefined,
        max_price: maxPrice ? parseInt(maxPrice, 10) : undefined,
        is_live: liveOnly ? true : undefined,
        search: search ? search : undefined,
        sort_by: sortBy || undefined,
        order: order || undefined,
        limit,
        offset
      });

      let items = data.results || [];

      // Robust Client-Side Filtering Fallback in case server ignored parameters
      if (liveOnly) {
        items = items.filter(l => Boolean(l.is_live));
      }
      if (locality && locality !== 'All Localities') {
        items = items.filter(l => (l.locality || '').toLowerCase() === locality.toLowerCase());
      }
      if (bhk) {
        items = items.filter(l => l.bedroom === parseInt(bhk, 10));
      }
      if (propertyType && propertyType !== 'All Types') {
        items = items.filter(l => (l.property_type || '').toLowerCase() === propertyType.toLowerCase());
      }
      if (furnishing && furnishing !== 'All Furnishing') {
        items = items.filter(l => (l.furnishing || '').toLowerCase() === furnishing.toLowerCase());
      }
      if (minPrice) {
        items = items.filter(l => l.price !== null && l.price >= parseInt(minPrice, 10));
      }
      if (maxPrice) {
        items = items.filter(l => l.price !== null && l.price <= parseInt(maxPrice, 10));
      }
      if (search) {
        const q = search.toLowerCase().trim();
        items = items.filter(l => 
          (l.apartment_name || '').toLowerCase().includes(q) ||
          (l.locality || '').toLowerCase().includes(q) ||
          (l.listing_id || '').toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q)
        );
      }

      // Client-side Sorting Fallback
      if (sortBy === 'price') {
        items.sort((a, b) => order === 'desc' ? (b.price || 0) - (a.price || 0) : (a.price || 0) - (b.price || 0));
      } else if (sortBy === 'carpet_area') {
        items.sort((a, b) => order === 'desc' ? (b.carpet_area || 0) - (a.carpet_area || 0) : (a.carpet_area || 0) - (b.carpet_area || 0));
      } else if (sortBy === 'posted_at') {
        items.sort((a, b) => order === 'desc' ? (b.posted_at || '').localeCompare(a.posted_at || '') : (a.posted_at || '').localeCompare(b.posted_at || ''));
      }

      setListings(items);
      setTotal(data.total || items.length);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [offset, locality, bhk, propertyType, furnishing, liveOnly, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    loadData();
  };

  const resetFilters = () => {
    setSearch('');
    setLocality('');
    setBhk('');
    setPropertyType('');
    setFurnishing('');
    setLiveOnly(true);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    setOrder('asc');
    setOffset(0);
  };

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 20px' }}>
      {/* Page Title & Search Bar */}
      <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore Verified Sale Listings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Discover prime real estate in Hyderabad with complete specifications and verified pricing
          </p>
        </div>

        {/* Search & Top Action Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by apartment name, locality, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: 14, top: 13 }} />
          </div>
          <button type="submit" className="btn-primary">
            <Search size={16} />
            <span>Search</span>
          </button>
          <button type="button" onClick={resetFilters} className="btn-secondary">
            <RefreshCw size={15} />
            <span>Reset Filters</span>
          </button>
        </form>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14,
        alignItems: 'center'
      }}>
        {/* Locality */}
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

        {/* Bedroom (BHK) */}
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
            <option value="5" style={{ background: '#1e293b' }}>5+ BHK</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Property Type
          </label>
          <select
            className="input-field"
            value={propertyType}
            onChange={(e) => { setPropertyType(e.target.value); setOffset(0); }}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          >
            {PROPERTY_TYPES.map(pt => (
              <option key={pt} value={pt === 'All Types' ? '' : pt} style={{ background: '#1e293b', textTransform: 'capitalize' }}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        {/* Furnishing */}
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
            {FURNISHINGS.map(f => (
              <option key={f} value={f === 'All Furnishing' ? '' : f} style={{ background: '#1e293b', textTransform: 'capitalize' }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Sort Order
          </label>
          <select
            className="input-field"
            value={`${sortBy}_${order}`}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSortBy('');
                setOrder('asc');
              } else {
                const [s, o] = val.split('_');
                setSortBy(s);
                setOrder(o);
              }
              setOffset(0);
            }}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          >
            <option value="" style={{ background: '#1e293b' }}>Default Order</option>
            <option value="price_asc" style={{ background: '#1e293b' }}>Price: Low to High</option>
            <option value="price_desc" style={{ background: '#1e293b' }}>Price: High to Low</option>
            <option value="carpet_area_desc" style={{ background: '#1e293b' }}>Area: Largest First</option>
            <option value="posted_at_desc" style={{ background: '#1e293b' }}>Recently Posted</option>
          </select>
        </div>

        {/* Live Only Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
            Inventory Status
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={liveOnly}
              onChange={(e) => { setLiveOnly(e.target.checked); setOffset(0); }}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ color: liveOnly ? '#34d399' : 'var(--text-muted)' }}>
              {liveOnly ? 'Active Only' : 'All (Inc. Inactive)'}
            </span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: '#fff' }}>{listings.length}</strong> listings (Catalog Total: {total})
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
          minHeight: 400
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: 380, opacity: 0.5 }}></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--warning)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>No Listings Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
            Try adjusting your search criteria or reset filters to see available properties.
          </p>
          <button onClick={resetFilters} className="btn-primary">
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {listings.map((item) => (
            <ListingCard key={item.listing_id} listing={item} onFavouriteChange={loadData} />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
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
          <span>Previous Page</span>
        </button>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 8px' }}>
          Page {Math.floor(offset / limit) + 1}
        </span>
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={listings.length < limit || loading}
          className="btn-secondary"
          style={{ opacity: listings.length < limit ? 0.4 : 1 }}
        >
          <span>Next Page</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
