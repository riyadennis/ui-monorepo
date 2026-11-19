import { useState } from 'react';
import { Button } from '@ui-monorepo/ui';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 480 }}>
      <h1>UI Monorepo</h1>
      <p>Shared components live in <code>@ui-monorepo/ui</code>.</p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button onClick={() => setCount((c) => c + 1)}>Count is {count}</Button>
        <Button variant="secondary" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>
    </main>
  );
}
