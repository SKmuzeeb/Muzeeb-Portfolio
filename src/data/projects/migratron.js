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
  /**
   * The decisions, and what each one cost.
   *
   * This is the part of a case study that actually says something. "Built with
   * Node and Postgres" is a shopping list; "chose idempotent stages over a
   * restartable job, and here is what that forced every other stage to look
   * like" is engineering. The `cost` field is deliberately part of each entry
   * rather than a closing paragraph, because a decision with nothing given up
   * is usually a decision that was not really examined.
   */
  decisions: [
    {
      title: 'Idempotent stages instead of a restartable job',
      choice: 'Every stage is individually re-runnable, keyed by the source object it is moving.',
      because:
        'Partial failure is the normal case, not the exception. Providers rate-limit, permissions expire mid-run, folders turn out to contain items nobody listed. A job that has to be restarted from the beginning turns a five-minute problem into an all-day one.',
      cost:
        'Each stage carries its own keying and completion record, and stages that are not naturally idempotent have to be rewritten in an "ensure this exists" shape rather than an "add this" one. That is more upfront modelling, and it is the reason the happy path is not as simple as it could be.',
    },
    {
      title: 'Verification as a stage of its own, before cutover',
      choice: 'Arrival is confirmed against expectations while the source is still intact.',
      because:
        'A migration that reports success without confirming what arrived is worse than one that stops. If the source is already gone by the time anyone notices a missing folder, there is no recovery path at all.',
      cost:
        'A full extra pass over the migrated set, and a comparison that has to be tolerant of legitimate differences between the two providers rather than treating any mismatch as a failure.',
    },
    {
      title: 'Provider clients behind one interface',
      choice: 'Microsoft Graph and Google are wrapped so the rest of the system does not branch on which provider it is talking to.',
      because:
        'The two disagree about almost everything underneath: auth, pagination, error shape, what a partial failure looks like. Left raw, that disagreement spreads through every stage.',
      cost:
        'An abstraction that does not always earn its keep with only two providers. The interface has to be allowed to be leaky where the two genuinely differ, or it becomes a lowest-common-denominator layer that fits neither well.',
    },
    {
      title: 'Visible state over background progress',
      choice: 'Every stage transition is persisted and shown, rather than held in a running process.',
      because:
        'An operator has to be able to answer "where is this run and what is it doing" without attaching to a log. That is only possible if the state outlives the process.',
      cost:
        'More persistent state and a real cost to writing every transition. It also means the interface has to present partial progress honestly, which is harder than showing a spinner and a result.',
    },
  ],
  boundaries: [
    'Not a continuous synchronisation tool. Migrations are one-shot; there is no ongoing replication between the two providers.',
    'Not a general ETL engine. The pipeline knows the shapes these two providers produce and is not designed for arbitrary sources.',
    'No reconciliation of edits made in both systems during a cutover window. The window is treated as a freeze, not a merge.',
  ],
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
