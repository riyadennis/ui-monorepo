import { useMemo, useState } from 'react';
import { PbacApiError, PbacClient } from '@ui-monorepo/pbac';
import type { Definition, Effect, Op, Policy, Rule } from '@ui-monorepo/pbac';
import { Button } from '@ui-monorepo/ui';

const client = new PbacClient();

const OPS: Op[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'matches', 'exists'];

interface DraftRule {
  effect: Effect;
  field: string;
  op: Op;
  value: string;
}

/** Best-effort parse: valid JSON (number/bool/array/string) or a bare string. */
function parseValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === '') return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function describeError(err: unknown): string {
  if (err instanceof PbacApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return String(err);
}

export function PbacPanel() {
  const [name, setName] = useState('Admin or Editor');
  const [description, setDescription] = useState('Allow admins, or editors on non-delete actions');
  const [module, setModule] = useState('authz');
  const [defaultDecision, setDefaultDecision] = useState<'deny' | 'allow'>('deny');
  const [rules, setRules] = useState<DraftRule[]>([
    { effect: 'allow', field: 'role', op: 'eq', value: 'admin' },
  ]);

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selected, setSelected] = useState<Policy | null>(null);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const [evalInput, setEvalInput] = useState('{\n  "role": "admin",\n  "action": "delete"\n}');
  const [evalQuery, setEvalQuery] = useState('');
  const [evalResult, setEvalResult] = useState<string | null>(null);

  const definition = useMemo<Definition>(
    () => ({
      module,
      default: defaultDecision,
      rules: rules.map<Rule>((r) => ({
        effect: r.effect,
        when:
          r.op === 'exists'
            ? { field: r.field, op: r.op }
            : { field: r.field, op: r.op, value: parseValue(r.value) },
      })),
    }),
    [module, defaultDecision, rules],
  );

  async function run(action: () => Promise<string>) {
    setBusy(true);
    setStatus(null);
    try {
      setStatus({ text: await action(), error: false });
    } catch (err) {
      setStatus({ text: describeError(err), error: true });
    } finally {
      setBusy(false);
    }
  }

  const createPolicy = () =>
    run(async () => {
      const policy = await client.createPolicy({ name, description, definition });
      setSelected(policy);
      setPolicies((prev) => [policy, ...prev.filter((p) => p.id !== policy.id)]);
      return `Created policy ${policy.id}`;
    });

  const listPolicies = () =>
    run(async () => {
      const result = await client.listPolicies();
      setPolicies(result);
      return `Loaded ${result.length} policies`;
    });

  const deletePolicy = (id: string) =>
    run(async () => {
      await client.deletePolicy(id);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
      return `Deleted policy ${id}`;
    });

  const evaluate = () =>
    run(async () => {
      if (!selected) throw new Error('Select or create a policy first.');
      let input: Record<string, unknown>;
      try {
        input = JSON.parse(evalInput);
      } catch {
        throw new Error('Input is not valid JSON.');
      }
      const res = await client.evaluate(selected.id, {
        input,
        query: evalQuery.trim() || undefined,
      });
      setEvalResult(JSON.stringify(res, null, 2));
      return `Evaluated: allow = ${res.allow}`;
    });

  function updateRule(i: number, patch: Partial<DraftRule>) {
    setRules((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2>pbac policy API</h2>
      <p style={{ color: '#666' }}>
        Builds a structured <code>definition</code> and calls the pbac REST API via the{' '}
        <code>/api</code> dev proxy.
      </p>

      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" style={input} />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="description"
          style={input}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={module} onChange={(e) => setModule(e.target.value)} placeholder="module" style={{ ...input, flex: 1 }} />
          <select value={defaultDecision} onChange={(e) => setDefaultDecision(e.target.value as 'deny' | 'allow')} style={input}>
            <option value="deny">default: deny</option>
            <option value="allow">default: allow</option>
          </select>
        </div>
      </div>

      <h3 style={{ marginBottom: '0.5rem' }}>Rules</h3>
      {rules.map((rule, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'center' }}>
          <select value={rule.effect} onChange={(e) => updateRule(i, { effect: e.target.value as Effect })} style={input}>
            <option value="allow">allow</option>
            <option value="deny">deny</option>
          </select>
          <input value={rule.field} onChange={(e) => updateRule(i, { field: e.target.value })} placeholder="field" style={{ ...input, width: 110 }} />
          <select value={rule.op} onChange={(e) => updateRule(i, { op: e.target.value as Op })} style={input}>
            {OPS.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          <input
            value={rule.value}
            onChange={(e) => updateRule(i, { value: e.target.value })}
            placeholder={rule.op === 'exists' ? '(no value)' : 'value'}
            disabled={rule.op === 'exists'}
            style={{ ...input, flex: 1 }}
          />
          <button onClick={() => setRules((prev) => prev.filter((_, j) => j !== i))} style={remove} aria-label="remove rule">
            ×
          </button>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() => setRules((prev) => [...prev, { effect: 'allow', field: '', op: 'eq', value: '' }])}
      >
        Add rule
      </Button>

      <h3 style={{ margin: '1.25rem 0 0.5rem' }}>Request body</h3>
      <pre style={pre}>{JSON.stringify({ name, description, definition }, null, 2)}</pre>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <Button onClick={createPolicy} disabled={busy}>Create policy</Button>
        <Button variant="secondary" onClick={listPolicies} disabled={busy}>List policies</Button>
      </div>

      {status && (
        <p style={{ color: status.error ? '#c0392b' : '#1e7e34', marginTop: '0.75rem' }}>{status.text}</p>
      )}

      {policies.length > 0 && (
        <ul style={{ paddingLeft: '1.1rem' }}>
          {policies.map((p) => (
            <li key={p.id} style={{ marginBottom: '0.3rem' }}>
              <button onClick={() => setSelected(p)} style={linkButton}>
                {p.name}
              </button>{' '}
              <span style={{ color: '#888', fontSize: 12 }}>{p.id}</span>{' '}
              <button onClick={() => deletePolicy(p.id)} style={remove} aria-label="delete policy">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Selected: {selected.name}</h3>
          {selected.content && (
            <>
              <p style={{ color: '#666', margin: '0 0 0.25rem' }}>Compiled Rego (from the server):</p>
              <pre style={pre}>{selected.content}</pre>
            </>
          )}

          <h3 style={{ margin: '1rem 0 0.5rem' }}>Evaluate</h3>
          <textarea value={evalInput} onChange={(e) => setEvalInput(e.target.value)} rows={4} style={{ ...input, width: '100%', fontFamily: 'monospace' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              value={evalQuery}
              onChange={(e) => setEvalQuery(e.target.value)}
              placeholder={`query (default data.${selected.module}.allow)`}
              style={{ ...input, flex: 1 }}
            />
            <Button onClick={evaluate} disabled={busy}>Evaluate</Button>
          </div>
          {evalResult && <pre style={pre}>{evalResult}</pre>}
        </div>
      )}
    </section>
  );
}

const input: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14,
};

const remove: React.CSSProperties = {
  border: 'none',
  background: 'none',
  color: '#c0392b',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
};

const linkButton: React.CSSProperties = {
  border: 'none',
  background: 'none',
  color: '#646cff',
  cursor: 'pointer',
  fontSize: 14,
  padding: 0,
};

const pre: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#d4d4d4',
  padding: '1rem',
  borderRadius: 8,
  fontSize: 13,
  overflowX: 'auto',
};
