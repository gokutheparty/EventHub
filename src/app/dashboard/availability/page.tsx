'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Availability {
  id: string;
  date: string;
  status: 'AVAILABLE' | 'RESERVED' | 'BLOCKED';
  notes: string | null;
}

export default function VendorAvailabilityDashboard() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [inputDate, setInputDate] = useState('');
  const [inputStatus, setInputStatus] = useState<'RESERVED' | 'BLOCKED'>('BLOCKED');
  const [inputNotes, setInputNotes] = useState('');

  const loadAvailability = async () => {
    try {
      const res = await fetch('/api/vendors/profile/availability');
      if (!res.ok) throw new Error('Please login as a Vendor to manage availability.');
      const data = await res.json();
      setAvailabilities(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDate) return;

    try {
      const res = await fetch('/api/vendors/profile/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: inputDate,
          status: inputStatus,
          notes: inputNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to save date block');
      setInputDate('');
      setInputNotes('');
      loadAvailability();
      alert('Date blocked successfully on calendar.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/vendors/profile/availability?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete date block');
      loadAvailability();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Accessing availability calendar...</p>
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
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Availability Calendar Control</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Mark specific dates on your calendar as reserved or blocked to inform customers during searches.
        </p>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="dashboard-tabs">
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
        <Link href="/dashboard/availability" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: '12px', marginBottom: '-14px' }}>
          Calendar Availability
        </Link>
        <Link href="/dashboard/analytics" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Performance Analytics
        </Link>
      </div>

      <div className="dashboard-grid-5-7">
        
        {/* Block form */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--accent-gold)' }}>Block Calendar Date</h2>
          
          <form onSubmit={handleAddBlock} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Select Target Date</label>
              <input 
                type="date" 
                required
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Blocking Reason / Status</label>
              <select 
                value={inputStatus}
                onChange={(e) => setInputStatus(e.target.value as 'RESERVED' | 'BLOCKED')}
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', cursor: 'pointer' }}
              >
                <option value="BLOCKED">Blocked (Not Available for Inquiries)</option>
                <option value="RESERVED">Reserved (Booked for Event)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Scheduler Notes (Internal/Public)</label>
              <textarea 
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                placeholder="e.g. Wedding Booking or Maintenance shutdown"
                rows={3}
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', resize: 'none' }}
              />
            </div>

            <button type="submit" className="glow-btn" style={{ padding: '12px', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}>
              Save Calendar Block
            </button>
          </form>
        </div>

        {/* Existing Blocks List */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Blocked Calendar Dates</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {availabilities.length > 0 ? (
              availabilities.map(av => (
                <div key={av.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>📅 {new Date(av.date).toLocaleDateString()}</h4>
                    {av.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Note: {av.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${av.status === 'RESERVED' ? 'badge-business' : 'badge-premium'}`} style={{ fontSize: '0.65rem' }}>
                      {av.status}
                    </span>
                    <button 
                      onClick={() => handleDeleteBlock(av.id)}
                      style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>
                All dates are currently open and available.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
