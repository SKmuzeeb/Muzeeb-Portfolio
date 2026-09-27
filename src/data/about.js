/**
 * Progression groups.
 *
 * Deliberately categorical rather than numeric. Percentage skill bars imply a
 * precision that does not exist and read as padding — grouping by depth of use
 * is both more honest and more useful to a hiring engineer.
 */
export const proficiency = [
  {
    key: 'core',
    label: 'Core',
    note: 'Technologies I build with day to day across full stack delivery.',
    icon: 'core',
    items: ['react', 'node', 'rest', 'postgres', 'javascript', 'knex'],
  },
  {
    key: 'experience',
    label: 'Experience',
    note: 'Used in production against real providers and real data.',
    icon: 'verified',
    items: ['graph', 'google', 'stripe', 'helcim', 'm365', 'gworkspace'],
  },
  {
    key: 'working',
    label: 'Working knowledge',
    note: 'Comfortable with, and able to deliver on, without it being a specialism.',
    icon: 'layers',
    items: ['lambda', 's3', 'lambdaLayers', 'serverless', 'reactRouter', 'git', 'postman', 'pgadmin'],
  },
]

/** Six-step engineering approach. */
export const approach = [
  {
    step: '01',
    title: 'Understand',
    detail: 'Understand the requirement, the users and the business workflow before writing anything.',
    icon: 'search',
  },
  {
    step: '02',
    title: 'Design',
    detail: 'Design the API surface, the database structure and how data moves through the application.',
    icon: 'schema',
  },
  {
    step: '03',
    title: 'Build',
    detail: 'Develop the frontend and backend functionality against that design.',
    icon: 'code',
  },
  {
    step: '04',
    title: 'Integrate',
    detail: 'Connect external APIs, cloud services and payment providers, handling failure explicitly.',
    icon: 'hub',
  },
  {
    step: '05',
    title: 'Test',
    detail: 'Validate functionality, edge cases and the data flow end to end.',
    icon: 'fact_check',
  },
  {
    step: '06',
    title: 'Improve',
    detail: 'Debug, optimise and maintain the system as requirements and load change.',
    icon: 'trending_up',
  },
]

/** What I am exploring right now — no certification claims. */
export const exploring = [
  {
    title: 'Cloud architecture',
    detail: 'Structuring AWS projects so services, permissions and deployment stay understandable as they grow.',
    icon: 'cloud',
  },
  {
    title: 'Scalable backend systems',
    detail: 'Serverless patterns, queueing and database design that hold up beyond a single application.',
    icon: 'dns',
  },
  {
    title: 'System design',
    detail: 'Reasoning about boundaries, failure modes and data ownership before committing to a shape.',
    icon: 'account_tree',
  },
  {
    title: 'API architecture',
    detail: 'Consistent resource design, versioning and error contracts across services.',
    icon: 'api',
  },
  {
    title: 'Advanced React patterns',
    detail: 'Keeping large interfaces maintainable — composition, data boundaries and predictable state.',
    icon: 'widgets',
  },
  {
    title: 'Backend performance',
    detail: 'Query shape, indexing, caching and measuring where the time actually goes.',
    icon: 'speed',
  },
]

/** Bio paragraphs, used on Home and About. */
export const bio = [
  'I am Mohammad Muzeeb Shaik, a Full Stack Developer focused on building practical, scalable and reliable web applications.',
  'My experience spans frontend development with React.js, backend development with Node.js, database-driven systems, REST APIs, AWS services and third-party API integrations.',
  'I have worked on SaaS platforms, migration solutions, fitness and club management systems, payment workflows and internal business applications.',
  'I enjoy working across the complete development lifecycle — from designing APIs and database queries to building frontend interfaces and integrating cloud services.',
]

export const journey =
  'From frontend interfaces to backend architecture, my focus is on understanding how the entire system works.'

/**
 * Employment history.
 *
 * `period` is intentionally null — no dates were supplied, and inventing them
 * would be inaccurate. Set a string (e.g. '2023 – Present') and the timeline
 * renders it automatically.
 */
export const experience = [
  {
    id: 'ava-software',
    company: 'AVA Software',
    position: 'Full Stack Developer / Software Developer',
    period: null,
    icon: 'domain',
    summary:
      'Worked on full-stack application development with a strong focus on backend services, APIs, database-driven functionality and integration-based systems.',
    responsibilities: [
      'Developing backend APIs using Node.js',
      'Building and maintaining React.js interfaces',
      'Designing database-driven functionality',
      'Working with REST APIs',
      'Integrating third-party services',
      'Working with Microsoft Graph APIs',
      'Working with Google APIs',
      'Supporting Microsoft 365 and Google Workspace migration workflows',
      'Debugging and improving application functionality',
      'Working with cloud and backend services',
    ],
    tech: ['react', 'node', 'rest', 'postgres', 'graph', 'google', 'm365', 'gworkspace', 'lambda', 'git'],
    focus: 'Backend services, API integrations and migration workflows',
  },
  {
    id: 'site2gym',
    company: 'SITE2GYM',
    position: 'Full Stack Developer',
    period: null,
    icon: 'fitness_center',
    summary:
      'Worked on a fitness and club management platform involving member management, personal training, workshops, employee operations, payments, inventory and backend business workflows.',
    responsibilities: [
      'Developing backend APIs',
      'Building React.js frontend functionality',
      'Designing PostgreSQL queries',
      'Working with Knex.js',
      'Developing member-related functionality',
      'Personal trainer and trainer availability systems',
      'Personal training package and bundle workflows',
      'Workshop and event management',
      'Employee management',
      'Time-off management',
      'Clock-in / clock-out functionality',
      'Club and multi-club access logic',
      'Payment integrations',
      'Inventory and stock workflows',
      'Transaction processing',
      'AWS Lambda and serverless backend functionality',
    ],
    tech: ['react', 'node', 'postgres', 'knex', 'lambda', 'rest', 'stripe', 'helcim', 'serverless'],
    focus: 'Club operations, payments and multi-tenant business workflows',
  },
]

