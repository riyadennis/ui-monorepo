import { NavLink, Outlet } from 'react-router-dom';
import { profile, socials } from './content';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/playground', label: 'Playground' },
  { to: '/blog', label: 'Blog' },
];

export function Layout() {
  return (
    <div style={page}>
      <header style={header}>
        <NavLink to="/" style={{ ...brand, textDecoration: 'none' }}>
          {profile.name}
        </NavLink>
        <nav style={nav}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} style={navLinkStyle}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main style={main}>
        <Outlet />
      </main>

      <footer style={footer}>
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer" style={footerLink}>
              {s.label}
            </a>
          ))}
        </span>
      </footer>
    </div>
  );
}

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 15,
    color: isActive ? '#646cff' : '#555',
  };
}

const page: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#1a1a1a',
  maxWidth: 760,
  margin: '0 auto',
  padding: '0 1.5rem',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const header: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.75rem',
  padding: '1.5rem 0',
  borderBottom: '1px solid #eee',
};

const brand: React.CSSProperties = { fontWeight: 800, fontSize: 18, color: '#1a1a1a' };

const nav: React.CSSProperties = { display: 'flex', gap: '1.25rem', flexWrap: 'wrap' };

const main: React.CSSProperties = { flex: 1, padding: '2rem 0' };

const footer: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.75rem',
  padding: '1.5rem 0',
  borderTop: '1px solid #eee',
  color: '#777',
  fontSize: 14,
};

const footerLink: React.CSSProperties = { color: '#646cff', textDecoration: 'none' };
