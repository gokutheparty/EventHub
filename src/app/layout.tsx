import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EventHub | Discover & Book Verified Event Vendors',
  description: 'The trusted marketplace for event centers, planners, caterers, ushering agencies, decorators, and vendors in Ghana and across Africa.',
  keywords: 'event marketplace, Ghana events, event centers, photographers Accra, wedding planners Ghana, catering services, ushering agencies Accra',
  authors: [{ name: 'EventHub Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="layout-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Header */}
          <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', background: 'linear-gradient(to right, #fbbf24, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  EventHub
                </span>
                <span className="badge badge-business" style={{ fontSize: '0.65rem' }}>Beta</span>
              </Link>

              {/* Navigation Links */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link href="/search" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)', fontWeight: 500 }} id="nav-search-link">
                  Browse Vendors
                </Link>
                <Link href="/requests" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)', fontWeight: 500 }} id="nav-requests-link">
                  Event Requests
                </Link>
                
                {/* Dynamically controlled on client, but pre-styled for layout */}
                <div id="auth-nav-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Link href="/login" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }} id="nav-login-btn">
                    Login
                  </Link>
                  <Link href="/signup" className="glow-btn" style={{ padding: '8px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }} id="nav-signup-btn">
                    Join EventHub
                  </Link>
                </div>
              </nav>
            </div>
          </header>

          {/* Main content area */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>

          {/* Footer */}
          <footer className="glass" style={{ borderTop: '1px solid var(--border-color)', padding: '40px 20px', marginTop: 'auto' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', background: 'linear-gradient(to right, #fbbf24, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EventHub</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Africa's premier two-sided marketplace for event services, verifications, and vendor reputation.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>For Customers</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li><Link href="/search">Search Venues & Vendors</Link></li>
                  <li><Link href="/requests/new">Create Event Request</Link></li>
                  <li><Link href="/signup">Create Account</Link></li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>For Vendors</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li><Link href="/signup?role=VENDOR">Register as Vendor</Link></li>
                  <li><Link href="/claims">Claim Discovered Profile</Link></li>
                  <li><Link href="/dashboard">Vendor Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification & Safety</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li><span style={{ display: 'inline-flex', gap: '4px' }}>Verification Badges</span></li>
                  <li><span>Reputation Scoring system</span></li>
                  <li><span>Terms & Privacy Policy</span></li>
                </ul>
              </div>
            </div>
            <div style={{ maxWidth: '1200px', margin: '30px auto 0', paddingSelf: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <p>&copy; {new Date().getFullYear()} EventHub Inc. All rights reserved.</p>
              <p>Designed for Accra, Kumasi, and dynamic growth in Africa.</p>
            </div>
          </footer>
        </div>

        {/* Global state-management bootstrapper script to load user session client-side */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              fetch('/api/auth/me')
                .then(res => res.json())
                .then(data => {
                  if (data.authenticated && data.user) {
                    const nav = document.getElementById('auth-nav-container');
                    if (nav) {
                      let dashboardLink = '/dashboard';
                      if (data.user.role === 'VENDOR' && data.user.vendorId) {
                        dashboardLink = '/vendors/' + data.user.vendorId;
                      } else if (data.user.role === 'ADMIN') {
                        dashboardLink = '/admin/verification';
                      }
                      nav.innerHTML = \`
                        <a href="\${dashboardLink}" style="font-size: 0.9rem; color: var(--text-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 8px;" id="nav-dashboard-link">
                          <span>\${data.user.fullName}</span>
                          <span class="badge badge-basic" style="font-size: 0.6rem; padding: 2px 6px;">\${data.user.role}</span>
                        </a>
                        <button onclick="logout()" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 12px; border-radius: var(--radius-md); font-size: 0.8rem; cursor: pointer; transition: var(--transition-fast);" id="nav-logout-btn">
                          Logout
                        </button>
                      \`;
                    }
                  }
                })
                .catch(err => console.error(err));
            })();

            function logout() {
              fetch('/api/auth/logout', { method: 'POST' })
                .then(() => {
                  window.location.href = '/';
                });
            }
          `
        }} />
      </body>
    </html>
  );
}
