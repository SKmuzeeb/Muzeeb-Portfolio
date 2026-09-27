/**
 * Diagram generator.
 *
 * The portfolio ships no bitmap assets, so every image on the site is an SVG
 * synthesised here. Output is vector, which means it stays sharp at any
 * resolution and costs a few kilobytes instead of a multi-megabyte render.
 *
 * Public API is intentionally identical to the previous generator so the
 * presentation components did not have to change:
 *   render({ schema, title, sub, tag, accent, seed, ...spec })
 */
import { createRng } from './prng.js'
import { SCHEMAS, SCHEMA_KEYS } from './diagram/schemas.js'
import { frame, motion as motionCss } from './diagram/primitives.js'
import { resolveAccent } from './palettes.js'

const DEFAULTS = { w: 1600, h: 1000, schema: 'layered', accent: 'flame' }

const toDataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg.replace(/>\s+</g, '><').trim())}`

/**
 * Build a single diagram.
 * @returns {string} data URI usable directly as an `img src`
 */
export function renderDiagram(options = {}) {
  const cfg = { ...DEFAULTS, ...options }
  const { seed, w, h, schema, title, sub, tag, accent: accentName, ...spec } = cfg
  const W = w || DEFAULTS.w
  const H = h || DEFAULTS.h
  const accent = resolveAccent(accentName).a1
  const build = SCHEMAS[schema] || SCHEMAS.layered

  // Seed varies the uid shown in the frame corner; layout itself is
  // deterministic so a given project always draws identically.
  const rng = createRng(`${seed || 'diagram'}:${schema}`)
  const uid = String(Math.abs(Math.round(rng() * 8999)) + 1000)

  const body = build({ W, H, accent, ...spec })

  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">` +
      `${motionCss()}` +
      frame({ W, H, title: title || 'System', sub, tag: tag || 'DIAGRAM', accent, uid }) +
      body +
      `</svg>`,
  )
}

/** Memoised diagram — safe to call during render. */
const cache = new Map()

export function render(options) {
  const key = JSON.stringify(options)
  if (!cache.has(key)) cache.set(key, renderDiagram(options))
  return cache.get(key)
}

export { SCHEMA_KEYS }
