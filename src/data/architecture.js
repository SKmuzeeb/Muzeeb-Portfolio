/**
 * Architecture patterns shown on the Tech Stack page.
 *
 * These describe the shape of the systems I build, not a diagram of any single
 * deployment. Labels are technology-level and stay consistent with TECH.
 */
import { TECH } from './categories.js'

const l = (k) => TECH[k]?.label || k

export const architectures = [
  {
    id: 'request-path',
    label: 'Request path',
    blurb: 'The default shape for anything with a user interface and persistent data.',
    accent: 'flame',
    steps: ['react', 'rest', 'node', 'knex', 'postgres'],
    notes: [
      'The client never talks to the database directly.',
      'Business rules live in the service layer, not in routes or components.',
      'Tenancy and role scope are applied to the query, not only to the view.',
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & serverless',
    blurb: 'How backend work is packaged and deployed.',
    accent: 'aqua',
    steps: ['node', 'lambda', 's3', 'serverless'],
    notes: [
      'Node.js services packaged as Lambda functions for event-driven and scheduled work.',
      'S3 for file and object storage where the application needs durable blobs.',
      'Lambda layers keep shared dependencies out of every deployment package.',
    ],
  },
  {
    id: 'integrations',
    label: 'Third-party integrations',
    blurb: 'How external providers are consumed without leaking into the domain.',
    accent: 'plasma',
    steps: ['node', 'rest', 'graph', 'google', 'stripe'],
    notes: [
      'Provider calls are isolated behind a service so the domain does not depend on the provider.',
      'Microsoft Graph and Google APIs are consumed as ordinary REST resources.',
      'Payment providers sit behind the same boundary as any other external call.',
    ],
  },
]

/**
 * Compact node list for the animated stack diagram.
 *
 * `side` supplies the short responsibility pair drawn in the secondary column
 * of the layered diagram — the labels live here so the image and any copy
 * beside it can never disagree.
 */
export const flowNodes = [
  { id: 'client', label: 'Client', sub: 'interface & routing', tech: 'react', side: ['State', 'Data fetching'] },
  { id: 'api', label: 'REST API', sub: 'transport', tech: 'rest', side: ['Validation', 'Auth'] },
  { id: 'service', label: 'Service layer', sub: 'business logic', tech: 'node', side: ['Controllers', 'Services'] },
  { id: 'query', label: 'Query layer', sub: 'query building', tech: 'knex', side: ['Migrations', 'Transactions'] },
  { id: 'db', label: 'Database', sub: 'system of record', tech: 'postgres', side: ['Schema', 'Indexes'] },
]

/** The default application stack, drawn as a layered diagram. */
export const HOW_I_BUILD = {
  schema: 'layered',
  seed: 'how-i-build',
  accent: 'flame',
  title: 'How I build',
  tag: 'DEFAULT SHAPE',
  sub: 'Client to database and back',
  layers: [
    { tag: 'CLIENT', label: 'React.js', sub: 'interface & routing', side: ['State', 'Data fetching'] },
    { tag: 'TRANSPORT', label: 'REST API', sub: 'JSON over HTTP', side: ['Validation', 'Auth'] },
    { tag: 'SERVICE', label: 'Node.js', sub: 'business logic', side: ['Controllers', 'Services'] },
    { tag: 'DATA ACCESS', label: 'Knex.js', sub: 'query builder', side: ['Migrations', 'Transactions'] },
    { tag: 'DATABASE', label: 'PostgreSQL', sub: 'system of record', side: ['Schema', 'Indexes'] },
    { tag: 'CLOUD', label: 'AWS Lambda', sub: 'serverless runtime', side: ['S3', 'Layers'] },
  ],
}

export const techLabel = l
