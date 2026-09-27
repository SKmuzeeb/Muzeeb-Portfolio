# Portfolio — Mohammad Muzeeb Shaik

A dark, cinematic portfolio for a **Full Stack Developer** — React.js, Node.js,
PostgreSQL, AWS, REST APIs and third-party integrations.

Built with Vite, React 19, Tailwind CSS v4, React Router, Framer Motion and
React Three Fiber.

---

## Getting started

```bash
npm install
npm run dev        # development server
npm run build      # production build
npm run preview    # serve the production build
npm run lint       # eslint
```

---

## Before you deploy

Everything that is intentionally blank is marked in `src/data/site.js`. Nothing
on this site is invented — blank values render as neutral text rather than dead
links or fake data.

| What | Where | Current value |
| --- | --- | --- |
| Email address | `profile.email` | `null` — every CTA routes to `/contact` until set |
| LinkedIn / GitHub | `socials[].href` | `null` — rendered as plain labels, not links |
| Resume PDF | `resume.file` | `null` — `/resume` prints to a clean A4 document instead |
| Employment dates | `experience[].period` | `null` — dates appear automatically once set |

```js
// src/data/site.js
export const profile = { /* … */ email: 'you@example.com' }
export const resume  = { /* … */ file: '/resume.pdf' }   // drop the PDF in /public
export const socials = [
  { label: 'LinkedIn', handle: '@you', href: 'https://linkedin.com/in/you', icon: 'linkedin' },
  { label: 'GitHub',   handle: '@you', href: 'https://github.com/you',     icon: 'github' },
]
```

---

## How the imagery works

The site ships **no bitmap assets**. Every diagram is an SVG generated from the
project data itself, which means it is resolution-independent, costs a few
kilobytes, and can never drift out of sync with the write-up.

```
src/lib/
  diagram.js              render() — memoised, returns a data URI
  diagram/primitives.js   frame, node, arrows, blueprint grid, motion
  diagram/schemas.js      8 diagram types
  prng.js                 seeded PRNG (deterministic output)
  palettes.js             accent + mood colour systems
```

Diagram types: `layered`, `pipeline`, `modules`, `integration`, `dataflow`,
`endpoints`, `implementation`, `phases`.

`projectDiagrams(project)` in `src/data/projects/index.js` derives all ten
diagrams for a case study from the project record, so adding a project to
`src/data/projects/` automatically produces a complete page.

---

## Project structure

```
src/
  components/
    three/HeroScene.jsx   WebGL service-mesh hero (lazy loaded)
    ui/                   Reveal/RevealCard, Parallax, DiagramImage, TechBadge
    ProjectStack.jsx      a project's stack, grouped by layer
    StackLayers.jsx       animated full-stack column (About hero)
    ArchitectureFlow.jsx  animated request path for the Tech Stack page
    SystemWalkthrough.jsx stepped request walkthrough
    ProfileModalProvider  quick technical profile sheet
  lib/
    logos.js              official brand marks (Simple Icons, CC0) + aliases
    logos.generated.js    GENERATED — do not hand-edit, see scripts/gen-logos.cjs
    covers.js             per-project cover art (logos / wordmark / glyph)
    diagram.js            architecture diagram generator
  data/
    site.js               identity, nav, contact, resume, socials
    categories.js         project categories + technology map
    architecture.js       architecture patterns
    about.js              bio, proficiency, approach, exploring, experience
    projects/             one file per case study + index
  lib/                    diagram generator, pointer store, context
  pages/                  one directory per route, lazy loaded
```

Routes: `/` · `/about` · `/experience` · `/projects` · `/projects/:slug` ·
`/tech-stack` · `/case-studies` · `/contact` · `/resume` · `*` (404)

---

## Verification

```bash
node scripts/check-data.mjs     # data integrity + all 50 diagrams as valid XML
node scripts/check-routes.mjs   # every route serves; no leftover terminology
node scripts/fix-imports.mjs    # repair relative import depths after a file move
```

`check-data.mjs` also enforces the honesty rules: no invented metrics, no
percentage skill bars, no fabricated URLs, and every category filter populated.

---

## Performance notes

- three.js (~190 kB gzipped) is lazy loaded and only fetched on the home page.
- All other routes are code-split via `React.lazy`.
- Diagrams are SVG data URIs — no image requests, no decode cost.
- The WebGL render loop suspends when the hero scrolls out of view or the tab
  is hidden.
- Hover effects (the request-flow preview) are never mounted on touch devices.
- `prefers-reduced-motion` disables parallax, reveals and the walkthrough
  auto-advance throughout.

## Deployment note

The site uses client-side routing. Configure your host to fall back to
`index.html` for unknown paths (`vercel.json`, Netlify `_redirects`, or
`try_files $uri /index.html` on nginx). `vite preview` already does this.
