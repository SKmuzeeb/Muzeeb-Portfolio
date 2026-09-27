// Data-layer validation: every project must be internally consistent, every
// derived diagram must produce well-formed SVG, and nothing fabricated
// (metrics, dates, URLs, skill percentages) may slip in.
import { projects, projectDiagrams, relatedProjects, siblings, countsByCategory } from '../src/data/projects/index.js'
import { categories, TECH, TECH_GROUPS } from '../src/data/categories.js'
import { SCHEMA_KEYS } from '../src/lib/diagram/schemas.js'
import { renderDiagram } from '../src/lib/diagram.js'
import { ACCENT_KEYS } from '../src/lib/palettes.js'
import { proficiency, approach, exploring, experience, bio } from '../src/data/about.js'
import { architectures, flowNodes } from '../src/data/architecture.js'
import { navItems, profile, socials, resume } from '../src/data/site.js'

const errors = []
const check = (cond, msg) => { if (!cond) errors.push(msg) }

function validateXml(src) {
  const stack = []
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g
  let m
  while ((m = re.exec(src)) !== null) {
    const [, closing, name, , selfClose] = m
    if (closing) { const top = stack.pop(); if (top !== name) return `mismatched </${name}>` }
    else if (!selfClose) stack.push(name)
  }
  return stack.length ? `unclosed: ${stack.join(',')}` : null
}

const REQUIRED_DIAGRAMS = ['hero', 'problem', 'architecture', 'api', 'data', 'flow', 'integration', 'implementation', 'modules', 'process']

/* ── Projects ─────────────────────────────────────────── */
const slugs = new Set()
const catKeys = new Set(categories.map((c) => c.key))

for (const p of projects) {
  const tag = p.slug || '?'
  check(!slugs.has(p.slug), `duplicate slug: ${p.slug}`)
  slugs.add(p.slug)
  check(Array.isArray(p.category) && p.category.length > 0, `${tag}: needs a category array`)
  p.category.forEach((c) => check(catKeys.has(c), `${tag}: unknown category "${c}"`))
  check(!!p.title, `${tag}: missing title`)
  check(!!p.tagline, `${tag}: missing tagline`)
  check(Array.isArray(p.overview) && p.overview.length >= 2, `${tag}: needs >= 2 overview paragraphs`)
  check(!!p.purpose, `${tag}: missing purpose`)
  check(!!p.challenge, `${tag}: missing challenge`)
  check(!!p.approach, `${tag}: missing approach`)

  // Decisions are three parts, and all three are required. The cost is the
  // one that matters: a decision with nothing given up is usually one that was
  // never examined, so it is checked for content rather than merely presence.
  check(Array.isArray(p.decisions) && p.decisions.length >= 3, `${tag}: needs >= 3 decisions`)
  for (const [di, d] of (p.decisions ?? []).entries()) {
    const where = `${tag} decision ${di + 1}`
    check(!!d.title, `${where}: missing title`)
    check(!!d.choice, `${where}: missing choice`)
    check(!!d.because, `${where}: missing because`)
    check(!!d.cost, `${where}: missing cost`)
    if (d.title && d.choice && d.because && d.cost) {
      const shortest = [d.choice, d.because, d.cost].reduce((a, b) => (a.length <= b.length ? a : b))
      check(
        shortest.length >= 40,
        `${where}: a field is too thin to be meaningful (${shortest.length} chars, want 40+)`,
      )
    }
    // A cost that is essentially a restatement of the choice is the failure
    // mode this section exists to avoid. Compared on content words only —
    // "every", "that" and "through" appear in both halves of almost any
    // sentence pair and would make this fire on everything.
    if (d.cost && d.choice) {
      const STOP = new Set(
        'every that with from into then than they them this those there which when what where while would could should about their they been being have has had does did not but its it as at by on in of to a an and or is are was were be been do does if so no yes one two also more most much some any each other another same such own very can will just only now new'.split(' '),
      )
      const content = (s) =>
        s
          .toLowerCase()
          .replace(/[^a-z ]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 4 && !STOP.has(w))
      const choiceWords = new Set(content(d.choice))
      const overlap = content(d.cost).filter((w) => choiceWords.has(w)).length
      check(
        overlap < 3,
        `${where}: cost restates the choice rather than describing a trade-off (${overlap} shared content words)`,
      )
    }
  }

  check(Array.isArray(p.boundaries) && p.boundaries.length >= 2, `${tag}: needs >= 2 boundaries`)
  check(Array.isArray(p.areas) && p.areas.length >= 5, `${tag}: needs >= 5 feature areas`)
  check(Array.isArray(p.roles) && p.roles.length > 0, `${tag}: missing roles`)
  check(Array.isArray(p.tech) && p.tech.length > 0, `${tag}: missing tech`)
  check(Array.isArray(p.tags) && p.tags.length > 0, `${tag}: missing tags`)
  check(ACCENT_KEYS.includes(p.visual?.accent), `${tag}: unknown accent "${p.visual?.accent}"`)
  check(/^\d{2}$/.test(p.index), `${tag}: bad index "${p.index}"`)
  p.tech.forEach((t) => check(!!TECH[t], `${tag}: unknown tech "${t}"`))
  // Honesty guards
  check(!p.stats, `${tag}: "stats" not allowed — invented metrics`)
  check(!p.metrics, `${tag}: "metrics" not allowed — invented metrics`)
  check(!p.turntableVideoId && !p.breakdownVideoId, `${tag}: video ids must stay unset unless real`)
  check(p.links?.demo === null && p.links?.source === null, `${tag}: links must stay null unless real`)
}

