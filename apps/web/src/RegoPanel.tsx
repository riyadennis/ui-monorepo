import { useMemo, useState } from 'react';
import { regoPolicy } from '@ui-monorepo/rego';
import { Button } from '@ui-monorepo/ui';

export function RegoPanel() {
  const [packageName, setPackageName] = useState('authz');
  const [conditions, setConditions] = useState<string[]>([
    'input.user.role == "admin"',
  ]);
  const [draft, setDraft] = useState('');

  const source = useMemo(() => {
    try {
      const policy = regoPolicy(packageName).default('allow', false);
      for (const condition of conditions) {
        policy.allowIf(condition);
      }
      return policy.build();
    } catch (err) {
      return `# ${(err as Error).message}`;
    }
  }, [packageName, conditions]);

  function addCondition() {
    const trimmed = draft.trim();
    if (trimmed) {
      setConditions((prev) => [...prev, trimmed]);
      setDraft('');
    }
  }

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2>Rego generator</h2>
      <p style={{ color: '#666' }}>
        Built live from <code>@ui-monorepo/rego</code>. Each condition becomes an{' '}
        <code>allow if</code> block (logically ORed).
      </p>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        Package name{' '}
        <input
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          style={inputStyle}
        />
      </label>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <input
          value={draft}
          placeholder='e.g. input.method == "GET"'
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCondition()}
          style={{ ...inputStyle, flex: 1 }}
        />
        <Button onClick={addCondition}>Add allow</Button>
      </div>

      {conditions.length > 0 && (
        <ul style={{ paddingLeft: '1.1rem', margin: '0 0 1rem' }}>
          {conditions.map((condition, i) => (
            <li key={i} style={{ fontFamily: 'monospace', fontSize: 13 }}>
              {condition}{' '}
              <button
                onClick={() => setConditions((prev) => prev.filter((_, j) => j !== i))}
                style={removeStyle}
                aria-label="remove condition"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <pre style={preStyle}>{source}</pre>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14,
};

const removeStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  color: '#c0392b',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
};

const preStyle: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#d4d4d4',
  padding: '1rem',
  borderRadius: 8,
  fontSize: 13,
  overflowX: 'auto',
};
