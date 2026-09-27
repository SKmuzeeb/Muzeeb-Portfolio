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
