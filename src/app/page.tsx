'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Vendor {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
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

export default function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(catData.slice(0, 8)); // Grab top 8 for landing grid

        const vendorRes = await fetch('/api/vendors');
        const vendorData = await vendorRes.json();
        setFeatured(vendorData.slice(0, 3)); // Grab top 3 featured
      } catch (e) {
        console.error('Error loading landing page data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('q', searchQuery);
    if (searchCity) queryParams.set('city', searchCity);
    window.location.href = `/search?${queryParams.toString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* Hero Search Section */}
      <section style={{ 
        position: 'relative', 
        padding: '100px 20px', 
        textAlign: 'center', 
        background: 'radial-gradient(circle at top, rgba(99,102,241,0.15) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-premium" style={{ marginBottom: '16px', animation: 'pulseGlow 2s infinite' }}>
            Event Planning Redefined
          </span>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 800, 
            letterSpacing: '-0.03em', 
            marginBottom: '20px',
            fontFamily: 'var(--font-heading)'
          }}>
            Discover & Book <br />
            <span style={{ background: 'linear-gradient(to right, var(--accent-gold), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Verified Event Vendors
            </span>{' '}
            in Africa
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            EventHub connects you with certified event centers, planners, decorators, caterers, and entertainers with transparent reviews and reputation scores.
          </p>

          {/* Search Box Card */}
          <form onSubmit={handleSearchSubmit} className="glass" style={{ 
            display: 'grid', 
            gridTemplateColumns: '5fr 3fr 2fr', 
            gap: '12px', 
            padding: '12px', 
            borderRadius: 'var(--radius-lg)', 
            maxWidth: '720px', 
            margin: '0 auto',
            boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
          }}>
            <input 
              type="text" 
              placeholder="What service are you looking for? (e.g. Wedding Hall)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <input 
              type="text" 
              placeholder="City (e.g. Accra, Kumasi)" 
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="glow-btn" style={{ 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.95rem', 
              color: '#fff' 
            }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Dynamic Categories Grid */}
      <section style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Browse Categories</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Explore dynamic event categories of top-tier professional agencies.</p>
          </div>
          <Link href="/search" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>
            See All Categories &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass" style={{ height: '140px', borderRadius: 'var(--radius-md)', opacity: 0.5 }} />
            ))
          ) : (
            categories.map((cat) => (
              <Link 
                href={`/search?category=${cat.slug}`} 
                key={cat.id} 
                className="glass" 
                style={{ 
                  padding: '24px', 
                  borderRadius: 'var(--radius-md)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  height: '150px',
                  transition: 'var(--transition-smooth)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{cat.description}</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Explore listings &rarr;</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Verified Listings */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Featured Verified Businesses</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Top reputation performers vetted by EventHub admins. Enjoy seamless communications and verified expertise.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {!loading && featured.map((vendor) => (
              <div key={vendor.id} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Image header */}
                <div style={{ 
                  height: '220px', 
                  backgroundColor: 'var(--bg-input)', 
                  backgroundPosition: 'center', 
                  backgroundSize: 'cover', 
                  backgroundImage: vendor.thumbnail ? `url(${vendor.thumbnail})` : 'none',
                  position: 'relative'
                }}>
                  {/* Featured Placement badge */}
                  {vendor.isFeatured && (
                    <span className="badge badge-premium" style={{ position: 'absolute', top: '16px', left: '16px' }}>Featured</span>
                  )}
                  {/* Verification badge */}
                  <span className={`badge badge-${vendor.verificationLevel?.toLowerCase() || 'basic'}`} style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    {vendor.verificationLevel}
                  </span>
                </div>

                {/* Details body */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {vendor.categories.map((c, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c}</span>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{vendor.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {vendor.description || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>★</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{vendor.reputation.averageRating.toFixed(1)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({vendor.reputation.reviewVolume} reviews)</span>
                    </div>
                    <Link href={`/vendors/${vendor.id}`} className="glow-btn" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#fff' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demand Marketplace Promo CTA */}
      <section style={{ maxWidth: '900px', margin: '100px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '60px 40px', background: 'linear-gradient(135deg, rgba(22,25,37,0.8) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Have a Specific Event Request?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            Create a detailed request describing your event date, budget range, and category. Vendors matching your requirements will compete and submit personalized service proposals!
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/requests/new" className="glow-btn" style={{ padding: '14px 28px', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', color: '#fff' }}>
              Create Event Request
            </Link>
            <Link href="/signup?role=VENDOR" style={{ border: '1px solid var(--border-color)', padding: '14px 28px', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'inline-block', transition: 'var(--transition-fast)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              List Your Services
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
