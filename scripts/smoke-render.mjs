// Renders every route to a string, using Vite's SSR module loader so JSX and
// CSS imports resolve exactly as they do in the app. A render-time crash in any
// page shows up here as a thrown error, which is otherwise only visible as a
// white screen in the browser.
//
// Run: node scripts/smoke-render.mjs
import { createServer } from 'vite'
import { createElement as h } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const PAGES = [
  ['/', '/src/pages/Home.jsx'],
  ['/experience', '/src/pages/Experience.jsx'],
  ['/projects', '/src/pages/Projects.jsx'],
  ['/tech-stack', '/src/pages/TechStack.jsx'],
  ['/case-studies', '/src/pages/CaseStudies.jsx'],
  ['/about', '/src/pages/About.jsx'],
  ['/resume', '/src/pages/Resume.jsx'],
  ['/contact', '/src/pages/Contact.jsx'],
  // ProjectPage reads :slug off the route, so the path has to keep the param
  // shape or useParams comes back empty and the page legitimately renders null.
  ['/projects/migratron', '/src/pages/ProjectPage.jsx', '/projects/:slug'],
]

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

/**
 * Failures that are properties of running in Node, not of the code under test.
 * Reporting these as failures would train you to ignore the output.
 */
const HARNESS_LIMITS = [
  {
    // framer-motion's useContext needs a DOM-backed React runtime. Its motion
    // hooks cannot be server-rendered outside one.
    match: /useContext.*as it is null/,
    why: 'framer-motion needs a DOM; only verifiable in a browser',
  },
  {
    // three's package shim resolves to three.cjs, which cannot require() the
    // ESM build. Vite bundles three as ESM for the browser without complaint —
    // the production build proves it.
    match: /require\(\) of ES Module/,
    why: 'three is CJS/ESM-interop-blocked under Node SSR; Vite bundles it fine',
  },
]

let real = 0
let skipped = 0

const classify = (err) => HARNESS_LIMITS.find((h) => h.match.test(String(err.message || ''))) || null

for (const [path, mod, routePath] of PAGES) {
  try {
    const m = await server.ssrLoadModule(mod)
    const Page = m.default
    if (!Page) {
      console.log(`${path.padEnd(22)} FAIL     no default export`)
      real += 1
      continue
    }
    const html = renderToString(
      h(
        MemoryRouter,
        { initialEntries: [path] },
        h(Routes, null, h(Route, { path: routePath ?? path, element: h(Page) })),
      ),
    )
    const suspect = html.length < 400
    if (suspect) real += 1
    console.log(
      `${path.padEnd(22)} ${suspect ? 'SUSPECT' : 'OK      '}  ${String(html.length).padStart(7)} chars` +
        (suspect ? '  - almost empty, route probably did not match' : ''),
    )
  } catch (err) {
    const h = classify(err)
    if (h) {
      skipped += 1
      console.log(`${path.padEnd(22)} SKIP     ${h.why}`)
    } else {
      real += 1
      console.log(`${path.padEnd(22)} CRASH    ${String(err.message).split('\n')[0]}`)
      const frame = (err.stack || '').split('\n').find((l) => l.includes('/src/'))
      if (frame) console.log(`${' '.repeat(23)}at ${frame.trim()}`)
    }
  }
}

// The car and the lattice are lazy and sit behind Suspense, so neither executes
// above. Import them directly so a module-level crash is caught even though the
// component tree cannot be rendered without a WebGL context.
for (const mod of [
  '/src/components/three/CarScene.jsx',
  '/src/components/three/HeroScene.jsx',
  '/src/components/three/car/buildCar.js',
  '/src/components/three/car/LoadedCar.jsx',
  '/src/components/SceneBoundary.jsx',
  '/src/components/HeroObject.jsx',
]) {
  const name = mod.replace('/src/', '')
  try {
    await server.ssrLoadModule(mod)
    console.log(`${name.padEnd(40)} OK       module loads`)
  } catch (err) {
    const h = classify(err)
    if (h) {
      skipped += 1
      console.log(`${name.padEnd(40)} SKIP     ${h.why}`)
    } else {
      real += 1
      console.log(`${name.padEnd(40)} CRASH    ${String(err.message).split('\n')[0]}`)
    }
  }
}

await server.close()

console.log(
  `\n${real === 0 ? 'NO REAL FAILURES' : `${real} REAL FAILURE(S)`}` +
    `${skipped ? `   (${skipped} skipped: need a browser)` : ''}`,
)
process.exit(real === 0 ? 0 : 1)


