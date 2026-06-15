'use client';

import React, { useEffect, useState } from 'react';

interface Proposal {
  id: string;
  priceEstimate: number | null;
  proposalText: string;
  createdAt: string;
  vendor: {
    id: string;
    name: string;
    isVerified: boolean;
    verificationLevel: string;
    reputation: { averageRating: number; reviewVolume: number } | null;
  };
}

interface EventRequest {
  id: string;
  customerId: string;
  title: string;
  eventType: string;
  guestCount: number | null;
  budgetRange: string | null;
  location: string;
  city: string | null;
  region: string | null;
  eventDate: string;
  details: string;
  createdAt: string;
  customer: { fullName: string };
  proposals: any[];
}

export default function EventRequestsMarketplace() {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<EventRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Proposal submit form states
  const [pitchText, setPitchText] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const loadData = async () => {
    try {
      const sessRes = await fetch('/api/auth/me');
      const sessData = await sessRes.json();
      setUserSession(sessData.user);

      const reqRes = await fetch('/api/requests');
      const reqData = await reqRes.json();
      setRequests(reqData);
      
      if (reqData.length > 0 && !selectedReq) {
        setSelectedReq(reqData[0]);
      }
    } catch (e) {
      console.error('Error loading request marketplace:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch proposals when selected request changes
  useEffect(() => {
    if (!selectedReq) return;
    setProposals([]);

    const reqId = selectedReq.id;

    async function loadProposals() {
      try {
        const res = await fetch(`/api/proposals?requestId=${reqId}`);
        if (res.ok) {
          const data = await res.json();
          setProposals(data);
        }
      } catch (err) {
        console.error('Failed to load proposals:', err);
      }
    }
    loadProposals();
  }, [selectedReq]);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !pitchText) return;
    const targetRequestId = selectedReq.id;
    setSubmittingProposal(true);

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: targetRequestId,
          priceEstimate: estimatePrice,
          proposalText: pitchText,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit proposal');

      setPitchText('');
      setEstimatePrice('');
      
      // Reload proposals
      const propRes = await fetch(`/api/proposals?requestId=${targetRequestId}`);
      const propData = await propRes.json();
      setProposals(propData);
      
      alert('Proposal bid submitted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading event requests marketplace...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%', flex: 1 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Demand Event Requests Feed</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Browse active jobs posted by event customers. Vendors submit service proposals and compete for contracts.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Side: Requests List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.length > 0 ? (
            requests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => setSelectedReq(req)}
                className="glass" 
                style={{ 
                  padding: '20px', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer',
                  border: selectedReq?.id === req.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: selectedReq?.id === req.id ? 'var(--bg-input)' : 'var(--bg-card)',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-basic" style={{ fontSize: '0.6rem' }}>{req.eventType}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📅 {new Date(req.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{req.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>📍 {req.city || 'Accra'}</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{req.budgetRange || 'Contact'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No open requests currently active.</p>
            </div>
          )}
        </section>

        {/* Right Side: Selected Request Details & Proposals Panel */}
        <aside>
          {selectedReq ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Detailed Card */}
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="badge badge-premium">{selectedReq.eventType}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Posted by: {selectedReq.customer.fullName}</span>
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>{selectedReq.title}</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  <div>📅 <strong>Date:</strong> {new Date(selectedReq.eventDate).toLocaleDateString()}</div>
                  <div>👥 <strong>Guests:</strong> {selectedReq.guestCount || 'N/A'}</div>
                  <div>💰 <strong>Budget:</strong> {selectedReq.budgetRange || 'Flexible'}</div>
                  <div>📍 <strong>Location:</strong> {selectedReq.location} ({selectedReq.city})</div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line', marginBottom: '24px' }}>
                  {selectedReq.details}
                </p>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Request ID: {selectedReq.id}
                </div>
              </div>

              {/* Proposals Board (Conditional display based on user roles) */}
              
              {/* Case 1: Active Vendor submits a bid proposal */}
              {userSession && userSession.role === 'VENDOR' && (
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--accent-gold)' }}>Submit Service Proposal</h3>
                  
                  <form onSubmit={handleProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Price Estimate (GHS - Optional)</label>
                      <input 
                        type="number" 
                        value={estimatePrice} 
                        onChange={(e) => setEstimatePrice(e.target.value)} 
                        placeholder="e.g. 5000" 
                        style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Pitch & Service details</label>
                      <textarea 
                        required
                        value={pitchText}
                        onChange={(e) => setPitchText(e.target.value)}
                        placeholder="Describe how your services match the requirements, detail package options, inclusions..." 
                        rows={4} 
                        style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.85rem', resize: 'none' }} 
                      />
                    </div>
                    <button type="submit" className="glow-btn" disabled={submittingProposal} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#fff', alignSelf: 'flex-end' }}>
                      {submittingProposal ? 'Submitting...' : 'Submit Pitch Bid'}
                    </button>
                  </form>
                </div>
              )}

              {/* Case 2: Customer who posted OR vendors view submitted bids */}
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Submitted Proposals ({proposals.length})</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {proposals.length > 0 ? (
                    proposals.map(prop => (
                      <div key={prop.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{prop.vendor.name}</span>
                            {prop.vendor.isVerified && (
                              <span className={`badge badge-${prop.vendor.verificationLevel?.toLowerCase() || 'basic'}`} style={{ fontSize: '0.55rem', marginLeft: '6px', padding: '1px 5px' }}>
                                {prop.vendor.verificationLevel}
                              </span>
                            )}
                          </div>
                          
                          {prop.priceEstimate && (
                            <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
                              GHS {prop.priceEstimate.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Reputation rating */}
                        {prop.vendor.reputation && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <span>★ {prop.vendor.reputation.averageRating.toFixed(1)}</span>
                            <span>({prop.vendor.reputation.reviewVolume} reviews)</span>
                          </div>
                        )}

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                          {prop.proposalText}
                        </p>
                        
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                          Submitted: {new Date(prop.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                      No bids submitted yet for this request.
                    </p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass" style={{ padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Select an opportunity from the list to view requirements.</p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
