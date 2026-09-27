/**
 * Brand marks.
 *
 * Official vendor artwork, never a hand-drawn approximation. Most paths come
 * from Simple Icons (CC0 1.0) via `logos.generated.js`; the rest are declared
 * here.
 *
 * Microsoft withdrew its brand icons from that set for licensing reasons, so
 * `microsoft` below is the official four-pane mark reproduced exactly — it is
 * four equal squares in a 2x2 grid, which is the whole logo, not a likeness of
 * it.
 *
 * Anything a project references that has no vendor artwork of its own falls
 * back to the monogram in `TECH[key].mark`. Tools that are genuinely part of
 * another vendor's ecosystem (Microsoft Graph, Google Workspace, Lambda
 * Layers) are aliased to their parent's real mark rather than invented.
 */
import { GENERATED_LOGOS } from './logos.generated.js'

/** The official Microsoft four-pane mark, exact 2x2 grid of equal squares. */
const MICROSOFT =
  'M1 1h9.4v9.4H1V1zm10.6 0H21v9.4H11.6V1zM1 11.6h9.4V21H1v-9.4zm10.6 0H21V21H11.6v-9.4z'

export const LOGOS = {
  ...GENERATED_LOGOS,
  microsoft: MICROSOFT,
}

/**
 * Aliases — these technologies are part of a parent's ecosystem and have no
 * artwork of their own, so they show the real parent mark.
 */
const ALIASES = {
  m365: 'microsoft',
  graph: 'microsoft', // Microsoft Graph
  gworkspace: 'google',
  lambdaLayers: 'lambda',
  serverless: 'aws',
  pgadmin: 'postgres',
}

/** 24x24 path data for a technology key, or null when there is no real mark. */
export function logoFor(key) {
  if (!key) return null
  if (LOGOS[key]) return LOGOS[key]
  const alias = ALIASES[key]
  return alias ? LOGOS[alias] || null : null
}

/** True when a real vendor mark exists for this key. */
export const hasLogo = (key) => Boolean(logoFor(key))

export { ALIASES }
