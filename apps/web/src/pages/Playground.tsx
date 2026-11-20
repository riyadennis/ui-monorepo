import { Link } from 'react-router-dom';

const tools = [
  {
    to: '/playground/rego',
    title: 'Rego generator',
    description: 'Build idiomatic Rego v1 policy source from allow/deny conditions.',
  },
  {
    to: '/playground/pbac',
    title: 'pbac policy API',
    description: 'Create, list, evaluate, and delete policies against the pbac REST API.',
  },
];

export function Playground() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Playground</h1>
      <p style={{ color: '#555' }}>Interactive demos built on this monorepo's packages.</p>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {tools.map((t) => (
          <Link key={t.to} to={t.to} style={card}>
            <h3 style={{ margin: '0 0 0.4rem', color: '#1a1a1a' }}>{t.title} →</h3>
            <p style={{ margin: 0, color: '#555', lineHeight: 1.6 }}>{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  border: '1px solid #eee',
  borderRadius: 10,
  padding: '1.25rem',
  textDecoration: 'none',
};
