'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Project {
  id: string;
  title: string;
  eventType: string;
  guestCount: number;
  budgetRange: string;
  description: string;
  testimonial: string;
  images: { imageUrl: string }[];
}

export default function VendorProfileDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Portfolio project states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projType, setProjType] = useState('Wedding');
  const [projGuests, setProjGuests] = useState('');
  const [projBudget, setProjBudget] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTestimonial, setProjTestimonial] = useState('');
  const [projImages, setProjImages] = useState(''); // comma separated urls

  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await fetch('/api/vendors/profile');
        if (!profileRes.ok) {
          throw new Error('Please login as a Vendor to access this page.');
        }
        const profileData = await profileRes.json();
        setProfile(profileData);
        
        // Map profile data to states
        setName(profileData.name || '');
        setDescription(profileData.description || '');
        setLocation(profileData.location || '');
        setCity(profileData.city || '');
        setRegion(profileData.region || '');
        setLatitude(profileData.latitude?.toString() || '');
        setLongitude(profileData.longitude?.toString() || '');
        setPhone(profileData.phone || '');
        setEmail(profileData.email || '');
        setWebsite(profileData.website || '');
        setInstagram(profileData.socialLinks?.instagram || '');
        setFacebook(profileData.socialLinks?.facebook || '');
        setSelectedCategories(profileData.categories?.map((c: any) => c.categoryId) || []);

        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(catData);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/vendors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          location,
          city,
          region,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          phone,
          email,
          website,
          socialLinks: { instagram, facebook },
          categoryIds: selectedCategories,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updated = await res.json();
      setProfile(updated);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const imageUrls = projImages.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/vendors/profile/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projTitle,
          eventType: projType,
          guestCount: projGuests,
          budgetRange: projBudget,
          description: projDesc,
          testimonial: projTestimonial,
          imageUrls,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create portfolio project');
      }

      const newProj = await res.json();
      setProfile((prev: any) => ({
        ...prev,
        projects: [...(prev.projects || []), newProj],
      }));

      // Reset states
      setProjTitle('');
      setProjGuests('');
      setProjBudget('');
      setProjDesc('');
      setProjTestimonial('');
      setProjImages('');
      setShowProjectModal(false);
      setMessage({ type: 'success', text: 'Portfolio project added!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading vendor profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
      {/* Overview stats header */}
      {profile && (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '40px', display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{profile.name}</h1>
              {profile.isVerified && (
                <span className={`badge badge-${profile.verificationLevel?.toLowerCase() || 'basic'}`}>
                  {profile.verificationLevel} Verified
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Manage your business listing, upload portfolios, and configure categories.
            </p>
          </div>
          
          {/* Profile completeness & Analytics widget */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-input)', padding: '12px 20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {profile.reputation?.profileCompletenessPct || 10}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Filled</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-input)', padding: '12px 20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                {profile.analytics?.profileViews || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Views</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-input)', padding: '12px 20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                {profile.analytics?.inquiryCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inquiries</div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '35px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <Link href="/dashboard/profile" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: '12px', marginBottom: '-14px' }}>
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
        <Link href="/dashboard/analytics" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '12px', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Performance Analytics
        </Link>
      </div>

      {message.text && (
        <div style={{
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
          color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          marginBottom: '30px'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '40px' }}>
        {/* Profile Details Edit Form */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '35px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Edit Business Details
          </h2>

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Business Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233..." style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Business Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Contact Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Website Link</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
              </div>
            </div>

            {/* Geographic Intelligence inputs */}
            <div style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--accent-gold)' }}>Geographic Location</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Full Street Address</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kempinski Hotel Road, Accra" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Accra or Kumasi" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Region</label>
                    <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Greater Accra or Ashanti" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Latitude (Decimal)</label>
                    <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 5.5539" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Longitude (Decimal)</label>
                    <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. -0.1983" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Instagram Username</label>
                <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="username" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Facebook Page Slug</label>
                <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="page-name" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
              </div>
            </div>

            <button type="submit" className="glow-btn" disabled={saving} style={{ padding: '14px', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '1rem', alignSelf: 'flex-start', minWidth: '160px' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Categories Selector & Portfolios List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Categories select */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Service Categories</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Select which categories describe your services (Select all that apply).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selected ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: selected ? 'var(--primary-glow)' : 'transparent',
                      color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portfolio Projects Section */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Portfolio Projects</h2>
              <button
                type="button"
                onClick={() => setShowProjectModal(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                + Add Project
              </button>
            </div>

            {profile?.projects && profile.projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {profile.projects.map((proj: Project) => (
                  <div key={proj.id} style={{ display: 'flex', gap: '12px', backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    {proj.images && proj.images.length > 0 ? (
                      <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-sm)', backgroundPosition: 'center', backgroundSize: 'cover', backgroundImage: `url(${proj.images[0].imageUrl})`, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>No Image</div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '2px' }}>{proj.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {proj.eventType} {proj.guestCount ? `• ${proj.guestCount} Guests` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                No portfolio projects added yet. Uploading a project showcases your experience.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Project Modal Mockup Overlay */}
      {showProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '540px', borderRadius: 'var(--radius-lg)', padding: '30px', animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>New Portfolio Project</h3>
            <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Project Title</label>
                <input type="text" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required placeholder="e.g. Wedding at Kempinski" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Event Type</label>
                  <input type="text" value={projType} onChange={(e) => setProjType(e.target.value)} placeholder="e.g. Wedding, Gala, Concert" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Guest Count</label>
                  <input type="number" value={projGuests} onChange={(e) => setProjGuests(e.target.value)} placeholder="e.g. 250" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Budget Range / Metric</label>
                <input type="text" value={projBudget} onChange={(e) => setProjBudget(e.target.value)} placeholder="e.g. GHS 30,000 - 50,000" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Project Details & Description</label>
                <textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} rows={3} placeholder="Describe the project achievements..." style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', resize: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Client Testimonial (Optional)</label>
                <textarea value={projTestimonial} onChange={(e) => setProjTestimonial(e.target.value)} rows={2} placeholder="Quote from client..." style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', resize: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Image URLs (Comma separated)</label>
                <input type="text" value={projImages} onChange={(e) => setProjImages(e.target.value)} placeholder="https://url1.jpg, https://url2.jpg" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="glow-btn" style={{ color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius-md)' }}>
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
