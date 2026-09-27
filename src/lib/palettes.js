/**
 * Colour systems used by the diagram generator.
 *
 * `ACCENTS` drive rim light, node strokes and the deep shadow tone.
 * `MOODS` drive the environment: background wash, atmospheric haze, the
 * key-light colour and the deepest shadow.
 *
 * Note the naming: accents use `id` for their identifier (accents have no
 * key light of their own), while moods use `key` for the *colour* of the
 * key light, not an identifier.
 */

export const ACCENTS = {
  flame: { id: 'flame', a1: '#ff6a1a', a2: '#ffa457', deep: '#2c1509', hex: '#ff6a1a', rgb: '255, 106, 26' },
  plasma: { id: 'plasma', a1: '#7c5cff', a2: '#b39dff', deep: '#1e1138', hex: '#7c5cff', rgb: '124, 92, 255' },
  aqua: { id: 'aqua', a1: '#22d3ee', a2: '#7ce9f7', deep: '#0a1c28', hex: '#22d3ee', rgb: '34, 211, 238' },
  lime: { id: 'lime', a1: '#a3e635', a2: '#d4f78a', deep: '#16220a', hex: '#a3e635', rgb: '163, 230, 53' },
  magenta: { id: 'magenta', a1: '#f472b6', a2: '#fbb3d6', deep: '#30152b', hex: '#f472b6', rgb: '244, 114, 182' },
}

export const MOODS = {
  warm: { id: 'warm', bgA: '#1c0e06', bgB: '#05060a', haze: '#ff8a3d', key: '#ffdcbe', deep: '#2c1509' },
  cold: { id: 'cold', bgA: '#06131c', bgB: '#05060a', haze: '#22d3ee', key: '#cdefff', deep: '#0a1c28' },
  neon: { id: 'neon', bgA: '#150b28', bgB: '#05060a', haze: '#7c5cff', key: '#e8dfff', deep: '#1e1138' },
  noir: { id: 'noir', bgA: '#14161c', bgB: '#05060a', haze: '#8b93a7', key: '#f3f5f9', deep: '#1c1f28' },
  dusk: { id: 'dusk', bgA: '#251127', bgB: '#05060a', haze: '#f472b6', key: '#ffe2f1', deep: '#301533' },
}

export const ACCENT_KEYS = Object.keys(ACCENTS)
export const MOOD_KEYS = Object.keys(MOODS)

/** Neutral palette used for clay / untextured passes. */
export const CLAY = {
  id: 'clay',
  a1: '#9aa1ae',
  a2: '#dfe3ea',
  deep: '#252932',
  hex: '#9aa1ae',
  rgb: '154, 161, 174',
}

export const CLAY_MOOD = {
  id: 'clay-mood',
  bgA: '#1a1d24',
  bgB: '#08090d',
  haze: '#7d8798',
  key: '#ffffff',
  deep: '#252932',
}

export function resolveAccent(name) {
  return ACCENTS[name] || ACCENTS.flame
}

export function resolveMood(name) {
  return MOODS[name] || MOODS.warm
}

