export const migratron = {
  slug: 'migratron',
  title: 'Migratron',
  subtitle: 'Tenant and workspace migration platform',
  category: ['saas', 'api-integrations', 'aws-cloud', 'full-stack'],
  kind: 'SaaS Platform',
  format: 'Migration workflows across Microsoft 365 and Google Workspace',
  tagline:
    'A migration-focused SaaS platform for moving tenants and workspaces between Microsoft 365 and Google Workspace environments.',
  overview: [
    'Migratron is a migration-focused SaaS platform designed to support tenant and workspace migration workflows across Microsoft 365 and Google Workspace environments. The problem it addresses is unglamorous but genuinely hard: moving an organisationâ€™s users, files, mail and permissions between providers without losing access, duplicating data or leaving an organisation in a state nobody can audit.',
    'The platform is organised around a visible, resumable workflow rather than a single long-running job. Each migration is broken into discoverable steps so an operator can see where a run stands, retry a failed stage without starting over, and confirm that what arrived is what was expected.',
  ],
  purpose:
    'Provide a single place to run, monitor and verify tenant migrations across two identity and storage providers, instead of relying on provider tooling and manual checks.',
  challenge:
    'Tenant migration fails at the edges â€” rate limits, expired permissions, partially copied folders and unclear ownership. The workflow has to make those states visible and give a safe path to retry rather than a full restart.',
  approach:
    'Each migration is modelled as an ordered, observable pipeline of idempotent stages â€” discovery, mapping, transfer, verification and cutover. Idempotency is the important property: a retried stage must not duplicate a file, a mailbox or a permission assignment, so every stage can be run again safely.',
  areas: [
    'Dashboard',
    'Migration workflow',
    'Authentication',
    'API integrations',
    'Migration processing',
    'Status tracking',
    'Backend services',
  ],
  roles: ['Full Stack Development', 'Backend Development', 'Third-party Integrations', 'AWS / Serverless'],
  tech: ['react', 'node', 'graph', 'google', 'lambda', 'rest', 'postgres', 'git'],
  integrationTargets: ['Microsoft Graph API', 'Google APIs', 'Microsoft 365', 'Google Workspace'],
  tags: ['SaaS', 'Migration', 'Multi-tenant', 'Microsoft Graph', 'Google APIs'],
  // Drop a real screenshot at public/media/migratron.png and point this at it
  // ('/media/migratron.png') to replace the generated cover.
  cover: null,
  visual: { schema: 'layered', accent: 'flame' },
  hasBreakdown: true,
  links: { demo: null, source: null },
}
