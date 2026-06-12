'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Inquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  eventDate: string | null;
  details: string;
  status: 'PENDING' | 'DISCUSSING' | 'AGREED' | 'CLOSED';
  createdAt: string;
}

export default function VendorInquiriesDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInquiries = async () => {
    try {
      const res = await fetch('/api/vendors/profile/inquiries');
      if (!res.ok) throw new Error('Please login as a Vendor to access your inquiries dashboard.');
      const data = await res.json();
      setInquiries(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/vendors/profile/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      loadInquiries();
      alert('Inquiry status updated successfully.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading inquiries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--error)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Client Inquiries Leads</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Track your client leads, update discussion statuses, and verify agreements.
        </p>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '35px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <Link href="/dashboard/profile" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Edit Profile
        </Link>
        <Link href="/dashboard/inquiries" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: '12px', marginBottom: '-14px' }}>
          Inquiries Leads
        </Link>
        <Link href="/dashboard/availability" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Calendar Availability
        </Link>
        <Link href="/dashboard/analytics" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Performance Analytics
        </Link>
      </div>

      {inquiries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {inquiries.map((inq) => (
            <div key={inq.id} className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '30px', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', justifyItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{inq.customerName}</h3>
                  <span className={`badge ${
                    inq.status === 'PENDING' ? 'badge-premium' :
                    inq.status === 'DISCUSSING' ? 'badge-basic' :
                    inq.status === 'AGREED' ? 'badge-business' : 'badge-premium'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {inq.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span>✉️ {inq.customerEmail}</span>
                  {inq.customerPhone && <span>📞 {inq.customerPhone}</span>}
                  {inq.eventDate && <span>📅 Event Date: {new Date(inq.eventDate).toLocaleDateString()}</span>}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {inq.details}
                </p>
              </div>

              {/* Status Update Options */}
              <div style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Update Stage Status</label>
                <select 
                  value={inq.status} 
                  onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <option value="PENDING">Pending (New Lead)</option>
                  <option value="DISCUSSING">Discussing (Negotiations)</option>
                  <option value="AGREED">Agreed (Deal Struck)</option>
                  <option value="CLOSED">Closed (Cancelled/Finished)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Received: {new Date(inq.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass" style={{ padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You have not received any client inquiries yet.</p>
        </div>
      )}
    </div>
  );
}
