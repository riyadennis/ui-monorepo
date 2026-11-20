import { Link } from 'react-router-dom';
import { profile, projects } from '../content';

export function Home() {
  const featured = projects.slice(0, 2);

  return (
    <div>
      <section style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: '#646cff', fontWeight: 600, margin: 0 }}>{profile.tagline}</p>
        <h1 style={{ fontSize: '2.4rem', margin: '0.5rem 0 1rem' }}>{profile.name}</h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#333' }}>{profile.bio}</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
          <Link to="/projects" style={cta}>View projects →</Link>
          <Link to="/about" style={ctaSecondary}>About me</Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.3rem' }}>Featured</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {featured.map((p) => (
            <div key={p.title} style={card}>
              <h3 style={{ margin: '0 0 0.4rem' }}>{p.title}</h3>
              <p style={{ margin: '0 0 0.6rem', color: '#444', lineHeight: 1.6 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {p.demo && <Link to={p.demo} style={link}>Try it →</Link>}
                {p.href && <a href={p.href} target="_blank" rel="noreferrer" style={link}>Source</a>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const cta: React.CSSProperties = {
  background: '#646cff',
  color: '#fff',
  padding: '0.55rem 1.1rem',
  borderRadius: 6,
  textDecoration: 'none',
  fontWeight: 600,
};

const ctaSecondary: React.CSSProperties = {
  color: '#646cff',
  padding: '0.55rem 1.1rem',
  borderRadius: 6,
  textDecoration: 'none',
  fontWeight: 600,
  border: '1px solid #646cff',
};

const card: React.CSSProperties = {
  border: '1px solid #eee',
  borderRadius: 10,
  padding: '1.25rem',
};

const link: React.CSSProperties = { color: '#646cff', textDecoration: 'none', fontWeight: 600 };
