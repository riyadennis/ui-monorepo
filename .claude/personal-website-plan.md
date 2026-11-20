# Plan: Turn `ui-monorepo` into a Personal Website

_Last updated: 2026-11-20_

## 1. Vision

Evolve this monorepo into a personal website + portfolio for Riya Dennis. The
two interactive tools already built (the **Rego generator** and the **pbac
policy API playground**) become live, hands-on project demos — the differentiator
versus a static CV site. The site shows *and* lets visitors *use* the work.

## 2. Current state

- **Monorepo** (npm workspaces): `apps/web` + `packages/{ui,rego,pbac}`.
- `apps/web`: Vite + React 18 + react-router, two pages: `/rego`, `/pbac`.
- `packages/ui`: `Button` (seed of a design system).
- `packages/rego`: dependency-free Rego v1 source builder.
- `packages/pbac`: typed REST client for the pbac Go API (reached in dev via a
  Vite `/api` → `localhost:8080` proxy).

The foundation is sound; this is mostly **content, design, and deployment** work,
not re-architecture. The monorepo stays — the website is `apps/web`.

## 3. Target information architecture

| Route | Purpose |
| --- | --- |
| `/` | Home — hero, one-line intro, featured projects, links |
| `/about` | Bio, skills, experience, résumé download |
| `/projects` | Grid of project cards (pbac, ui-monorepo, others) |
| `/playground` | Index of the interactive tools |
| `/playground/rego` | Rego generator (moved from `/rego`) |
| `/playground/pbac` | pbac policy API demo (moved from `/pbac`) |
| `/contact` | Email + GitHub + LinkedIn |
| `/blog`, `/blog/:slug` | _(optional, Phase 6)_ writing, MDX-sourced |

Redirects: keep `/rego` → `/playground/rego`, `/pbac` → `/playground/pbac` so
existing links don't break.

## 4. Design system (`packages/ui`)

Grow `@ui-monorepo/ui` from one component into a small design system so the whole
site is consistent and the package stays meaningful:

- **Theme tokens**: colors, spacing, typography, radius (CSS variables). Dark mode.
- **Layout primitives**: `Container`, `Stack`, `Grid`, `Card`.
- **Navigation**: `Header`/`NavBar`, `Footer`.
- **Content**: `Heading`, `Text`, `Prose` (for markdown), `Tag`/`Badge`, `Link`.
- Keep `Button`; add `variant`s (ghost, link) and sizes.
- **Styling approach — decision needed (see §8).** Recommendation: **CSS Modules
  + CSS variables** (zero new build deps, already works with Vite). Tailwind is
  the alternative if you want utility-first velocity.

## 5. Content to produce (non-code)

- Short bio (hero) + longer about-page narrative.
- Project entries: title, summary, tech, links, screenshot/thumbnail. Seed with
  **pbac**, **ui-monorepo**, and the two playground tools.
- Résumé PDF in `apps/web/public/`.
- Social links + contact email.
- Favicon / OG image / site metadata (title, description).

## 6. Phased delivery

**Phase 0 — Foundation**
- Add a `Layout` (header nav + footer + `<Outlet/>`), move routes under it.
- Add `public/` assets: favicon, `robots.txt`, résumé placeholder.
- Set `<title>`/meta in `index.html`.

**Phase 1 — Design system**
- Theme tokens + `ThemeProvider` (dark mode toggle) in `packages/ui`.
- Build layout/content primitives listed in §4; refactor existing panels to use them.

**Phase 2 — Core pages**
- Home, About, Projects (data-driven from a `projects.ts` list), Contact.

**Phase 3 — Playground reorg**
- Move `RegoPanel`/`PbacPanel` under `/playground/*`; add a playground index.
- Add legacy redirects.

**Phase 4 — pbac in production** _(see §7 — this is the main technical risk)_
- Make the pbac playground degrade gracefully when no backend is reachable.

**Phase 5 — SEO, polish, a11y**
- Per-route `<title>`/meta (react-helmet or a small hook), OG tags, sitemap.
- Responsive pass, keyboard nav, color-contrast check, Lighthouse.

**Phase 6 — Deployment + CI** _(can run in parallel from Phase 2)_
- Static host + GitHub Actions build/deploy (see §9).

**Phase 7 — Stretch**
- MDX blog, view transitions, analytics, contact-form backend.

## 7. The pbac backend problem (important)

In dev, the browser reaches the pbac API through the Vite `/api` proxy to
`localhost:8080`. **That proxy does not exist in a static production build**, and
the Go API + Postgres aren't public. Options for the deployed site:

- **(A) Graceful degradation (recommended first):** detect an unreachable API and
  show a "this demo needs the local pbac server running — here's how" state. The
  Rego generator still works fully (no backend). Lowest effort, honest.
- **(B) Host the pbac API publicly** (Fly.io/Render + managed Postgres) and point
  the prod client at its URL via an env var (`VITE_PBAC_BASE_URL`). Best UX, but
  now you're running/securing a public write-API (add read-only mode / auth /
  rate limiting first).
- **(C) In-browser mock:** ship a canned client so the UI is explorable without
  any backend. Good for a portfolio "feel"; not the real thing.

Recommendation: **A for launch, B as a fast-follow** with the API locked down.
Either way, make the client base URL configurable via `import.meta.env`.

## 8. Open decisions (please confirm)

1. **Hosting**: Cloudflare Pages / Vercel / Netlify / GitHub Pages? _(rec: Vercel
   or Cloudflare Pages — zero-config for a Vite SPA, free tier, easy custom domain)_
2. **Custom domain**: do you have one (e.g. `riyadennis.dev`)?
3. **Styling**: CSS Modules + tokens _(rec)_ vs Tailwind.
4. **Blog**: include now, later, or not at all?
5. **pbac in prod**: option A, B, or C from §7.

## 9. Deployment & CI sketch

- Vite build output is static (`apps/web/dist`) → any static host.
- **GitHub Actions**: on push to `main`, `npm ci` → `npm run build` → deploy
  `apps/web/dist`. Host-native Git integration (Vercel/Cloudflare) can replace the
  deploy step entirely.
- SPA routing needs a history fallback (rewrite all paths to `index.html`) —
  built-in on Vercel/Netlify/Cloudflare; needs a `404.html` trick on GitHub Pages.
- Add `VITE_PBAC_BASE_URL` as a build-time env var for the prod API target.

## 10. Risks / notes

- **Scope creep** — the phases are independently shippable; launch after Phase 2–3
  with a minimal site, then iterate.
- **pbac security** — do not expose a public write-API without auth/rate limiting.
- **SEO of an SPA** — fine for a portfolio; if organic search matters, consider SSG
  (Vite SSG / Astro) later, but that's a bigger move.
- **Design debt** — invest in the `ui` tokens early so pages stay consistent.

## 11. Suggested first slice (if you want to start immediately)

Phase 0 + a minimal Home/About + nav/footer in `packages/ui`, deployed to a host
with graceful pbac degradation. That's a real, shareable personal site; everything
else is iteration.
