/**
 * Site-wide identity, navigation and contact configuration.
 *
 * ─────────────────────────────────────────────────────────────
 * IMPORTANT — fill these in before deploying.
 * Values that are `null` or `[]` are intentionally empty rather
 * than invented. The UI degrades gracefully: email falls back to
 * the in-page contact form, and profile links are only rendered
 * as links once a real URL is supplied.
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: 'Mohammad Muzeeb Shaik',
  shortName: 'Muzeeb',
  initials: 'MS',
  role: 'Full Stack Developer',
  roles: ['Full Stack Development', 'Backend Engineering', 'API Integrations', 'AWS / Cloud'],
  tagline: 'Building scalable web applications, backend systems and API-driven solutions.',
  stackLine: 'React.js • Node.js • PostgreSQL • AWS • REST APIs',
  location: 'Available for remote work',

  summary:
    'Full Stack Developer experienced in building scalable web applications, backend services, REST APIs, cloud-based systems and third-party integrations. I work across React.js, Node.js, PostgreSQL, AWS and API-driven architectures, with hands-on experience developing SaaS platforms, migration solutions, payment workflows and fitness/club management systems.',

  /** Set to your real address to enable every mailto in the UI. */
  email: null,
}

/** Drop a resume PDF into /public and set `file`, e.g. '/resume.pdf'. */
export const resume = {
  file: null,
  /** A readable, printable resume route is always available as a fallback. */
  fallbackRoute: '/resume',
  note: 'Experience, technical skills and projects in one document.',
}

export const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Experience', to: '/experience' },
  { label: 'Projects', to: '/projects' },
  { label: 'Tech Stack', to: '/tech-stack' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Contact', to: '/contact' },
]

export const footerNav = [
  { label: 'About', to: '/about' },
  { label: 'Experience', to: '/experience' },
  { label: 'Projects', to: '/projects' },
  { label: 'Tech Stack', to: '/tech-stack' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Contact', to: '/contact' },
]

/**
 * Profile links. `href: null` renders as plain text rather than a dead link,
 * so nothing on the site ever points at a placeholder. Hrefs must be https —
 * `scripts/check-data.mjs` enforces it.
 */
export const socials = [
  {
    label: 'LinkedIn',
    handle: '/in/mohammad-muzeeb-shaik',
    href: 'https://www.linkedin.com/in/mohammad-muzeeb-shaik-010597412',
    icon: 'linkedin',
  },
  {
    label: 'GitHub',
    handle: '@SKmuzeeb',
    href: 'https://github.com/SKmuzeeb',
    icon: 'github',
  },
]

/**
 * Shipped, publicly reachable work.
 *
 * These link straight out rather than opening a case study: a case study would
 * be describing a product in depth, and this one belongs to somebody else, so
 * claiming ownership of it on a portfolio would be the kind of thing the rest
 * of this data layer deliberately avoids.
 */
export const liveLinks = [
  {
    label: 'bagged-dun',
    href: 'https://bagged-dun.vercel.app/',
    note: 'Local grocery delivery — stores list stock, customers order, delivery follows.',
    icon: 'local_shipping',
  },
]

export const availability = {
  status: 'open',
  headline: 'Open to full stack roles',
  detail:
    'Available for full stack and backend-focused roles, freelance project work, and collaboration on API-driven products.',
  modes: [
    { key: 'fulltime', label: 'Full-time', detail: 'Full stack and backend developer roles', icon: 'work', available: true },
    { key: 'freelance', label: 'Freelance', detail: 'Project-based application and API work', icon: 'code', available: true },
    { key: 'collab', label: 'Collaboration', detail: 'Open to working with other engineers and teams', icon: 'groups', available: true },
  ],
}

export const contact = {
  availability: 'Open to new work',
  leadTime: 'Happy to agree timelines up front',
  note: 'Send the scope, the deadline and any constraints. I will reply with questions, a rough approach, and an honest view on whether it is a fit.',
}

/** Sections shown in the quick-profile modal. */
export const quickProfile = {
  title: 'Technical profile',
  blurb: 'A compact view of what I build with, and the kind of problems I am used to solving.',
  focus: [
    { label: 'Application layer', value: 'React.js interfaces, routing, state and data fetching' },
    { label: 'Service layer', value: 'Node.js, REST APIs, validation and error handling' },
    { label: 'Data layer', value: 'PostgreSQL, Knex.js query building, schema design' },
    { label: 'Integration layer', value: 'Microsoft Graph, Google APIs, payment providers' },
    { label: 'Cloud layer', value: 'AWS Lambda, S3, serverless deployment' },
  ],
}
