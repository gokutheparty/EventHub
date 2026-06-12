'use client';

import React, { useState } from 'react';

export default function NewEventRequestPage() {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [guestCount, setGuestCount] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [details, setDetails] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          eventType,
          guestCount,
          budgetRange,
          location,
          city,
          region,
          eventDate,
          details,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit event request. Make sure you are logged in as a CUSTOMER.');
      }

      setSuccess(true);
      setTitle('');
      setGuestCount('');
      setBudgetRange('');
      setLocation('');
      setCity('');
      setRegion('');
      setEventDate('');
      setDetails('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08), transparent)' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '640px', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(to right, #fbbf24, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Post an Event Opportunity
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Describe your event needs. Vetted vendors will review and submit service proposals directly to you.
          </p>
        </div>

        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
            🎉 Event request posted successfully! Vendors have been notified and will submit bids soon. <br />
            <a href="/requests" style={{ textDecoration: 'underline', fontWeight: 700, marginTop: '8px', display: 'inline-block' }}>Browse Open Requests</a>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Project / Event Title</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Wedding Reception Venue and Planner needed in East Legon" 
              style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Event Type</label>
              <select 
                value={eventType} 
                onChange={(e) => setEventType(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', cursor: 'pointer' }}
              >
                <option value="Wedding">Wedding</option>
                <option value="Corporate Gala">Corporate Gala</option>
                <option value="Concert / Gig">Concert / Live Gig</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Anniversary">Anniversary</option>
                <option value="General Gathering">Other Gathering</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Guest Count Capacity</label>
              <input 
                type="number" 
                value={guestCount} 
                onChange={(e) => setGuestCount(e.target.value)} 
                placeholder="e.g. 300" 
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Target Budget Scale (GHS)</label>
              <input 
                type="text" 
                value={budgetRange} 
                onChange={(e) => setBudgetRange(e.target.value)} 
                placeholder="e.g. GHS 20,000 - 30,000" 
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Event Date</label>
              <input 
                type="date" 
                required
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} 
              />
            </div>
          </div>

          {/* Geographic indicators */}
          <div style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--accent-gold)' }}>Event Geographics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Venue Street Location</label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Spintex Road, Accra" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Accra" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Region</label>
                  <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Greater Accra" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Project Specification Details</label>
            <textarea 
              required
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              rows={4} 
              placeholder="Provide event details, service expectations, vendor categories needed, catering guidelines etc..." 
              style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', resize: 'none' }} 
            />
          </div>

          <button type="submit" className="glow-btn" disabled={loading} style={{ padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '1rem', color: '#fff' }}>
            {loading ? 'Posting Request...' : 'Publish Event Request'}
          </button>

        </form>

      </div>
    </div>
  );
}
