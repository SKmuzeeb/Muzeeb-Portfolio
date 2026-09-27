// Repairs relative import depths in src/ after files are moved between folders.
// Scans every import, resolves it, and rewrites the specifier to the correct
// relative path. Safe to re-run.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve, relative, sep, join } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

/** Candidate specifiers for a target, most specific first. */
function candidates(fromDir, target) {
  const rel = relative(fromDir, target).split(sep).join('/')
  return rel.startsWith('.') ? [rel] : [`./${rel}`]
}

let changed = 0
const broken = []

for (const file of walk(SRC).filter((f) => /\.jsx?$/.test(f))) {
  const source = readFileSync(file, 'utf8')
  const fromDir = dirname(file)
  let next = source

  // Resolve each relative specifier to an existing file, then rewrite it.
  next = next.replace(/from\s+'\.[^']+'/g, (match) => {
    const raw = match.slice(match.indexOf("'") + 1, -1)
    const abs = resolve(fromDir, raw)
    const base = abs.replace(/\.jsx?$/, '')
    for (const ext of ['.js', '.jsx']) {
      if (existsSync(base + ext)) return match
    }
    if (existsSync(join(abs, 'index.js')) || existsSync(join(abs, 'index.jsx'))) return match

    // Broken — search the tree for a file with a matching basename.
    const name = raw.split('/').pop().replace(/\.jsx?$/, '')
    const hit = walk(SRC).find(
      (f) => statSync(f).isFile() && f.replace(/\.jsx?$/, '').endsWith(`\\${name}`) || f.replace(/\.jsx?$/, '').endsWith(`/${name}`),
    )
    if (!hit) {
      broken.push(`${file} -> ${raw}`)
      return match
    }
    changed += 1
    return `from '${candidates(fromDir, hit)[0]}'`
  })

  if (next !== source) writeFileSync(file, next)
}

console.log(`  rewritten imports: ${changed}`)
if (broken.length) {
  console.log(`  unresolvable (${broken.length}):`)
  broken.forEach((b) => console.log(`   - ${b}`))
  process.exit(1)
}
console.log('  all relative imports resolve')
