// Route smoke test against a running preview server.
// Fetches every route and asserts the server returns the app shell, then
// checks the built bundle for leftover 3D-artist terminology.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.BASE || 'http://localhost:4173'
const ROUTES = [
  '/', '/about', '/experience', '/projects', '/projects/migratron',
  '/projects/site2gym', '/projects/payment-workflows',
  '/projects/employee-club-management', '/projects/personal-training',
  '/tech-stack', '/case-studies', '/contact', '/resume', '/this-route-does-not-exist',
]

const errors = []
let ok = 0

for (const route of ROUTES) {
  try {
    const res = await fetch(BASE + route)
    const html = await res.text()
    if (!res.ok) errors.push(`${route} -> HTTP ${res.status}`)
    else if (!html.includes('<div id="root">')) errors.push(`${route} -> no app shell`)
    else if (!html.includes('Mohammad Muzeeb Shaik')) errors.push(`${route} -> no title`)
    else ok += 1
  } catch (e) {
    errors.push(`${route} -> ${e.message}`)
  }
}

console.log(`  routes: ${ok}/${ROUTES.length} served`)

// Terminology sweep across every shipped asset.
const BANNED = [
  '3D Artist', 'Animator', 'Character Design', 'Environment Art',
  'Product Visualization', 'Motion Graphics', 'Showreel', 'showreel',
  'ArtStation', 'Blender', 'Maya', 'Cinema 4D', 'Turntable', 'Moodboard',
  'Wireframe Render', 'Clay Render', 'Texturing', 'Modeling', 'Lighting Tests',
  'Aria Vance', 'Voidframe', 'vimeo', 'Vimeo',
]

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name)
    return e.isDirectory() ? walk(full) : [full]
  })
}

let hits = 0
for (const file of walk('dist').filter((f) => /\.(js|css|html)$/.test(f))) {
  const text = readFileSync(file, 'utf8')
  for (const term of BANNED) {
    if (text.includes(term)) {
      errors.push(`${file} still contains "${term}"`)
      hits += 1
    }
  }
}

console.log(`  terminology: ${hits} leftover 3D-artist reference(s)`)

if (errors.length) {
  console.log(`\n  ${errors.length} PROBLEM(S):`)
  errors.slice(0, 30).forEach((e) => console.log(`   - ${e}`))
  process.exit(1)
}
console.log('\n  all routes served, no leftover artist terminology')
