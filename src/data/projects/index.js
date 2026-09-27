/**
 * Project index.
 *
 * Merges the project records and derives every diagram a case study needs
 * from that project's own data — so a written section and its diagram can
 * never drift apart, and adding a project automatically yields a complete
 * page.
 */
import { migratron } from './migratron.js'
import { site2gym } from './site2gym.js'
import { payments } from './payments.js'
import { employee } from './employee-club-management.js'
import { personalTraining } from './personal-training.js'
import { categories, TECH } from '../categories.js'
import { approach } from '../about.js'

export const projects = [
  migratron,
  site2gym,
  payments,
  employee,
  personalTraining,
].map((p, i) => ({ ...p, index: String(i + 1).padStart(2, '0') }))

export const featured = projects.map((p) => p.slug)

export const featuredProjects = featured
  .map((slug) => projects.find((p) => p.slug === slug))
  .filter(Boolean)

export function getProject(slug) {
  return projects.find((p) => p.slug === slug)
}

export function projectsByCategory(key) {
  return key === 'all' ? projects : projects.filter((p) => p.category.includes(key))
}

export function categoryCount(key) {
  return projectsByCategory(key).length
}

export function countsByCategory() {
  return Object.fromEntries(categories.map((c) => [c.key, categoryCount(c.key)]))
}

/** A project's primary category is the first one listed. */
export function primaryCategory(project) {
  return project.category[0]
}

export function siblings(slug) {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  }
}

export function relatedProjects(slug, limit = 3) {
  const current = getProject(slug)
  if (!current) return []
  const shares = (p) => p.category.some((c) => current.category.includes(c))
  const same = projects.filter((p) => p.slug !== slug && shares(p))
  const rest = projects.filter((p) => p.slug !== slug && !shares(p))
  return [...same, ...rest].slice(0, limit)
}

/* ── Diagram derivation ──────────────────────────────────── */

const label = (key) => TECH[key]?.label || key

/** Chunk an array into fixed-size groups. */
function chunk(list, size) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

/** Conventional HTTP verb for a resource name, used for the illustrative surface. */
const VERBS = {
  create: 'POST', add: 'POST', book: 'POST', process: 'POST', purchase: 'POST',
  list: 'GET', view: 'GET', search: 'GET', status: 'GET', schedule: 'GET', profiles: 'GET', tracking: 'GET',
  update: 'PATCH', manage: 'PATCH', edit: 'PATCH', confirmation: 'POST', code: 'POST', generation: 'POST',
  validation: 'POST', notification: 'POST', processing: 'POST', creation: 'POST', request: 'POST',
}

function verbFor(area) {
  const word = area.trim().split(/[\s/]+/).pop().toLowerCase()
  return VERBS[word] || 'GET'
}

/** Split a sentence into `n` short lines for the phase diagram. */
function wrap(text, n) {
  const words = text.split(' ')
  const per = Math.ceil(words.length / n)
  return Array.from({ length: n }, (_, i) => words.slice(i * per, (i + 1) * per).join(' '))
}

/**
 * Every diagram a case study needs, derived from the project record.
 * Each entry is passed straight to the diagram generator.
 */
