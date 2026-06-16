'use client';

import React, { useEffect, useState } from 'react';

interface StagingItem {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  categories: string[];
  confidenceScore: number;
  trustScore: number;
  sourceUrl: string;
}

interface Claim {
  id: string;
  claimantEmail: string;
  claimantPhone: string;
  status: string;
  vendor: { name: string };
}

interface Vendor {
  id: string;
  name: string;
  city: string;
  isVerified: boolean;
  verificationLevel: string;
}

export default function AdminVerificationPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [staging, setStaging] = useState<StagingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Selection states for verifying
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [verifyLevel, setVerifyLevel] = useState('BASIC');
  const [verifyNotes, setVerifyNotes] = useState('');

  // Featured placement promotion states
  const [promotingVendorId, setPromotingVendorId] = useState('');
  const [featStartDate, setFeatStartDate] = useState('');
  const [featEndDate, setFeatEndDate] = useState('');
  const [featPriority, setFeatPriority] = useState('1');

  // AI Agent Log Simulator State
  const [simulating, setSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [crawlCategory, setCrawlCategory] = useState('Event Centers');
  const [crawlCity, setCrawlCity] = useState('Accra');

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/admin/vendors');
      if (!res.ok) throw new Error('Access denied. Admin permissions required.');
      const data = await res.json();
      setVendors(data.vendors);
      setClaims(data.claims);

      const stagingRes = await fetch('/api/admin/staging');
      const stagingData = await stagingRes.json();
      setStaging(stagingData);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) return;

    try {
      const res = await fetch(`/api/admin/vendors/${selectedVendorId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: verifyLevel, status: 'APPROVED', notes: verifyNotes }),
      });
      if (!res.ok) throw new Error('Verification failed');
      setSelectedVendorId('');
      setVerifyNotes('');
      loadAdminData();
      alert('Vendor verified successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/approve`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to approve claim');
      }
      loadAdminData();
      alert('Business claim approved! Ownership transferred.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/reject`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to reject claim');
      }
      loadAdminData();
      alert('Claim request rejected successfully.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingVendorId) return;

    try {
      const res = await fetch(`/api/admin/featured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: promotingVendorId,
          startDate: featStartDate,
          endDate: featEndDate,
          priority: featPriority,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to schedule promotion');
      }
      setPromotingVendorId('');
      setFeatStartDate('');
      setFeatEndDate('');
      setFeatPriority('1');
      loadAdminData();
      alert('Featured listing scheduled successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleIngestStaging = async (stagingId: string) => {
    try {
      const res = await fetch(`/api/admin/staging/${stagingId}/approve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to ingest staging item');
      loadAdminData();
      alert('Staged candidate ingested successfully into main production listing!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Run Simulated/Real AI Crawler sequence
  const runAiCrawlerSimulation = async () => {
    setSimulating(true);
    setSimLogs(['[Pipeline] 🚀 Initializing Live AI Scraper on FastAPI Backend...']);

    try {
      const triggerRes = await fetch('/api/admin/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: crawlCategory, city: crawlCity }),
      });

      if (!triggerRes.ok) {
        throw new Error('FastAPI server returned non-ok status.');
      }

      const { job_id } = await triggerRes.json();
      setSimLogs(prev => [
        ...prev,
        `[Pipeline] Crawl job queued successfully with ID: ${job_id}`,
        `[Pipeline] Target Category: ${crawlCategory} | Target City: ${crawlCity}`,
        '[Pipeline] Polling agent logs...'
      ]);

      // Poll status every second
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/admin/crawl/${job_id}`);
          if (!statusRes.ok) return;

          const jobData = await statusRes.json();
          if (jobData.logs) {
            setSimLogs(jobData.logs);
          }

          if (jobData.status === 'completed' || jobData.status === 'failed') {
            clearInterval(pollInterval);
            setSimulating(false);
            loadAdminData(); // Refresh the staging list
          }
        } catch (pollErr) {
          console.error('Error polling crawl status:', pollErr);
        }
      }, 1000);

    } catch (err: any) {
      console.warn('FastAPI backend offline or returned error. Running local simulation fallback.', err);
      setSimLogs(prev => [
        ...prev,
        `[Pipeline] ⚠️ FastAPI backend offline. Running client-side simulation fallback...`
      ]);

      const logsSequence = [
        '[Agent 1: Discovery] 🔍 Initializing web scraper engine...',
        '[Agent 1: Discovery] Found event category target page: "Accra Business Yellowpages"',
        '[Agent 1: Discovery] Collected candidate URLs: 3 matches identified.',
        '[Agent 2: Extraction] 📂 Starting schema parsers on source listings...',
        '[Agent 2: Extraction] Extracted: "Gold Star Ushers", "Deluxe Decors", "Dynamic Sound Band"',
        '[Agent 3: Cleaning] 🧹 Standardizing address layouts & normalizing phone formatting (+233 standard)...',
        '[Agent 4: Enrichment] 🏷️ Classifying categories & generating tags: mapped to "Live Bands", "Decorators", "Ushering"...',
        '[Agent 5: Trust Scoring] 📊 Legitimizing online footprints... Average candidate confidence score: 85%',
        '[Agent 6: Deduplication] 🧬 Deduplicating records... No existing matching database duplicates found.',
        '[Growth Agent 7] 🚀 Candidates successfully loaded into vendor_staging table, ready for approval!'
      ];

      let currentLogIndex = 0;
      const interval = setInterval(() => {
        if (currentLogIndex < logsSequence.length) {
          setSimLogs(prev => [...prev, logsSequence[currentLogIndex]]);
          currentLogIndex++;
        } else {
          clearInterval(interval);
          setSimulating(false);
          loadAdminData(); // Refresh data to show loaded items
        }
      }, 1200);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Accessing admin portal...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin Vetting & Ingestion Console</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage trust certifications, process profile claims, and audit AI-sourced staging candidates.
          </p>
        </div>
        <span className="badge badge-premium">Admin Access</span>
      </div>

      {message && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '30px' }}>
          {message}
        </div>
      )}

      {/* Grid: Verifications Panel + Claim list */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '30px', marginBottom: '40px' }}>
        
        {/* Verification controller */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Vendor Listings Verification</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Featured promotion form */}
            {promotingVendorId && (
              <form onSubmit={handleFeatureSubmit} style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-gold)' }}>
                  Promote to Featured: {vendors.find(v => v.id === promotingVendorId)?.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Start Date</label>
                    <input type="date" required value={featStartDate} onChange={(e) => setFeatStartDate(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>End Date</label>
                    <input type="date" required value={featEndDate} onChange={(e) => setFeatEndDate(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Priority Level</label>
                    <input type="number" required min="1" value={featPriority} onChange={(e) => setFeatPriority(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setPromotingVendorId('')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="glow-btn" style={{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', color: '#fff', backgroundColor: 'var(--accent-gold)' }}>Publish Feature</button>
                </div>
              </form>
            )}

            {/* Quick verify form */}
            {selectedVendorId && (
              <form onSubmit={handleVerifySubmit} style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-gold)' }}>
                  Approve Vetting for: {vendors.find(v => v.id === selectedVendorId)?.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Badge Level</label>
                    <select value={verifyLevel} onChange={(e) => setVerifyLevel(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                      <option value="BASIC">Basic (Blue Badge)</option>
                      <option value="BUSINESS">Business (Green Badge)</option>
                      <option value="PREMIUM">Premium (Gold Badge)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Vetting Notes</label>
                    <input type="text" placeholder="e.g. Registered documents verified" value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setSelectedVendorId('')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="glow-btn" style={{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', color: '#fff' }}>Verify Listing</button>
                </div>
              </form>
            )}

            {/* List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vendors.map(v => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{v.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {v.city || 'Accra'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {v.isVerified ? (
                      <span className={`badge badge-${v.verificationLevel?.toLowerCase() || 'basic'}`} style={{ fontSize: '0.65rem' }}>{v.verificationLevel}</span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.65rem' }}>Vetting Pending</span>
                    )}
                    <button 
                      onClick={() => setPromotingVendorId(v.id)} 
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      🌟 Promote
                    </button>
                    <button 
                      onClick={() => setSelectedVendorId(v.id)} 
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Audit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Claim requests */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Pending Profile Claims</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
            {claims.length > 0 ? (
              claims.map(c => (
                <div key={c.id} style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>{c.vendor.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Claimant: {c.claimantEmail} <br /> Phone: {c.claimantPhone || 'N/A'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleApproveClaim(c.id)} 
                      className="glow-btn" 
                      style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#fff' }}
                    >
                      Verify & Release Profile
                    </button>
                    <button 
                      onClick={() => handleRejectClaim(c.id)} 
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Reject Claim
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>
                No pending profile claim requests.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* AI Acquisition Pipeline Simulator Dashboard */}
      <section className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '35px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '6px' }}>AI Acquisition Pipeline (Live Agent Controller)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Trigger real-time web crawlers scanning business directories to stage new vendor listings.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category Target</span>
              <select 
                value={crawlCategory} 
                onChange={(e) => setCrawlCategory(e.target.value)}
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.85rem', color: '#fff' }}
              >
                <option value="Event Centers">Event Centers</option>
                <option value="Event Planners">Event Planners</option>
                <option value="Ushering Agencies">Ushering Agencies</option>
                <option value="Caterers">Caterers</option>
                <option value="Decorators">Decorators</option>
                <option value="Photographers">Photographers</option>
                <option value="Live Bands">Live Bands</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target City</span>
              <select 
                value={crawlCity} 
                onChange={(e) => setCrawlCity(e.target.value)}
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.85rem', color: '#fff' }}
              >
                <option value="Accra">Accra</option>
                <option value="Kumasi">Kumasi</option>
                <option value="Takoradi">Takoradi</option>
              </select>
            </div>

            <button 
              onClick={runAiCrawlerSimulation} 
              disabled={simulating}
              className="glow-btn" 
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.85rem' }}
            >
              {simulating ? 'Agent Crawling...' : 'Trigger AI Crawling Scan'}
            </button>
          </div>
        </div>

        {/* Console and Staging list grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '30px', alignItems: 'start' }}>
          
          {/* Simulation Console Screen */}
          <div style={{ 
            backgroundColor: '#050608', 
            borderRadius: 'var(--radius-md)', 
            padding: '20px', 
            border: '1px solid rgba(255,255,255,0.05)',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            height: '350px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ color: 'var(--text-muted)' }}>EventHub AI Agent Orchestrator terminal. v1.0.0</div>
            {simLogs.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '20px', textAlign: 'center' }}>
                Terminal Idle. Click "Trigger AI Crawling Scan" to run.
              </div>
            )}
            {simLogs.map((log, index) => (
              <div key={index} style={{ 
                color: log.includes('Discovery') ? '#3b82f6' : 
                       log.includes('Extraction') ? '#a855f7' : 
                       log.includes('Growth') ? '#eab308' : '#10b981',
                lineHeight: 1.4
              }}>
                {log}
              </div>
            ))}
            {simulating && (
              <div style={{ color: 'var(--text-secondary)', animation: 'pulse 1s infinite' }}>▋ Parsing payloads...</div>
            )}
          </div>

          {/* Staging Cache List */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Staged Crawl Cache (Audit & Approve)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto' }}>
              {staging.length > 0 ? (
                staging.map(item => (
                  <div key={item.id} style={{ border: '1px solid var(--border-color)', padding: '18px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.name}</h4>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontSize: '0.65rem' }}>
                          Conf: {(item.confidenceScore * 100).toFixed(0)}%
                        </span>
                        <span className="badge" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '0.65rem' }}>
                          Trust: {(item.trustScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      📍 {item.location} • Source: <a href={item.sourceUrl} target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Link</a>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                    <button 
                      onClick={() => handleIngestStaging(item.id)}
                      className="glow-btn"
                      style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#fff' }}
                    >
                      Approve & Ingest Business Listing
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Staging cache is currently empty. Run the simulated scan to load candidate payloads.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
