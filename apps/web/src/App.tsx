import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { RegoPanel } from './RegoPanel';
import { PbacPanel } from './PbacPanel';

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>UI Monorepo</h1>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
        <NavLink to="/rego" style={navLinkStyle}>Rego generator</NavLink>
        <NavLink to="/pbac" style={navLinkStyle}>pbac policy API</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/rego" replace />} />
        <Route path="/rego" element={<RegoPanel />} />
        <Route path="/pbac" element={<PbacPanel />} />
      </Routes>
    </div>
  );
}

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    textDecoration: 'none',
    fontWeight: 600,
    color: isActive ? '#646cff' : '#555',
    borderBottom: isActive ? '2px solid #646cff' : '2px solid transparent',
    paddingBottom: '0.75rem',
    marginBottom: '-0.76rem',
  };
}
