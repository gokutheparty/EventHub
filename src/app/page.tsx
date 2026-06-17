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

const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505232458627-a720f795f68e?auto=format&fit=crop&w=1600&q=80"
];

const getBentoClassAndStyle = (slug: string) => {
  switch (slug) {
    case 'event-centers':
      return {
        className: 'bento-card bento-card-wide bento-card-image-bg glass-panel glass-panel-hover',
        style: {
          backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80')`,
          minHeight: '200px',
          cursor: 'pointer'
        },
        hasImage: true
      };
    case 'event-planners':
      return {
        className: 'bento-card bento-card-tall glass-panel glass-panel-hover',
        style: {
          backgroundImage: `url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80')`,
          minHeight: '340px',
          cursor: 'pointer'
        },
        hasImage: true
      };
    case 'ushering-agencies':
      return {
        className: 'bento-card bento-card-wide glass-panel glass-panel-hover',
        style: {
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(22,25,37,0.8) 100%)',
          cursor: 'pointer'
        },
        icon: '🤝'
      };
    case 'photographers':
      return {
        className: 'bento-card bento-card-image-bg glass-panel glass-panel-hover',
        style: {
          backgroundImage: `url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80')`,
          cursor: 'pointer'
        },
        hasImage: true
      };
    case 'decorators':
      return {
        className: 'bento-card glass-panel glass-panel-hover',
        style: {
          background: 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(22,25,37,0.8) 100%)',
          cursor: 'pointer'
        },
        icon: '✨'
      };
    case 'caterers':
      return {
        className: 'bento-card glass-panel glass-panel-hover',
        style: { cursor: 'pointer' },
        icon: '🍽️'
      };
    case 'djs':
      return {
        className: 'bento-card glass-panel glass-panel-hover',
        style: {
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)',
          cursor: 'pointer'
        },
        icon: '🎧'
      };
    case 'mcs':
      return {
        className: 'bento-card glass-panel glass-panel-hover',
        style: { cursor: 'pointer' },
        icon: '🎙️'
      };
    default:
      return {
        className: 'bento-card glass-panel glass-panel-hover',
        style: { cursor: 'pointer' },
        icon: '💼'
      };
  }
};

export default function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData.slice(0, 8) : []);

        const vendorRes = await fetch('/api/vendors');
        const vendorData = await vendorRes.json();
        setFeatured(Array.isArray(vendorData) ? vendorData.slice(0, 3) : []);
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
      
      {/* Hero Search Section with background slideshow */}
      <section style={{ 
        position: 'relative', 
        padding: '120px 20px', 
        textAlign: 'center', 
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Background Slideshow */}
        <div className="hero-slideshow-container">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide})` }}
            />
          ))}
          <div className="hero-overlay" />
        </div>

        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <span className="badge badge-premium" style={{ marginBottom: '16px', animation: 'pulseGlow 2s infinite' }}>
            Event Planning Redefined
          </span>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 800, 
            letterSpacing: '-0.03em', 
            marginBottom: '20px',
            fontFamily: 'var(--font-heading)',
            color: '#fff',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            Discover & Book <br />
            <span style={{ background: 'linear-gradient(to right, var(--accent-gold), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Verified Event Vendors
            </span>{' '}
            in Africa
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#e5e7eb', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            EventHub connects you with certified event centers, planners, decorators, caterers, and entertainers with transparent reviews and reputation scores.
          </p>

          {/* Search Box Card */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form glass">
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
                outline: 'none',
                color: '#fff',
                width: '100%'
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
                outline: 'none',
                color: '#fff',
                width: '100%'
              }}
            />
            <button type="submit" className="glow-btn" style={{ 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.95rem', 
              color: '#fff',
              padding: '14px 18px',
              width: '100%',
              cursor: 'pointer'
            }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Dynamic Bento Categories Grid */}
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

        <div className="bento-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bento-card" style={{ opacity: 0.5, minHeight: '150px' }} />
            ))
          ) : (
            categories.map((cat) => {
              const bentoProps = getBentoClassAndStyle(cat.slug);
              if (bentoProps.hasImage) {
                return (
                  <Link 
                    href={`/search?category=${cat.slug}`} 
                    key={cat.id} 
                    className={bentoProps.className}
                    style={bentoProps.style}
                  >
                    <div className="bento-card-image-bg-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="badge badge-premium" style={{ background: 'rgba(10,11,16,0.6)', border: '1px solid var(--accent-gold)', textShadow: 'none' }}>Trending</span>
                        <span style={{ fontSize: '1.2rem' }}>★</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginBottom: '4px' }}>{cat.name}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#f3f4f6', textShadow: '0 1px 2px rgba(0,0,0,0.8)', lineHeight: 1.4 }}>{cat.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              } else {
                return (
                  <Link 
                    href={`/search?category=${cat.slug}`} 
                    key={cat.id} 
                    className={bentoProps.className}
                    style={bentoProps.style}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <span className="bento-icon">{bentoProps.icon}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&rarr;</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{cat.name}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{cat.description}</p>
                    </div>
                  </Link>
                );
              }
            })
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
