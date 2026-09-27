/**
 * Shared pointer + scroll store.
 *
 * A single pair of listeners feeds every parallax consumer on the page, so a
 * screen full of depth layers still costs exactly one pointermove handler.
 * Values are framer-motion motion values: writes never trigger a React render.
 *
 * Two details matter for feel:
 *
 *  1. Raw pointermove fires faster than the display on high-polling mice, so
 *     every write is coalesced into one rAF. Without this the springs receive
 *     bursts of updates and the layers visibly stutter ("stuck" motion).
 *  2. The store must always be able to return to centre. `pointerleave` on
 *     `window` is unreliable across browsers, so we also reset on document
 *     leave, window blur and tab hide. Without those, moving the mouse off
 *     the edge of the screen leaves every parallax layer parked off-axis.
 */
import { motionValue } from 'framer-motion'

/** Normalised pointer position, -1 (left/top) to 1 (right/bottom). */
export const pointerX = motionValue(0)
export const pointerY = motionValue(0)

/** Per-frame pointer delta, -1..1. Drives drag-reactive scale/skew. */
export const pointerVX = motionValue(0)
export const pointerVY = motionValue(0)

/** 1 while a pointer is over the document, 0 once it leaves. */
export const pointerInside = motionValue(0)

/** 1 while the primary button or touch is held. */
export const isDragging = motionValue(0)

/** Raw scroll offset in pixels. */
export const scrollY = motionValue(0)

/** Raw scroll progress 0–1 of the document. */
export const scrollProgress = motionValue(0)

let attached = false

export function attachPointerTracking() {
  if (attached || typeof window === 'undefined') return () => {}
  attached = true

  let frame = 0
  let targetX = 0
  let targetY = 0
  let lastX = 0
  let lastY = 0

  const flush = () => {
    frame = 0
    // Clamp the delta so a fast flick cannot fling a layer off screen.
    const dx = Math.max(-0.35, Math.min(targetX - lastX, 0.35))
    const dy = Math.max(-0.35, Math.min(targetY - lastY, 0.35))
    lastX = targetX
    lastY = targetY
    pointerX.set(targetX)
    pointerY.set(targetY)
    pointerVX.set(dx)
    pointerVY.set(dy)
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(flush)
  }

  const onMove = (event) => {
    targetX = (event.clientX / window.innerWidth) * 2 - 1
    targetY = (event.clientY / window.innerHeight) * 2 - 1
    pointerInside.set(1)
    schedule()
  }

  const onScroll = () => {
    const y = window.scrollY
    scrollY.set(y)
    const max = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.set(max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0)
  }

  /** Return every pointer value to rest. Cheap enough to call on blur. */
  const reset = () => {
    targetX = 0
    targetY = 0
    lastX = 0
    lastY = 0
    pointerX.set(0)
    pointerY.set(0)
    pointerVX.set(0)
    pointerVY.set(0)
    pointerInside.set(0)
  }

  const onDown = () => isDragging.set(1)
  const onUp = () => isDragging.set(0)
  const onVisibility = () => {
    if (document.hidden) {
      reset()
      isDragging.set(0)
    }
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('blur', reset)
  window.addEventListener('pagehide', reset)
  document.addEventListener('pointerleave', reset)
  document.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerup', onUp, { passive: true })
  document.addEventListener('pointercancel', onUp, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  onScroll()

  return () => {
    attached = false
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('blur', reset)
    window.removeEventListener('pagehide', reset)
    document.removeEventListener('pointerleave', reset)
    document.removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
    document.removeEventListener('visibilitychange', onVisibility)
    reset()
  }
}