/* ── Derived helpers & diagrams ───────────────────────── */
let diagramCount = 0
for (const p of projects) {
  const s = siblings(p.slug)
  check(s.prev && s.next && s.prev.slug !== p.slug && s.next.slug !== p.slug, `${p.slug}: bad siblings`)
  check(relatedProjects(p.slug, 3).length === 3, `${p.slug}: related short`)
  check(!relatedProjects(p.slug, 3).some((r) => r.slug === p.slug), `${p.slug}: related includes self`)

  const d = projectDiagrams(p)
  for (const key of REQUIRED_DIAGRAMS) {
    if (!d[key]) { errors.push(`${p.slug}: missing diagram "${key}"`); continue }
    check(SCHEMA_KEYS.includes(d[key].schema), `${p.slug}/${key}: unknown schema "${d[key].schema}"`)
    const xml = decodeURIComponent(renderDiagram(d[key]).slice('data:image/svg+xml,'.length))
    const err = validateXml(xml)
    if (err) errors.push(`${p.slug}/${key}: ${err}`)
    diagramCount += 1
  }
}

const counts = countsByCategory()
check(counts.all === projects.length, 'counts.all mismatch')
for (const c of categories) check(counts[c.key] > 0, `category "${c.key}" has no projects — an empty filter tab is dead UI`)

/* ── Supporting datasets ──────────────────────────────── */
TECH_GROUPS.forEach((g) => g.items.forEach((i) => check(!!TECH[i], `stack: unknown tech "${i}"`)))
check(TECH_GROUPS.length === 7, 'stack: expected 7 groups')
check(proficiency.length === 3, 'about: expected 3 proficiency groups')
proficiency.forEach((g) => g.items.forEach((i) => check(!!TECH[i], `proficiency: unknown tech "${i}"`)))
check(!/\d+%/.test(JSON.stringify(proficiency)), 'about: percentage skill bars are not allowed')
check(approach.length === 6, 'about: expected 6 approach steps')
approach.forEach((a) => check(/^\d{2}$/.test(a.step), `about: bad approach step "${a.step}"`))
check(exploring.length >= 5, 'about: exploring too short')
check(bio.length >= 3, 'about: bio too short')
check(experience.length === 2, 'about: expected 2 employers')
experience.forEach((e) => {
  check(!!e.company && !!e.position, 'about: employer missing company or position')
  check(Array.isArray(e.responsibilities) && e.responsibilities.length >= 5, `${e.company}: too few responsibilities`)
  e.tech.forEach((t) => check(!!TECH[t], `${e.company}: unknown tech "${t}"`))
  check(e.period === null || typeof e.period === 'string', `${e.company}: bad period`)
})
check(architectures.length === 3, 'architecture: expected 3 patterns')
architectures.forEach((a) => a.steps.forEach((s) => check(!!TECH[s], `architecture: unknown tech "${s}"`)))
check(flowNodes.length === 5, 'architecture: expected 5 flow nodes')

/* ── Honesty guards on site config ────────────────────── */
check(profile.email === null || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email), 'site: email must be null or valid')
check(Array.isArray(socials) && socials.length >= 2, 'site: expected linkedin + github entries')
socials.forEach((s) => check(s.href === null || s.href.startsWith('https://'), `site: social href must be null or https — "${s.href}"`))
check(resume.file === null || resume.file.startsWith('/'), 'site: resume file must be null or a root path')
check(navItems.length === 6, 'site: expected 6 nav items')

console.log(`  projects:       ${projects.length}`)
console.log(`  categories:     ${categories.length} (${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' ')})`)
console.log(`  diagrams:       ${diagramCount} validated across ${projects.length} projects`)
console.log(`  schemas:        ${SCHEMA_KEYS.length} (${SCHEMA_KEYS.join(', ')})`)
console.log(`  stack:          ${TECH_GROUPS.length} groups / ${Object.keys(TECH).length} technologies`)
console.log(`  employers:      ${experience.length} · approach steps: ${approach.length}`)

if (errors.length) {
  console.log(`\n  ${errors.length} PROBLEM(S):`)
  errors.slice(0, 40).forEach((e) => console.log(`   - ${e}`))
  process.exit(1)
}
console.log('\n  data layer valid')

