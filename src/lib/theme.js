/**
 * Theme controller.
 *
 * Two monochrome themes: black-on-white, and cream-on-black. The whole theme
 * is a `data-theme` attribute on <html> plus a set of CSS custom properties, so
 * this module's only job is to own that attribute, persist the choice, and
 * keep multiple tabs in step.
 *
 * `system` is a third, internal-only value: it tracks the OS preference and
 * writes `dark` or `light` onto the element. It is what a first-time visitor
 * gets, and it keeps following the OS until they make an explicit choice.
 */
const STORAGE_KEY = 'portfolio-theme'
const VALID = new Set(['dark', 'light', 'system'])

const listeners = new Set()

/** The theme actually in effect right now (never 'system'). */
export function currentTheme() {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** The stored preference, which may be 'system'. */
export function storedPreference() {
  if (typeof localStorage === 'undefined') return 'system'
  const value = localStorage.getItem(STORAGE_KEY)
  return VALID.has(value) ? value : 'system'
}

const prefersDark = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches

const resolve = (pref) => (pref === 'system' ? (prefersDark() ? 'dark' : 'light') : pref)

/** Write the resolved theme to <html>. Does not touch storage. */
function apply(pref) {
  const theme = resolve(pref)
  const root = document.documentElement
  root.dataset.theme = theme
  // Keep the browser UI (address bar, notch area on mobile Safari) in step.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f2eee4' : '#000000')
  return theme
}

function emit(theme) {
  listeners.forEach((fn) => fn(theme))
}

/** Persist and apply a preference. */
export function setTheme(pref) {
  const next = VALID.has(pref) ? pref : 'system'
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Private browsing or a blocked storage partition: the theme still applies
    // for this session, it just will not be remembered.
  }
  emit(apply(next))
  return next
}

/** Flip between the two explicit themes. */
export function toggleTheme() {
  return setTheme(currentTheme() === 'light' ? 'dark' : 'light')
}

/** Subscribe to theme changes. Returns an unsubscribe function. */
export function onThemeChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * Apply the stored preference and start following the OS while the preference
 * is 'system'. Called once on mount.
 */
export function initTheme() {
  const pref = storedPreference()
  apply(pref)

  if (typeof matchMedia === 'undefined') return
  const mq = matchMedia('(prefers-color-scheme: dark)')
  const onSystem = () => {
    // Only while the visitor has not made an explicit choice.
    if (storedPreference() === 'system') emit(apply('system'))
  }
  mq.addEventListener('change', onSystem)
}

/**
 * Inline snippet for <head>. Runs before first paint so the correct theme is on
 * <html> from the very first frame.
 *
 * Without this, React hydrates after the stylesheet and the page shows a flash
 * of the wrong theme — white page for a dark-theme visitor, which on a dark
 * site at night is genuinely unpleasant.
 */
export const THEME_BOOT_SNIPPET = `(function(){try{var k='portfolio-theme';var v=localStorage.getItem(k);if(v!=='dark'&&v!=='light'&&v!=='system')v='system';var t=v==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):v;var r=document.documentElement;r.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#f2eee4':'#000000');}catch(e){document.documentElement.dataset.theme='dark';}})();`
