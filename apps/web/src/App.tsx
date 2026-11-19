import { RegoPanel } from './RegoPanel';

export function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>UI Monorepo</h1>
      <p>Shared components live in <code>@ui-monorepo/ui</code>.</p>
      <RegoPanel />
    </main>
  );
}
