import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { posts } from '../content';
import { getPostBody } from '../blog';

export function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);
  const body = slug ? getPostBody(slug) : undefined;

  if (!post || !body) {
    return (
      <div>
        <h1>Post not found</h1>
        <Link to="/blog" style={linkStyle}>← Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="prose">
      <Link to="/blog" style={linkStyle}>← Blog</Link>
      <h1 style={{ marginBottom: '0.25rem' }}>{post.title}</h1>
      <p style={{ color: '#888', marginTop: 0 }}>
        {new Date(post.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>

      {post.originalUrl && (
        <p style={{ color: '#888', fontSize: 14, marginTop: '2.5rem' }}>
          Originally published at{' '}
          <a href={post.originalUrl} target="_blank" rel="noreferrer" style={linkStyle}>
            riyadennis.com
          </a>
          .
        </p>
      )}
    </article>
  );
}

const linkStyle: React.CSSProperties = { color: '#646cff', textDecoration: 'none', fontWeight: 600 };
