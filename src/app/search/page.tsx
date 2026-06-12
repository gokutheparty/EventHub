'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

interface Vendor {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  region: string;
  isVerified: boolean;
  verificationLevel: string;
  isFeatured: boolean;
  categories: string[];
  thumbnail: string | null;
  reputation: {
    averageRating: number;
    reviewVolume: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function SearchContent() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch Favorites of currently logged in user
  const loadFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.map((fav: any) => fav.vendorId));
      }
    } catch (e) {
      console.error('Error fetching favorites:', e);
    }
  };

  const toggleFavorite = async (vendorId: string) => {
    const isFav = favorites.includes(vendorId);
    try {
      if (isFav) {
        const res = await fetch(`/api/favorites?vendorId=${vendorId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setFavorites(prev => prev.filter(id => id !== vendorId));
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to remove from favorites');
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId }),
        });
        if (res.ok) {
          setFavorites(prev => [...prev, vendorId]);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to add to favorites. Please log in first.');
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Initial fetch from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(params.get('category') || '');
      setSelectedCity(params.get('city') || '');
      setSearchQuery(params.get('q') || '');
    }

    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    }
    loadCategories();
    loadFavorites();
  }, []);

  // Fetch listings dynamically when filters change
  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedCity) params.set('city', selectedCity);
        if (searchQuery) params.set('q', searchQuery);
        if (verifiedOnly) params.set('verified', 'true');
        if (minRating) params.set('rating', minRating);

        const res = await fetch(`/api/vendors?${params.toString()}`);
        const data = await res.json();
        setVendors(data);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search input changes slightly in practice, direct for demonstration
    fetchListings();
  }, [selectedCategory, selectedCity, searchQuery, verifiedOnly, minRating]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setSearchQuery('');
    setVerifiedOnly(false);
    setMinRating('');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%', flex: 1 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px' }}>Browse Service Providers</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 9fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Filters Sidebar */}
        <aside className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Filter Listings</h3>
            <button 
              onClick={resetFilters} 
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset All
            </button>
          </div>

          {/* Search text input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Keywords</label>
            <input 
              type="text" 
              placeholder="e.g. Kempinski, MC" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* City / Location input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>City Location</label>
            <input 
              type="text" 
              placeholder="e.g. Accra, Kumasi" 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Verified Only Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              id="verifiedCheck"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="verifiedCheck" style={{ fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Verified Vendors Only</label>
          </div>

          {/* Min rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ ★ Outstanding</option>
              <option value="4.0">4.0+ ★ Excellent</option>
              <option value="3.0">3.0+ ★ Good</option>
            </select>
          </div>
        </aside>

        {/* Search Results Grid */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Found {vendors.length} service providers matching parameters
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Filtering listings...</p>
            </div>
          ) : vendors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {vendors.map((vendor) => (
                <div key={vendor.id} className="glass" style={{ 
                  borderRadius: 'var(--radius-lg)', 
                  overflow: 'hidden', 
                  display: 'flex',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  
                  {/* Image side */}
                  <div style={{ 
                    width: '240px', 
                    backgroundColor: 'var(--bg-input)', 
                    backgroundPosition: 'center', 
                    backgroundSize: 'cover', 
                    backgroundImage: vendor.thumbnail ? `url(${vendor.thumbnail})` : 'none',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    {vendor.isFeatured && (
                      <span className="badge badge-premium" style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '0.65rem' }}>Featured</span>
                    )}
                  </div>

                  {/* Info details side */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            {vendor.categories.map((c, i) => (
                              <span key={i} style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c}</span>
                            ))}
                          </div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{vendor.name}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            onClick={() => toggleFavorite(vendor.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: favorites.includes(vendor.id) ? 'var(--accent-gold)' : 'var(--text-muted)',
                              fontSize: '1.4rem',
                              cursor: 'pointer',
                              padding: 0,
                              lineHeight: 1,
                              transition: 'var(--transition-fast)'
                            }}
                            title={favorites.includes(vendor.id) ? 'Remove from Favorites' : 'Save to Favorites'}
                          >
                            ★
                          </button>
                          {vendor.isVerified && (
                            <span className={`badge badge-${vendor.verificationLevel?.toLowerCase() || 'basic'}`}>
                              {vendor.verificationLevel}
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>
                        📍 {vendor.location} {vendor.city ? `• ${vendor.city}` : ''}
                      </p>
                      
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                        {vendor.description || 'No description provided.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>★</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{vendor.reputation.averageRating.toFixed(1)}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({vendor.reputation.reviewVolume} reviews)</span>
                      </div>
                      <Link href={`/vendors/${vendor.id}`} className="glow-btn" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#fff' }}>
                        View Profile
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No matches found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Try adjusting your keywords, category settings, or cities.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
