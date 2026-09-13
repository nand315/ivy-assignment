import React, { useState, useEffect } from 'react';
import { Building2, Search, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { fetchProjects } from '../services/api';

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 24;

  const [locality, setLocality] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects({
        locality: locality && locality !== 'All Localities' ? locality : undefined,
        project_status: status || undefined,
        sort_by: sortBy || undefined,
        order: order || undefined,
        limit,
        offset
      });
      setProjects(data.results || []);
      setTotal(data.total || (data.results || []).length);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [offset, locality, status, sortBy, order]);

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Builder Projects &amp; Communities</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Explore new developments, upcoming towers, and gated societies in Hyderabad with normalized pricing
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
            Status
          </label>
          <select
            className="input-field"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setOffset(0); }}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          >
            <option value="" style={{ background: '#1e293b' }}>All Statuses</option>
            <option value="under construction" style={{ background: '#1e293b' }}>Under Construction</option>
            <option value="ready to move" style={{ background: '#1e293b' }}>Ready to Move</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Sort by Price
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
            <option value="price_max_desc" style={{ background: '#1e293b' }}>Max Price: High to Low</option>
            <option value="price_min_asc" style={{ background: '#1e293b' }}>Min Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
          minHeight: 400
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: 320, opacity: 0.5 }}></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--warning)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>No Projects Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24
        }}>
          {projects.map((p) => (
            <ProjectCard key={p.project_id} project={p} />
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
          disabled={projects.length < limit || loading}
          className="btn-secondary"
          style={{ opacity: projects.length < limit ? 0.4 : 1 }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
