import { experience, profile, skills } from '../content';

export function About() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginTop: 0 }}>About</h1>
      <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#333' }}>{profile.bio}</p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem' }}>Skills</h2>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: 0, listStyle: 'none' }}>
        {skills.map((s) => (
          <li key={s} style={tag}>{s}</li>
        ))}
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem' }}>Experience</h2>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {experience.map((e) => (
          <div key={`${e.company}-${e.period}`} style={{ borderLeft: '2px solid #646cff', paddingLeft: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <strong>{e.role} · {e.company}</strong>
              <span style={{ color: '#888', fontSize: 14 }}>{e.period}</span>
            </div>
            <p style={{ margin: '0.4rem 0 0', color: '#444', lineHeight: 1.6 }}>{e.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const tag: React.CSSProperties = {
  background: '#f0f0ff',
  color: '#4a4ac0',
  padding: '0.3rem 0.7rem',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
};
