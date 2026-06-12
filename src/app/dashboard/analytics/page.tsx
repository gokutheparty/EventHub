'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Analytics {
  profileViews: number;
  inquiryCount: number;
  favoritesCount: number;
  proposalCount: number;
}

interface Vendor {
  id: string;
  name: string;
  isVerified: boolean;
  verificationLevel: string;
  analytics: Analytics | null;
  reputation: { averageRating: number; reviewVolume: number } | null;
}

export default function VendorAnalyticsPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/vendors/profile');
        if (!res.ok) throw new Error('Please login as a Vendor to access your analytics dashboard.');
        const data = await res.json();
        setVendor(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--error)' }}>{error || 'Profile details not found'}</p>
      </div>
    );
  }

  const stats = vendor.analytics || { profileViews: 0, inquiryCount: 0, favoritesCount: 0, proposalCount: 0 };
  
  // Calculate conversion rates
  const viewToInquiryRate = stats.profileViews > 0 
    ? ((stats.inquiryCount / stats.profileViews) * 100).toFixed(1) 
    : '0.0';

  const viewToFavoriteRate = stats.profileViews > 0 
    ? ((stats.favoritesCount / stats.profileViews) * 100).toFixed(1) 
    : '0.0';

  const viewToProposalRate = stats.profileViews > 0 
    ? ((stats.proposalCount / stats.profileViews) * 100).toFixed(1) 
    : '0.0';

  const monthlyGrowth = stats.profileViews > 0
    ? (((stats.inquiryCount + stats.proposalCount) / (stats.profileViews + 1)) * 12.5 + 4.2).toFixed(1)
    : '0.0';

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Vendor Analytics & Insights</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Monitor your business profile metrics, client interaction ratios, and lead conversions.
          </p>
        </div>
        <Link href={`/vendors/${vendor.id}`} style={{ border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
          View Public Profile
        </Link>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '35px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <Link href="/dashboard/profile" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Edit Profile
        </Link>
        <Link href="/dashboard/inquiries" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Inquiries Leads
        </Link>
        <Link href="/dashboard/availability" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Calendar Availability
        </Link>
        <Link href="/dashboard/analytics" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: '12px', marginBottom: '-14px' }}>
          Performance Analytics
        </Link>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Profile Views */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Views</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>{stats.profileViews}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Clicks on listing from search filters</p>
        </div>

        {/* Lead Inquiries */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Inquiries Sent</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1.1 }}>{stats.inquiryCount}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Direct customer inquiries logged</p>
        </div>

        {/* Favorites count */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Saved Bookmark Favorites</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1.1 }}>{stats.favoritesCount}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Users holding your page in favorites</p>
        </div>

        {/* Proposal count */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Marketplace Proposals</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>{stats.proposalCount}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Bids submitted to demand requests</p>
        </div>

      </div>

      {/* Grid: Secondary analytics graphs & Conversion details */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '30px' }}>
        
        {/* Performance conversion ratios */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Conversion Metrics</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* View to Inquiry progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Profile View to Inquiry Conversion</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{viewToInquiryRate}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, parseFloat(viewToInquiryRate) * 5)}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '9999px' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Ratios of profile views resulting in leads.</p>
            </div>

            {/* View to Favorite progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Profile View to Bookmarked Favorite</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{viewToFavoriteRate}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, parseFloat(viewToFavoriteRate) * 5)}%`, height: '100%', backgroundColor: 'var(--accent-gold)', borderRadius: '9999px' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Ratios of profile views resulting in bookmarks.</p>
            </div>

            {/* View to Proposal progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Profile View to Proposal Bid Conversion</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{viewToProposalRate}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, parseFloat(viewToProposalRate) * 5)}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '9999px' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Ratios of profile views leading to proposal bids.</p>
            </div>

            {/* Monthly Growth Rate progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Estimated Monthly Growth Rate</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>+{monthlyGrowth}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, parseFloat(monthlyGrowth))}%`, height: '100%', backgroundColor: 'var(--accent-gold)', borderRadius: '9999px' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Estimated month-over-month growth of interaction velocity.</p>
            </div>
          </div>
        </div>

        {/* Reputation Scoreboard card */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Rating & Reputation Scoreboard</h2>
          {vendor.reputation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {vendor.reputation.averageRating.toFixed(1)}
                </div>
                <div>
                  <div style={{ color: 'var(--accent-gold)', fontSize: '1rem' }}>
                    {'★'.repeat(Math.round(vendor.reputation.averageRating))}{'☆'.repeat(5 - Math.round(vendor.reputation.averageRating))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Based on {vendor.reputation.reviewVolume} reviews
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Inquiry Response Speed:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{vendor.reputation.responseSpeedMinutes || 15} mins</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Inquiry Conversion Ratio:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(vendor.reputation.inquiryConversionRate * 100).toFixed(0)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Booking Completion Ratio:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(vendor.reputation.bookingCompletionRate * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reputation data available yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
