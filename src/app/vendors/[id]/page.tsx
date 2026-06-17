'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  eventType: string;
  guestCount: number | null;
  budgetRange: string | null;
  description: string | null;
  testimonial: string | null;
  images: { imageUrl: string }[];
}

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  user: { fullName: string };
}

interface Availability {
  id: string;
  date: string;
  status: 'AVAILABLE' | 'RESERVED' | 'BLOCKED';
  notes: string | null;
}

interface Vendor {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  location: string;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  socialLinks: any;
  isVerified: boolean;
  verificationLevel: string | null;
  categories: { category: { name: string } }[];
  projects: Project[];
  reviews: Review[];
  availabilities: Availability[];
  reputation: any;
}

export default function VendorDetailsPage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  // Inquiry state
  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqDetails, setInqDetails] = useState('');
  const [inqLoading, setInqLoading] = useState(false);
  const [inqSuccess, setInqSuccess] = useState(false);

  // Claim Profile state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Favorites state
  const [isFavorited, setIsFavorited] = useState(false);

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        const found = data.some((fav: any) => fav.vendorId === id);
        setIsFavorited(found);
      }
    } catch (e) {
      console.error('Error checking favorite status:', e);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        const res = await fetch(`/api/favorites?vendorId=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsFavorited(false);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to remove from favorites');
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId: id }),
        });
        if (res.ok) {
          setIsFavorited(true);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to add to favorites. Please log in first.');
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const loadVendor = async () => {
    try {
      const res = await fetch(`/api/vendors/${id}`);
      if (!res.ok) throw new Error('Vendor profile not found');
      const data = await res.json();
      setVendor(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadVendor();
      checkFavoriteStatus();
    }
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitLoading(true);
    try {
      const res = await fetch(`/api/vendors/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, reviewText }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review. Make sure you are logged in as a Customer.');
      }
      setReviewText('');
      // Reload profile to refresh average score & reviews list
      loadVendor();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqLoading(true);
    setInqSuccess(false);
    try {
      const res = await fetch(`/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: id,
          customerName: inqName,
          customerEmail: inqEmail,
          customerPhone: inqPhone,
          details: inqDetails,
        }),
      });
      if (!res.ok) throw new Error('Failed to send inquiry');
      setInqSuccess(true);
      setInqName('');
      setInqEmail('');
      setInqPhone('');
      setInqDetails('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInqLoading(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    setClaimSuccess(false);
    try {
      const res = await fetch(`/api/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: id,
          claimantEmail: claimEmail,
          claimantPhone: claimPhone,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit claim request');
      setClaimSuccess(true);
      setClaimEmail('');
      setClaimPhone('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading vendor details...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--error)' }}>Error: {error || 'Vendor profile not found'}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
      {/* Profile Header */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '40px', marginBottom: '40px', position: 'relative' }}>
        
        {/* Claim business alert for AI-discovered profiles */}
        {!vendor.userId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid var(--accent-gold)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
            <div>
              <h4 style={{ color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '2px' }}>Discovered Business Listing</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                This business listing was compiled by the EventHub Growth Agent from public records. Are you the business owner?
              </p>
            </div>
            <button 
              onClick={() => setShowClaimModal(true)} 
              className="glow-btn" 
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#fff', backgroundColor: 'var(--accent-gold)' }}
            >
              Claim Profile
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {vendor.categories.map((c, i) => (
                <span key={i} className="badge badge-basic" style={{ fontSize: '0.65rem' }}>{c.category.name}</span>
              ))}
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{vendor.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍 {vendor.location}</span>
              {vendor.city && <span>• {vendor.city}, {vendor.region}</span>}
              {vendor.latitude && (
                <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>
                  ({vendor.latitude.toFixed(4)}, {vendor.longitude?.toFixed(4)})
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={toggleFavorite}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: isFavorited ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  borderColor: isFavorited ? 'var(--accent-gold)' : 'var(--border-color)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-fast)'
                }}
              >
                <span>{isFavorited ? '★ Saved' : '☆ Favorite'}</span>
              </button>

              {vendor.isVerified ? (
                <span className={`badge badge-${vendor.verificationLevel?.toLowerCase() || 'basic'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                  {vendor.verificationLevel} Verified
                </span>
              ) : (
                <span className="badge" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Pending Vetting</span>
              )}
            </div>
            
            {vendor.reputation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>★</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{vendor.reputation.averageRating.toFixed(1)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({vendor.reputation.reviewVolume} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Info + Sidebar */}
      <div className="vendor-details-grid">
        
        {/* Main Details Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* About */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>About Vendor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {vendor.description || 'No description provided yet by the vendor.'}
            </p>
          </div>

          {/* Portfolio Projects Showcase */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Projects Portfolio</h2>
            
            {vendor.projects && vendor.projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {vendor.projects.map((proj) => (
                  <div key={proj.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>{proj.title}</h3>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', flexWrap: 'wrap' }}>
                      {proj.eventType && <span style={{ backgroundColor: 'var(--bg-input)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>Event Type: {proj.eventType}</span>}
                      {proj.guestCount && <span style={{ backgroundColor: 'var(--bg-input)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>Guests: {proj.guestCount}</span>}
                      {proj.budgetRange && <span style={{ backgroundColor: 'var(--bg-input)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>Scale: {proj.budgetRange}</span>}
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
                      {proj.description}
                    </p>

                    {/* Image grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      {proj.images.map((img, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            height: '110px', 
                            borderRadius: 'var(--radius-md)', 
                            backgroundColor: 'var(--bg-input)', 
                            backgroundImage: `url(${img.imageUrl})`, 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center' 
                          }} 
                        />
                      ))}
                    </div>

                    {proj.testimonial && (
                      <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '14px', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        "{proj.testimonial}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                No showcase projects posted yet.
              </p>
            )}
          </div>

          {/* Reviews List & Write Form */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Client Reviews</h2>

            {/* Write review form */}
            <form onSubmit={handleReviewSubmit} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Leave a Review</h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating:</span>
                <select 
                  value={reviewRating} 
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '6px 12px' }}
                >
                  <option value={5}>5 Stars (Outstanding)</option>
                  <option value={4}>4 Stars (Excellent)</option>
                  <option value={3}>3 Stars (Good)</option>
                  <option value={2}>2 Stars (Fair)</option>
                  <option value={1}>1 Star (Poor)</option>
                </select>
              </div>
              <textarea 
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience working with this vendor..." 
                rows={3} 
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '0.9rem', resize: 'none', marginBottom: '12px' }}
              />
              <button type="submit" className="glow-btn" disabled={reviewSubmitLoading} style={{ padding: '8px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#fff' }}>
                {reviewSubmitLoading ? 'Submitting...' : 'Post Review'}
              </button>
            </form>

            {/* Reviews display */}
            {vendor.reviews && vendor.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {vendor.reviews.map((rev) => (
                  <div key={rev.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.user.fullName}</span>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {rev.reviewText}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                Be the first to review this service provider!
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Panel: Inquiry Form + Availability + Analytics */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Inquiry form */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Send Lead Inquiry</h3>
            {inqSuccess ? (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', textAlign: 'center' }}>
                Inquiry sent successfully! The vendor will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <input type="text" placeholder="Your Name" required value={inqName} onChange={(e) => setInqName(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <input type="email" placeholder="Your Email" required value={inqEmail} onChange={(e) => setInqEmail(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <input type="text" placeholder="Your Phone" value={inqPhone} onChange={(e) => setInqPhone(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <textarea placeholder="Describe your event needs (e.g. Wedding venue for 300 guests on Dec 12th)" required value={inqDetails} onChange={(e) => setInqDetails(e.target.value)} rows={3} style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem', resize: 'none' }} />
                </div>
                <button type="submit" className="glow-btn" disabled={inqLoading} style={{ padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#fff' }}>
                  {inqLoading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>

          {/* Availability widget */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Availability Calendar</h3>
            {vendor.availabilities && vendor.availabilities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {vendor.availabilities.slice(0, 5).map((av) => (
                  <div key={av.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span>📅 {new Date(av.date).toLocaleDateString()}</span>
                    <span className={`badge ${av.status === 'RESERVED' ? 'badge-business' : 'badge-premium'}`} style={{ fontSize: '0.6rem' }}>
                      {av.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                All calendar dates are currently open for inquiries.
              </p>
            )}
          </div>

          {/* Contacts Details */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Business Contacts</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {vendor.phone && <li>📞 {vendor.phone}</li>}
              {vendor.email && <li>✉️ {vendor.email}</li>}
              {vendor.website && <li>🌐 <a href={vendor.website} target="_blank" style={{ color: 'var(--primary)' }}>Visit Website</a></li>}
            </ul>
          </div>
        </aside>

      </div>

      {/* Claim Profile Modal Mockup */}
      {showClaimModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '440px', borderRadius: 'var(--radius-lg)', padding: '30px', animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--accent-gold)' }}>Claim Business Listing</h3>
            
            {claimSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                  Claim request submitted successfully! We have sent a verification code to {claimEmail}. Please enter it below once received to claim ownership of this profile.
                </p>
                <button 
                  onClick={() => setShowClaimModal(false)} 
                  style={{ border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  To link this profile to your owner account, provide your business email and contact number. An admin will review and release this account to you.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Business Email</label>
                  <input type="email" value={claimEmail} onChange={(e) => setClaimEmail(e.target.value)} required placeholder="owner@business.com" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Business Phone</label>
                  <input type="text" value={claimPhone} onChange={(e) => setClaimPhone(e.target.value)} required placeholder="+233..." style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowClaimModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
                    Cancel
                  </button>
                  <button type="submit" className="glow-btn" disabled={claimLoading} style={{ color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
                    {claimLoading ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
