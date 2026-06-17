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
          {/* Mobile Navigation Backdrop */}
          <div id="mobile-nav-backdrop" className="mobile-backdrop" />

          {/* Customer Profile Drawer Backdrop */}
          <div id="profile-drawer-backdrop" className="mobile-backdrop filters-backdrop" />

          {/* Customer Profile Sliding Drawer Panel */}
          <div id="profile-drawer" className="profile-drawer glass-panel">
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Account Profile</h3>
                <button id="profile-drawer-close-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', transition: 'var(--transition-fast)' }}>✕</button>
              </div>              {/* Identity Header */}
              <div id="drawer-user-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
                <div id="drawer-avatar" style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'linear-gradient(to right, #6366f1, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  EK
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 id="drawer-name" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Loading...
                  </h4>
                  <p id="drawer-email" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Loading...
                  </p>
                </div>
              </div>

              {/* Stats Metrics Blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Account Status</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span> Active
                  </span>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>User Role</span>
                  <span id="drawer-role-badge" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>CUSTOMER</span>
                </div>
              </div>

              {/* Action Menu Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <a id="drawer-dashboard-btn" href="/dashboard" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
                  <span>🚀 Go to Dashboard</span>
                  <span>&rarr;</span>
                </a>
                <a href="/search" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
                  <span>🔍 Browse Vendors</span>
                  <span>&rarr;</span>
                </a>
                <a href="/requests/new" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
                  <span>🎟️ Create Event Request</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </div>

            {/* Logout Panel Element Footer */}
            <button id="profile-drawer-signout-btn" style={{ width: '100%', marginTop: 'auto', padding: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', color: '#f87171', fontWeight: 600, borderRadius: 'var(--radius-md)', fontSize: '0.88rem', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
              Sign Out Session
            </button>
          </div>

          {/* Header */}
          <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', background: 'linear-gradient(to right, #fbbf24, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  EventHub
                </span>
                <span className="badge badge-business" style={{ fontSize: '0.65rem' }}>Beta</span>
              </Link>

              {/* Hamburger Button for Mobile */}
              <button className="hamburger-btn" id="mobile-menu-btn" aria-label="Toggle navigation menu">
                <span></span>
                <span></span>
                <span></span>
              </button>

              {/* Navigation Links */}
              <nav className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
            <div style={{ maxWidth: '1200px', margin: '30px auto 0', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
                      
                      // Calculate initials
                      const initials = data.user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      
                      // Inject Apple-style profile button in header
                      nav.innerHTML = \`
                        <button onclick="openProfileDrawer()" style="background: transparent; border: none; font-size: 0.9rem; color: var(--text-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 0;" id="nav-dashboard-btn">
                          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(to right, #6366f1, #fbbf24); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #fff; font-weight: 800;">
                            \${initials}
                          </div>
                          <div style="text-align: left; display: flex; flex-direction: column;">
                            <span class="user-fullname" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">\${data.user.fullName}</span>
                            <span class="user-role" style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">\${data.user.role}</span>
                          </div>
                        </button>
                      \`;
                      
                      // Populate the Profile Drawer Panel dynamically
                      const drawerAvatar = document.getElementById('drawer-avatar');
                      const drawerName = document.getElementById('drawer-name');
                      const drawerEmail = document.getElementById('drawer-email');
                      const drawerRoleBadge = document.getElementById('drawer-role-badge');
                      const drawerDashboardBtn = document.getElementById('drawer-dashboard-btn');
                      
                      if (drawerAvatar) drawerAvatar.innerText = initials;
                      if (drawerName) drawerName.innerText = data.user.fullName;
                      if (drawerEmail) drawerEmail.innerText = data.user.email || (data.user.username ? (data.user.username + '@eventhub.com') : 'user@eventhub.com');
                      if (drawerRoleBadge) drawerRoleBadge.innerText = data.user.role;
                      if (drawerDashboardBtn) drawerDashboardBtn.href = dashboardLink;
                    }
                  }
                })
                .catch(err => console.error(err));
            })();

            // Mobile Menu Toggle logic
            (function() {
              const menuBtn = document.getElementById('mobile-menu-btn');
              const navMenu = document.querySelector('.nav-menu');
              const backdrop = document.getElementById('mobile-nav-backdrop');

              function toggleMenu() {
                menuBtn.classList.toggle('active');
                navMenu.classList.toggle('mobile-open');
                backdrop.classList.toggle('active');
                
                if (navMenu.classList.contains('mobile-open')) {
                  document.body.style.overflow = 'hidden';
                } else {
                  document.body.style.overflow = '';
                }
              }

              if (menuBtn && navMenu && backdrop) {
                menuBtn.addEventListener('click', toggleMenu);
                backdrop.addEventListener('click', toggleMenu);

                // Event delegation: close drawer when links/buttons inside it are clicked
                navMenu.addEventListener('click', function(e) {
                  if (e.target.closest('a') || e.target.closest('button')) {
                    if (navMenu.classList.contains('mobile-open')) {
                      toggleMenu();
                    }
                  }
                });
              }
            })();

            // Profile Drawer Toggle logic
            (function() {
              const profileDrawer = document.getElementById('profile-drawer');
              const profileBackdrop = document.getElementById('profile-drawer-backdrop');
              const closeBtn = document.getElementById('profile-drawer-close-btn');
              const signoutBtn = document.getElementById('profile-drawer-signout-btn');

              window.openProfileDrawer = function() {
                profileDrawer.classList.add('open');
                profileBackdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
              };

              window.closeProfileDrawer = function() {
                profileDrawer.classList.remove('open');
                profileBackdrop.classList.remove('active');
                document.body.style.overflow = '';
              };

              if (profileBackdrop) profileBackdrop.addEventListener('click', window.closeProfileDrawer);
              if (closeBtn) closeBtn.addEventListener('click', window.closeProfileDrawer);
              if (signoutBtn) signoutBtn.addEventListener('click', logout);
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
