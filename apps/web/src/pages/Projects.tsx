import { Link } from 'react-router-dom';
import { projects } from '../content';

export function Projects() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Projects</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {projects.map((p) => (
          <div key={p.title} style={card}>
            <h3 style={{ margin: '0 0 0.4rem' }}>{p.title}</h3>
            <p style={{ margin: '0 0 0.75rem', color: '#444', lineHeight: 1.6 }}>{p.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {p.tech.map((t) => (
                <span key={t} style={tag}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {p.demo && <Link to={p.demo} style={link}>Try it →</Link>}
              {p.href && <a href={p.href} target="_blank" rel="noreferrer" style={link}>Source</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { border: '1px solid #eee', borderRadius: 10, padding: '1.25rem' };

const tag: React.CSSProperties = {
  background: '#f4f4f5',
  color: '#555',
  padding: '0.2rem 0.6rem',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};

const link: React.CSSProperties = { color: '#646cff', textDecoration: 'none', fontWeight: 600 };
