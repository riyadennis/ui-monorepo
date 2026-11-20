import { posts } from '../content';

export function Blog() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginTop: 0 }}>Blog</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {posts.map((post) => (
          <a key={post.href} href={post.href} target="_blank" rel="noreferrer" style={row}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', color: '#1a1a1a' }}>{post.title}</h3>
              {post.summary && <p style={{ margin: 0, color: '#555' }}>{post.summary}</p>}
            </div>
            <time style={{ color: '#888', fontSize: 14, whiteSpace: 'nowrap' }}>
              {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </time>
          </a>
        ))}
      </div>
    </div>
  );
}

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '1rem',
  padding: '1rem 1.25rem',
  border: '1px solid #eee',
  borderRadius: 10,
  textDecoration: 'none',
};
