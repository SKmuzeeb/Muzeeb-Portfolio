/** Work categories — the filter taxonomy used across Projects and Home. */

export const categories = [
  { key: 'all', label: 'All Work', short: 'All', icon: 'grid_view', blurb: 'Every system, newest first.' },
  { key: 'full-stack', label: 'Full Stack', short: 'Full Stack', icon: 'code', blurb: 'End-to-end products across React.js, Node.js and PostgreSQL.' },
  { key: 'backend', label: 'Backend', short: 'Backend', icon: 'dns', blurb: 'APIs, services and database-driven business logic.' },
  { key: 'aws-cloud', label: 'AWS / Cloud', short: 'Cloud', icon: 'cloud', blurb: 'Lambda, S3 and serverless deployment patterns.' },
  { key: 'api-integrations', label: 'API Integrations', short: 'APIs', icon: 'hub', blurb: 'Microsoft Graph, Google APIs and third-party providers.' },
  { key: 'payments', label: 'Payments', short: 'Payments', icon: 'payments', blurb: 'Payment processing and transaction workflows.' },
  { key: 'saas', label: 'SaaS', short: 'SaaS', icon: 'business_center', blurb: 'Multi-tenant products and operational platforms.' },
]

export const categoryMap = Object.fromEntries(categories.map((c) => [c.key, c]))

export function categoryLabel(key) {
  return categoryMap[key]?.label || key
}

export const ROLES = [
  'Full Stack Development',
  'Backend Development',
  'API Design',
  'Database Design',
  'Third-party Integrations',
  'AWS / Serverless',
  'Debugging & Maintenance',
]

/**
 * Technology map.
 *
 * `mark` is the fallback symbol for tools with no vendor artwork of their own;
 * `color` is the tool's own brand colour so a stack list is scannable at a
 * glance.
 *
 * Real brand artwork lives in `lib/logos.js` and is looked up by key at render
 * time — it is not duplicated here, so the marks live in exactly one place.
 */
export const TECH = {
  react: { label: 'React.js', mark: '⚛', color: '#61dafb' },
  javascript: { label: 'JavaScript', mark: 'JS', color: '#f7df1e' },
  html: { label: 'HTML', mark: '<>', color: '#e34f26' },
  css: { label: 'CSS', mark: '#', color: '#1572b6' },
  reactRouter: { label: 'React Router', mark: 'RR', color: '#f44250' },
  node: { label: 'Node.js', mark: 'N', color: '#3c873a' },
  rest: { label: 'REST APIs', mark: '/', color: '#ff6a1a' },
  knex: { label: 'Knex.js', mark: 'K', color: '#e0393e' },
  postgres: { label: 'PostgreSQL', mark: 'PG', color: '#336791' },
  mysql: { label: 'MySQL', mark: 'My', color: '#00758f' },
  lambda: { label: 'AWS Lambda', mark: 'λ', color: '#ff9900' },
  s3: { label: 'AWS S3', mark: 'S3', color: '#ff9900' },
  lambdaLayers: { label: 'Lambda Layers', mark: 'LL', color: '#ff9900' },
  serverless: { label: 'Serverless', mark: 'SL', color: '#fd8f3f' },
  graph: { label: 'Microsoft Graph API', mark: 'MG', color: '#0078d4' },
  google: { label: 'Google APIs', mark: 'G', color: '#ea4335' },
  gmail: { label: 'Gmail APIs', mark: 'Gm', color: '#ea4335' },
  m365: { label: 'Microsoft 365', mark: '365', color: '#d83b01' },
  gworkspace: { label: 'Google Workspace', mark: 'GW', color: '#0f9d58' },
  stripe: { label: 'Stripe', mark: 'St', color: '#635bff' },
  helcim: { label: 'Helcim', mark: 'H', color: '#00a1e0' },
  git: { label: 'Git', mark: 'G', color: '#f05032' },
  github: { label: 'GitHub', mark: 'Gh', color: '#a4adbd' },
  bitbucket: { label: 'Bitbucket', mark: 'Bb', color: '#2684ff' },
  postman: { label: 'Postman', mark: 'Pm', color: '#ff6c37' },
  pgadmin: { label: 'pgadmin', mark: 'pg', color: '#336791' },
  aws: { label: 'Amazon Web Services', mark: 'AWS', color: '#ff9900' },
  graphql: { label: 'GraphQL', mark: 'GQ', color: '#e10098' },
  gdrive: { label: 'Google Drive', mark: 'GD', color: '#0f9d58' },
}

export const TECH_GROUPS = [
  {
    key: 'frontend',
    label: 'Frontend',
    blurb: 'Interface layer',
    items: ['react', 'javascript', 'html', 'css', 'reactRouter'],
  },
  {
    key: 'backend',
    label: 'Backend',
    blurb: 'Service layer',
    items: ['node', 'rest', 'knex'],
  },
  {
    key: 'database',
    label: 'Database',
    blurb: 'Persistence layer',
    items: ['postgres', 'mysql'],
  },
  {
    key: 'cloud',
    label: 'Cloud / AWS',
    blurb: 'Deployment layer',
    items: ['lambda', 's3', 'lambdaLayers', 'serverless'],
  },
  {
    key: 'integrations',
    label: 'APIs & Integrations',
    blurb: 'External services',
    items: ['graph', 'google', 'gmail', 'm365', 'gworkspace'],
  },
  {
    key: 'payments',
    label: 'Payments',
    blurb: 'Transaction layer',
    items: ['stripe', 'helcim'],
  },
  {
    key: 'tools',
    label: 'Tools',
    blurb: 'Day-to-day',
    items: ['git', 'github', 'bitbucket', 'postman', 'pgadmin'],
  },
]
