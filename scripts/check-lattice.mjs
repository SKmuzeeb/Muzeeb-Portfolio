// Verifies the geodesic maths outside the browser, where it is much easier to
// see what went wrong. Run: node scripts/check-lattice.mjs
import { createRng } from '../src/lib/prng.js'

const RADIUS = 2.35
const onSphere = ([x, y, z]) => {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

function icosahedron() {
  const t = (1 + Math.sqrt(5)) / 2
  const verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ]
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]
  return { verts, faces }
}

function subdivide({ verts, faces }) {
  const cache = new Map()
  const key = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`)
  const midpoint = (a, b) => {
    const k = key(a, b)
    const hit = cache.get(k)
    if (hit !== undefined) return hit
    const va = verts[a]
    const vb = verts[b]
    verts.push([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2])
    cache.set(k, verts.length - 1)
    return verts.length - 1
  }
  const next = []
  for (const [a, b, c] of faces) {
    const ab = midpoint(a, b)
    const bc = midpoint(b, c)
    const ca = midpoint(c, a)
    next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
  }
  return { verts, faces: next }
}

for (const level of [1, 2]) {
  let poly = icosahedron()
  for (let i = 0; i < level; i += 1) poly = subdivide(poly)
  const points = poly.verts.map(onSphere)

  const seen = new Set()
  const edges = []
  for (const [a, b, c] of poly.faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]]) {
      const k = i < j ? `${i}_${j}` : `${j}_${i}`
      if (seen.has(k)) continue
      seen.add(k)
      edges.push([i, j])
    }
  }

  const valence = new Array(points.length).fill(0)
  for (const [a, b] of edges) {
    valence[a] += 1
    valence[b] += 1
  }
  // On a class-I geodesic the 12 original icosahedron vertices keep valence 5
  // and each of the 30 new edge midpoints has valence 6. So 12*5 + 30*6 = 240
  // = 2E. A uniform-5 lattice is a class-II geodesic (frequency 3) and would
  // need a different construction, so do not "fix" this to 5 everywhere.
  const five = valence.filter((v) => v === 5).length
  const six = valence.filter((v) => v === 6).length
  const valences = [...new Set(valence)].sort()

  // Euler characteristic V - E + F = 2 for any closed convex polyhedron.
  const euler = points.length - edges.length + poly.faces.length
  // A manifold mesh is edge-manifold iff every edge is shared by exactly 2 faces.
  const faceEdge = new Map()
  for (const [a, b, c] of poly.faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]]) {
      const k = i < j ? `${i}_${j}` : `${j}_${i}`
      faceEdge.set(k, (faceEdge.get(k) || 0) + 1)
    }
  }
  const bad = [...faceEdge.values()].filter((n) => n !== 2).length
  const radii = points.map((p) => Math.hypot(...p))
  const lens = edges.map(([a, b]) => Math.hypot(
    points[a][0] - points[b][0], points[a][1] - points[b][1], points[a][2] - points[b][2],
  ))

  console.log(`\n--- subdivision level ${level} ---`)
  console.log(`vertices ${points.length}  edges ${edges.length}  faces ${poly.faces.length}`)
  console.log(`Euler V-E+F = ${euler}  (2 means closed, convex, no holes) ${euler === 2 ? 'OK' : 'FAIL'}`)
  console.log(`edges not shared by exactly 2 faces: ${bad} ${bad === 0 ? 'OK' : 'FAIL'}`)
  console.log(`distinct vertex valences: [${valences}] ${valences.join() === '5,6' ? 'OK (class-I pattern)' : 'UNEXPECTED'}`)
  // Class-I: the 12 original vertices stay at 5, the new midpoints sit at 6.
  const valenceOK = five === 12 && six === points.length - 12
  console.log(`valence 5 count ${five} (expect 12), valence 6 count ${six} (expect ${points.length - 12}) ${valenceOK ? 'OK' : 'FAIL'}`)
  console.log(`sum of valences ${five * 5 + six * 6} = 2E = ${edges.length * 2} ${five * 5 + six * 6 === edges.length * 2 ? 'OK (handshake)' : 'FAIL'}`)
  console.log(`radius min/max: ${Math.min(...radii).toFixed(6)} / ${Math.max(...radii).toFixed(6)} ${Math.max(...radii) - Math.min(...radii) < 1e-9 ? 'OK (on sphere)' : 'FAIL'}`)
  console.log(`edge length min/max: ${Math.min(...lens).toFixed(4)} / ${Math.max(...lens).toFixed(4)}`)

  // No duplicate vertices — subdivision must not create two points in one place.
  const uniq = new Set(points.map((p) => p.map((c) => c.toFixed(6)).join(',')))
  console.log(`unique vertex positions: ${uniq.size} / ${points.length} ${uniq.size === points.length ? 'OK (welded)' : 'FAIL (cracked seams)'}`)
  console.log(`world radius after scale: ${(RADIUS).toFixed(2)} (RADIUS const)`)
}

// Theta wraparound sanity: the band must be continuous across 0/1.
console.log('\n--- wave wraparound ---')
const angDist = (a, b) => {
  const d = Math.abs(a - b)
  return Math.min(d, 1 - d)
}
console.log(`angDist(0.99, 0.01) = ${angDist(0.99, 0.01).toFixed(3)} (should be small, not 0.98)`)
console.log(`  ${Math.abs(angDist(0.99, 0.01) - 0.02) < 1e-9 ? 'OK' : 'FAIL'}`)
console.log(`angDist(0.5, 0.0)   = ${angDist(0.5, 0).toFixed(3)} (should be 0.5)`)
console.log(`  ${Math.abs(angDist(0.5, 0) - 0.5) < 1e-9 ? 'OK' : 'FAIL'}`)

// Determinism: the seeded spark pick must not vary between builds.
console.log('\n--- determinism ---')
const pick = (seed) => {
  const rng = createRng(seed)
  return [0, 1, 2, 3, 4].map(() => rng().toFixed(9)).join(',')
}
const a = pick('hero-lattice')
const b = pick('hero-lattice')
console.log(`${a === b ? 'OK' : 'FAIL'} - seeded rng repeatable (${a})`)
