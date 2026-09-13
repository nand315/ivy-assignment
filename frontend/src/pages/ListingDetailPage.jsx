import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Compass, 
  Layers, 
  CheckCircle2, 
  Heart, 
  ArrowLeft, 
  Phone, 
  User, 
  Calendar, 
  Globe, 
  Share2, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { fetchListingById, fetchListings, isFavourite, saveFavourite, removeFavourite } from '../services/api';
import { formatIndianPrice } from '../components/ListingCard';
import ListingCard from '../components/ListingCard';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favourited, setFavourited] = useState(false);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchListingById(id);
        setListing(data);
        setFavourited(isFavourite(data.listing_id));

        // Load similar listings by locality / bhk
        try {
          const simData = await fetchListings({
            locality: data.locality,
            bhk: data.bedroom,
            is_live: true,
            limit: 4
          });
          const filtered = (simData.results || []).filter(l => l.listing_id !== data.listing_id);
          setSimilarListings(filtered.slice(0, 3));
        } catch (ignored) {}

      } catch (err) {
        setError(err.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  const toggleFav = () => {
    if (!listing) return;
    if (favourited) {
      removeFavourite(listing.listing_id);
      setFavourited(false);
    } else {
      saveFavourite(listing);
      setFavourited(true);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '60px auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }} className="glass-panel">
        <div style={{ padding: 40 }}>
          <AlertTriangle size={48} color="var(--warning)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Property Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
          <Link to="/listings" className="btn-primary">
            <ArrowLeft size={16} />
            <span>Back to Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  const pricePerSqft = (listing.price && listing.carpet_area && listing.carpet_area > 0 && listing.price > 0)
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px 14px' }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Hero Header */}
          <div className="glass-panel" style={{ padding: 28, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {listing.is_live ? (
                  <span className="badge badge-live">
                    <span className="pulse-dot" style={{ width: 6, height: 6 }}></span> Active Listing
                  </span>
                ) : (
                  <span className="badge badge-inactive">Inactive / Expired</span>
                )}
                {listing.is_verified && (
                  <span className="badge badge-verified">
                    <CheckCircle2 size={12} /> Verified by Operations
                  </span>
                )}
                <span className="badge badge-tag" style={{ textTransform: 'capitalize' }}>
                  {listing.property_type}
                </span>
              </div>
              <button
                onClick={toggleFav}
                className="btn-secondary"
                style={{
                  padding: '8px 14px',
                  color: favourited ? '#ef4444' : 'var(--text-main)',
                  borderColor: favourited ? '#ef4444' : 'var(--border-subtle)'
                }}
              >
                <Heart size={16} fill={favourited ? '#ef4444' : 'none'} color={favourited ? '#ef4444' : 'currentColor'} />
                <span>{favourited ? 'Saved' : 'Save Property'}</span>
              </button>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: 8 }}>
              {listing.apartment_name || 'Premium Residence'}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>
              <MapPin size={16} color="var(--primary)" />
              <span style={{ textTransform: 'capitalize' }}>{listing.locality}, Hyderabad</span>
              <span style={{ color: 'var(--text-dim)' }}>•</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>ID: {listing.listing_id}</span>
            </div>

            {/* Price Banner */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'baseline',
              gap: 16
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
                {formatIndianPrice(listing.price)}
              </div>
              {pricePerSqft && (
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  ₹ {pricePerSqft.toLocaleString('en-IN')} per sq.ft
                </div>
              )}
            </div>
          </div>

          {/* Property Overview Specifications */}
          <div className="glass-panel" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 18 }}>Property Specifications</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Bedrooms</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{listing.bedroom || 0} BHK</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Bathrooms</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{listing.bathroom || 0} Baths</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Carpet Area</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{listing.carpet_area || 0} sq.ft</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Super Built-Up Area</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{listing.super_built_up_area || 'N/A'} sq.ft</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Floor Level</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>Floor {listing.floor || 0} of {listing.total_floors || 0}</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Facing Direction</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff', textTransform: 'capitalize' }}>{listing.facing_direction || 'N/A'}</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Covered Parking</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{listing.covered_parking || 0} Slots</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Furnishing</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff', textTransform: 'capitalize' }}>{listing.furnishing || 'Unfurnished'}</strong>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Balconies</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{listing.balcony || 0}</strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Property Description</h2>
            <p style={{ color: '#d1d5db', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {listing.description || 'No description provided by seller.'}
            </p>
          </div>
        </div>

        {/* Right Column: Seller Info & Geo Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Seller Card */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Seller &amp; Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{listing.posted_by_name || 'Verified Seller'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    Type: {listing.posted_by || 'Owner'}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <Phone size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                  {listing.posted_by_contact || '+91 Verified'}
                </span>
              </div>

              {listing.listing_url && (
                <a
                  href={listing.listing_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  <span>View on {listing.website || 'Portal'}</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Location & Metadata */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 14 }}>Location &amp; Project</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Locality: </span>
                <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{listing.locality}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Coordinates: </span>
                <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>
                  {listing.latitude?.toFixed(4)}, {listing.longitude?.toFixed(4)}
                </span>
              </div>
              {listing.project_id && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Project ID: </span>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{listing.project_id}</span>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Posted Date: </span>
                <span style={{ color: '#fff' }}>{listing.posted_at || 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Strip */}
      {similarListings.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>Similar Properties in {listing.locality}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24
          }}>
            {similarListings.map(sim => (
              <ListingCard key={sim.listing_id} listing={sim} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