export function projectDiagrams(project) {
  const accent = project.visual.accent
  const seed = project.slug
  const areas = project.areas || []
  const flow = project.flow || areas
  const has = (k) => project.tech.includes(k)

  // Layered request path, built from the technologies actually on the project.
  const layers = []
  if (has('react')) {
    layers.push({ tag: 'CLIENT', label: 'React.js', sub: 'interface & routing', side: ['React Router', 'state & data'] })
  } else {
    layers.push({ tag: 'CLIENT', label: 'Web client', sub: 'interface & routing', side: ['Presentation', 'State'] })
  }
  layers.push({ tag: 'TRANSPORT', label: 'REST API', sub: 'JSON over HTTP', side: ['Validation', 'Auth'] })
  if (has('node')) layers.push({ tag: 'SERVICE', label: 'Node.js', sub: 'business logic', side: ['Controllers', 'Services'] })
  if (has('knex') || has('postgres')) layers.push({ tag: 'DATA ACCESS', label: 'Knex.js', sub: 'query builder', side: ['Migrations', 'Transactions'] })
  if (has('postgres')) layers.push({ tag: 'DATABASE', label: 'PostgreSQL', sub: 'system of record', side: ['Schema', 'Indexes'] })
  if (has('lambda') || has('serverless')) layers.push({ tag: 'CLOUD', label: 'AWS Lambda', sub: 'serverless runtime', side: ['S3', 'Layers'] })

  // Services this system talks to, derived from its own technology list.
  const spokes = project.tech
    .filter((k) => ['graph', 'google', 'gmail', 'm365', 'gworkspace', 'stripe', 'helcim', 's3', 'lambda', 'postgres'].includes(k))
    .map((k) => ({ label: label(k), sub: 'service' }))

  // Resource surface — illustrative, and labelled as such inside the diagram.
  const endpointGroups = chunk(areas, 4).map((group, gi) => ({
    tag: `RESOURCE GROUP ${String(gi + 1).padStart(2, '0')}`,
    rows: group.map((a) => [a, verbFor(a)]),
  }))

  const groupsFor = (labelText) =>
    chunk(areas, Math.ceil(areas.length / 3)).map((items, gi) => ({
      tag: `GROUP ${String(gi + 1).padStart(2, '0')}`,
      label: labelText,
      items,
    }))

  return {
    hero: {
      schema: 'layered', seed, accent, title: project.title, tag: 'SYSTEM OVERVIEW',
      sub: project.subtitle, layers,
    },

    problem: {
      schema: 'modules', seed, accent, title: 'Problem & requirements', tag: 'SCOPE',
      sub: 'What the system has to cover', groups: groupsFor('Requirements'),
    },

    architecture: {
      schema: 'layered', seed, accent, title: 'Architecture', tag: 'REQUEST PATH',
      sub: 'How a request travels through the system', layers,
    },

    api: {
      schema: 'endpoints', seed, accent, title: 'API surface', tag: 'ILLUSTRATIVE',
      sub: 'Representative resource surface — not a verbatim endpoint listing',
      groups: endpointGroups.length ? endpointGroups : [{ tag: 'RESOURCES', rows: [['General', 'GET']] }],
    },

    data: {
      schema: 'dataflow', seed, accent, title: 'Data flow', tag: 'PERSISTENCE',
      sub: 'Business entities against backend modules',
      leftTag: 'BUSINESS ENTITIES',
      rightTag: 'BACKEND MODULES',
      linkLabel: 'read / write',
      footnote: 'Knex.js — queries are scoped by tenant and role, not only in the interface',
      left: areas.slice(0, 4).map((a) => ({ label: a, sub: 'entity' })),
      right: areas.slice(0, 4).map((a, i) => ({ label: ['Service', 'Repository', 'Handler', 'Controller'][i % 4], sub: a })),
    },

    flow: {
      schema: 'pipeline', seed, accent,
      title: project.slug === 'payment-workflows' ? 'Payment workflow' : 'System flow',
      tag: 'SEQUENCE',
      sub: 'Ordered steps and their order of execution',
      steps: flow.slice(0, 8).map((s) => (typeof s === 'string' ? { label: s, sub: '' } : s)),
    },

    integration: {
      schema: 'integration', seed, accent, title: 'Integrations', tag: 'BOUNDARY',
      sub: 'What this system talks to',
      hub: { label: 'Application', sub: 'React.js + Node.js' },
      spokes: spokes.length ? spokes : [{ label: 'REST clients', sub: 'consumers' }],
    },

    implementation: {
      schema: 'implementation', seed, accent, title: 'Implementation', tag: 'CODE STRUCTURE',
      sub: 'Separation of concerns across the backend',
      fileName: 'request-lifecycle.js',
      blocks: [
        { tag: 'ROUTE', line1: 'router.get("/resource", authenticate, validate, handler)', line2: '// transport concerns only' },
        { tag: 'CONTROLLER', line1: 'const result = await service.list(filters, identity)', line2: '// no business rules here' },
        { tag: 'SERVICE', line1: '// enforce tenancy and role rules before touching data', line2: 'return repository.find(query.where(scope))' },
        { tag: 'QUERY', line1: 'await knex("table").where(...).transaction(async (trx) => {', line2: '// writes are atomic and idempotent where it matters' },
      ],
    },

    modules: {
      schema: 'modules', seed, accent, title: 'Application modules', tag: 'SYSTEM MAP',
      sub: 'Grouped functional areas of the platform',
      groups: project.modules || groupsFor(project.kind === 'Backend' ? 'Service area' : 'Feature area'),
    },

    process: {
      schema: 'phases', seed, accent, title: 'Development process', tag: 'PHASES',
      sub: 'How the work was approached',
      phases: approach.map((a) => ({ tag: a.step, label: a.title, lines: wrap(a.detail, 3) })),
    },
  }
}

