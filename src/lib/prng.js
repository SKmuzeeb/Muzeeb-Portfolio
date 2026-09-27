/**
 * Deterministic pseudo-random helpers.
 *
 * Every "render" on this site is generated from a string seed, so the same
 * project always produces the same artwork across reloads, pages and builds.
 */

/** FNV-1a style string hash → uint32 */
export function hashString(input) {
  let h = 2166136261
  const str = String(input)
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Mulberry32 PRNG → () => float in [0, 1) */
export function createRng(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : hashString(seed)
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Float in [min, max) */
export function range(rng, min, max) {
  return min + rng() * (max - min)
}

/** Integer in [min, max] */
export function intRange(rng, min, max) {
  return Math.floor(range(rng, min, max + 1))
}

/** One item from a list */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length]
}

/** n items from a list, order-stable (no duplicates possible to exceed list length) */
export function sample(rng, list, n) {
  const pool = [...list]
  const out = []
  for (let i = 0; i < n && pool.length; i += 1) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
  }
  return out
}

/** Round to 2dp — keeps generated SVG markup small */
export function r2(n) {
  return Math.round(n * 100) / 100
}
