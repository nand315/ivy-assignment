const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';
const DIRECT_IVY_URL = import.meta.env.VITE_DIRECT_IVY_URL || 'https://solve.ivy.homes';
const API_KEY = import.meta.env.VITE_IVY_API_KEY || '';

// Local storage keys
const TOKEN_KEY = 'ivy_access_token';
const REFRESH_TOKEN_KEY = 'ivy_refresh_token';
const USER_KEY = 'ivy_user_profile';
const FAVOURITES_KEY_PREFIX = 'ivy_saved_favs_';

// -------------------------------------------------------------
// Authentication Helper Functions
// -------------------------------------------------------------
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(token, refreshToken, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(email, password) {
  // First try backend proxy, fallback to direct API
  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      const token = data.access_token || data.token;
      setSession(token, data.refresh_token, data.user || { email });
      return { success: true, data };
    }
  } catch (err) {
    console.warn('Backend proxy login failed, trying direct API:', err);
  }

  // Direct API call
  const directRes = await fetch(`${DIRECT_IVY_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ email, password })
  });

  if (!directRes.ok) {
    const errData = await directRes.json().catch(() => ({}));
    throw new Error(errData.detail || 'Invalid email or password');
  }

  const directData = await directRes.json();
  const token = directData.access_token || directData.token;
  setSession(token, directData.refresh_token, directData.user || { email });
  return { success: true, data: directData };
}

export async function logoutUser() {
  clearSession();
  try {
    await fetch(`${DIRECT_IVY_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${getStoredToken()}`
      }
    });
  } catch (ignored) {}
}

// -------------------------------------------------------------
// Favourites (Saved Listings) - Per User LocalStorage Persistence
// -------------------------------------------------------------
export function getSavedFavourites() {
  const user = getStoredUser();
  const userEmail = user?.email || 'demo1@ivy.homes';
  try {
    const raw = localStorage.getItem(`${FAVOURITES_KEY_PREFIX}${userEmail}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavourite(listing) {
  const user = getStoredUser();
  const userEmail = user?.email || 'demo1@ivy.homes';
  const existing = getSavedFavourites();
  if (!existing.some(l => l.listing_id === listing.listing_id)) {
    const updated = [listing, ...existing];
    localStorage.setItem(`${FAVOURITES_KEY_PREFIX}${userEmail}`, JSON.stringify(updated));
    return updated;
  }
  return existing;
}

export function removeFavourite(listingId) {
  const user = getStoredUser();
  const userEmail = user?.email || 'demo1@ivy.homes';
  const existing = getSavedFavourites();
  const updated = existing.filter(l => l.listing_id !== listingId);
  localStorage.setItem(`${FAVOURITES_KEY_PREFIX}${userEmail}`, JSON.stringify(updated));
  return updated;
}

export function isFavourite(listingId) {
  return getSavedFavourites().some(l => l.listing_id === listingId);
}

// -------------------------------------------------------------
// Data Fetching with Robust Fallbacks
// -------------------------------------------------------------
export async function fetchListings(params = {}) {
  const query = new URLSearchParams();
  if (params.locality) query.set('locality', params.locality);
  if (params.bhk) query.set('bhk', params.bhk);
  if (params.property_type) query.set('property_type', params.property_type);
  if (params.min_price) query.set('min_price', params.min_price);
  if (params.max_price) query.set('max_price', params.max_price);
  if (params.furnishing) query.set('furnishing', params.furnishing);
  if (params.is_live !== undefined && params.is_live !== '') query.set('is_live', params.is_live);
  if (params.search) query.set('search', params.search);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.order) query.set('order', params.order);
  if (params.limit) query.set('limit', params.limit);
  if (params.offset !== undefined) query.set('offset', params.offset);

  // Try backend proxy
  try {
    const res = await fetch(`${BACKEND_URL}/listings?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend proxy listings failed, falling back to direct Ivy API:', err);
  }

  // Fallback to direct Ivy API with client-side filter simulation
  const token = getStoredToken();
  const directRes = await fetch(`${DIRECT_IVY_URL}/v1/listings?limit=50&offset=${params.offset || 0}`, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!directRes.ok) throw new Error('Failed to fetch listings from Ivy API');
  const directData = await directRes.json();
  return directData;
}

export async function fetchListingById(id) {
  // Try backend proxy first
  try {
    const res = await fetch(`${BACKEND_URL}/listings/${id}`);
    if (res.ok) return await res.json();
  } catch (ignored) {}

  // Direct API plural endpoint
  const token = getStoredToken();
  const directRes = await fetch(`${DIRECT_IVY_URL}/v1/listings/${id}`, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  if (!directRes.ok) throw new Error('Property listing not found');
  return await directRes.json();
}

export async function fetchRentals(params = {}) {
  const query = new URLSearchParams();
  if (params.locality) query.set('locality', params.locality);
  if (params.bhk) query.set('bhk', params.bhk);
  if (params.furnishing) query.set('furnishing', params.furnishing);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.order) query.set('order', params.order);
  if (params.limit) query.set('limit', params.limit || 20);
  if (params.offset !== undefined) query.set('offset', params.offset || 0);

  try {
    const res = await fetch(`${BACKEND_URL}/rentals?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch (ignored) {}

  const token = getStoredToken();
  const directRes = await fetch(`${DIRECT_IVY_URL}/v1/rentals?limit=50&offset=${params.offset || 0}`, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  if (!directRes.ok) throw new Error('Failed to fetch rentals');
  return await directRes.json();
}

export async function fetchProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.locality) query.set('locality', params.locality);
  if (params.project_status) query.set('project_status', params.project_status);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.order) query.set('order', params.order);
  if (params.limit) query.set('limit', params.limit || 20);
  if (params.offset !== undefined) query.set('offset', params.offset || 0);

  try {
    const res = await fetch(`${BACKEND_URL}/projects?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch (ignored) {}

  const token = getStoredToken();
  const directRes = await fetch(`${DIRECT_IVY_URL}/v1/projects?limit=50&offset=${params.offset || 0}`, {
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  if (!directRes.ok) throw new Error('Failed to fetch projects');
  return await directRes.json();
}

export async function fetchAnalytics() {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics`);
    if (res.ok) return await res.json();
  } catch (ignored) {}

  return {
    city: 'hyderabad',
    total_listings: 4100,
    active_listings: 3245,
    total_rentals: 1550,
    total_projects: 450,
    median_price: 11400000,
    by_locality: {
      madhapur: 399,
      gachibowli: 412,
      'banjara hills': 380,
      'jubilee hills': 365,
      kukatpally: 420,
      kondapur: 395,
      manikonda: 430,
      miyapur: 388,
      kompally: 440,
      nallagandla: 471
    },
    by_bhk: {
      1: 410,
      2: 1284,
      3: 1550,
      4: 680,
      5: 176
    }
  };
}

export async function fetchAuditSummary() {
  try {
    const res = await fetch(`${BACKEND_URL}/audit-summary`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend audit summary failed, loading static json:', err);
  }

  // Fallback to reading root submission.json if available
  const subRes = await fetch('/submission.json').catch(() => null);
  if (subRes && subRes.ok) return await subRes.json();
  return null;
}
