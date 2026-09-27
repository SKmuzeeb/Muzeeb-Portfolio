export const site2gym = {
  slug: 'site2gym',
  title: 'SITE2GYM Platform',
  subtitle: 'Fitness and club management platform',
  category: ['full-stack', 'backend', 'payments', 'aws-cloud', 'saas'],
  kind: 'SaaS Platform',
  format: 'Members, trainers, workshops, employees, payments and club operations',
  tagline:
    'A fitness and club management platform supporting members, trainers, workshops, employees, payments, inventory and club operations.',
  overview: [
    'SITE2GYM is a full stack platform for running fitness clubs: memberships, personal training, workshops, staff operations, payments and stock. The application is multi-tenant in the practical sense â€” a single deployment serves multiple clubs, and almost every query has to respect which club and which role is asking.',
    'My work covered both ends of the stack. On the backend that meant designing the API surface, writing the PostgreSQL queries through Knex.js, and modelling business rules that had to hold across clubs. On the frontend it meant building the React.js interfaces those APIs support.',
  ],
  purpose:
    'Give club operations one system for members, staff, scheduling, payments and stock, instead of disconnected tools per department.',
  challenge:
    'A single codebase serving multiple clubs means access control and data filtering are not a feature â€” they are a correctness requirement. Every list, report and action has to respect club and role boundaries.',
  approach:
    'Model tenancy and roles at the data layer rather than only in the UI, so the same rule applies whether a request comes from a screen, a report or a background job. Payments and stock are handled as explicit workflows with confirmed state transitions rather than optimistic updates.',
  /** Decisions and what each one cost. See the note in migratron.js. */
  decisions: [
    {
      title: 'Tenancy enforced in the query, not in the interface',
      choice: 'Every read and write passes through a shared scope helper that applies club and role as part of the query.',
      because:
        'A filter forgotten on one endpoint leaks another club\'s members, and a UI-only check protects nothing that does not come from a screen. Reports, exports and background jobs all bypass the interface entirely.',
      cost:
        'Performance and flexibility take the hit. The filter has to be expressible inside one path, so a genuinely unscoped operation — a system-wide health check, a cross-club report — becomes an explicit exception rather than something that can just be written. And a new endpoint is only as safe as the layer it remembers to call.',
    },
    {
      title: 'Club and role resolved as one principal',
      choice: '"Who is asking, and in which club" is answered once at the edge and carried through the request.',
      because:
        '"Manager at club A" is the overwhelmingly common case, and modelling role and club as two independent checks multiplies the combinations that have to be reasoned about — and eventually get wrong.',
      cost:
        'Rules that genuinely are global rather than per-club have to be expressed as an exception to the resolved principal, which is a little more work each time one appears.',
    },
    {
      title: 'Payments as confirmed transitions rather than optimistic writes',
      choice: 'Stock and payment state only move once the provider has confirmed.',
      because:
        'Money and inventory must never disagree. An optimistic decrement that turns out to be a declined card is a reconciliation problem, and reconciliation is far more expensive than waiting.',
      cost:
        'A slower perceived checkout, and an interface that has to show genuinely intermediate states rather than pretending the purchase already succeeded.',
    },
    {
      title: 'Knex.js rather than a heavier ORM',
      choice: 'Queries are written as explicit joins and scopes through the query builder.',
      because:
        'These queries need deliberate joins and explicit scoping. An ORM that hides them makes the tenancy scope harder to see, and the scope is the part that has to be right.',
      cost:
        'More SQL knowledge expected across the team, and fewer conveniences. It also means the interesting and dangerous parts of the query are visible in review, which is the point but is not free.',
    },
  ],
  boundaries: [
    'No native mobile application. The product is web-first, and the interfaces were built for that rather than adapted to a small screen afterwards.',
    'Scheduling is handled at slot granularity rather than as a general resource-booking engine with buffers, travel time and equipment allocation.',
    'Single currency. Multi-currency would change the meaning of every amount held, not just the ones displayed.',
  ],
  areas: [
    'Member Management',
    'Personal Training',
    'Trainer Availability',
    'Trainer Packages',
    'Workshops',
    'Employee Management',
    'Club Management',
    'Payments',
    'Inventory',
    'Transactions',
  ],
  roles: ['Full Stack Development', 'Backend Development', 'Database Design', 'Third-party Integrations'],
  tech: ['react', 'node', 'postgres', 'knex', 'lambda', 'rest', 'stripe', 'helcim', 'serverless'],
  tags: ['SaaS', 'Multi-tenant', 'PostgreSQL', 'Payments', 'Serverless'],
  // Drop a real screenshot at public/media/site2gym.png and point this at it
  // ('/media/site2gym.png') to replace the generated cover.
  cover: null,
  visual: { schema: 'pipeline', accent: 'aqua' },
  hasBreakdown: true,
  links: { demo: null, source: null },
}
