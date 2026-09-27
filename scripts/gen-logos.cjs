const fs = require('fs')

const MAP = {
  react: 'react',
  nodedotjs: 'node',
  postgresql: 'postgres',
  mysql: 'mysql',
  awslambda: 'lambda',
  amazons3: 's3',
  amazonwebservices: 'aws',
  google: 'google',
  googledrive: 'gdrive',
  gmail: 'gmail',
  stripe: 'stripe',
  graphql: 'graphql',
  github: 'github',
  git: 'git',
  postman: 'postman',
  javascript: 'javascript',
  html5: 'html',
  css3: 'css',
  reactrouter: 'reactRouter',
  bitbucket: 'bitbucket',
}

const raw = JSON.parse(fs.readFileSync('scripts/logos-raw.json', 'utf8').replace(/^ï»¿/, ''))
const lines = []
for (const [slug, key] of Object.entries(MAP)) {
  const hit = raw[slug]
  if (!hit) { console.log('skip (not captured):', slug); continue }
  lines.push(`  ${key}: '${hit.d}',`)
  console.log('mapped', slug, '->', key)
}

const body = lines.join('\n')
const out = `/**
 * Official brand marks â€” GENERATED, do not hand-edit.
 *
 * Paths are 24x24 viewBox and come from Simple Icons (CC0 1.0), the standard
 * open set of brand marks. They are the real vendor artwork, not a
 * re-approximation: React is the actual atom, Node.js the actual hexagon-and-N,
 * PostgreSQL the actual elephant, and so on.
 *
 * Regenerate with:  node gen-logos.cjs   (after re-running fetch-logos.ps1)
 */
export const GENERATED_LOGOS = {
${body}
}
`
fs.writeFileSync('src/lib/logos.generated.js', out, 'utf8')
console.log('\nwrote', lines.length, 'paths ->', (out.length / 1024).toFixed(1), 'kB')

