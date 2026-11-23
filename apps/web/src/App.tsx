import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Projects } from './pages/Projects';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Playground } from './pages/Playground';
import { RegoPanel } from './RegoPanel';
import { PbacPanel } from './PbacPanel';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/playground/rego" element={<RegoPanel />} />
        <Route path="/playground/pbac" element={<PbacPanel />} />

        {/* Legacy redirects */}
        <Route path="/rego" element={<Navigate to="/playground/rego" replace />} />
        <Route path="/pbac" element={<Navigate to="/playground/pbac" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
