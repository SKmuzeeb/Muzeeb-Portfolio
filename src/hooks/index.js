import { useEffect, useMemo, useState } from 'react'
import { useTransform, useSpring, useReducedMotion } from 'framer-motion'
import {
  pointerX,
  pointerY,
  pointerVX,
  pointerVY,
  isDragging,
  attachPointerTracking,
} from '../lib/pointer.js'

/** Attach the shared pointer/scroll listeners for the app lifetime. */
export function usePointerTracking() {
  useEffect(() => attachPointerTracking(), [])
}

/* A single shared spring config. Passing a fresh object literal on every
 * render makes Framer Motion tear down and rebuild the spring, which is what
 * makes pointer layers feel like they "stick" mid-transition. */
const SOFT = { stiffness: 90, damping: 22, mass: 0.7, restDelta: 0.001 }
const TIGHT = { stiffness: 170, damping: 26, mass: 0.5, restDelta: 0.001 }

/**
 * Pointer-driven parallax offsets.
 * @param depth  0 = static, 1 = standard, 2 = pushed further back
 * @param max    maximum translation in px at full pointer deflection
 * @param feel   'soft' for large ambient fields, 'tight' for content layers
 */
export function useParallax({ depth = 1, max = 40, spring = true, feel = 'soft' } = {}) {
  const reduced = useReducedMotion()
  const rawX = useTransform(pointerX, (v) => v * max * depth)
  const rawY = useTransform(pointerY, (v) => v * max * depth)
  const config = feel === 'tight' ? TIGHT : SOFT
  const springX = useSpring(rawX, config)
  const springY = useSpring(rawY, config)
  const enabled = spring && !reduced
  return { x: enabled ? springX : rawX, y: enabled ? springY : rawY }
}

/**
 * Pointer-driven 3D tilt.
 *
 * Same shared pointer store as useParallax, but rotation instead of
 * translation. For an object that genuinely sits in 3D, rotation carries far
 * more depth than a slide does — moving an object sideways reads as a
 * carousel, tilting it reads as a camera.
 *
 * Returns frozen zeros under reduced motion rather than a raw unsprung value,
 * so opting out of motion really does opt out.
 */
export function useTilt({ depth = 1, max = 14, feel = 'soft' } = {}) {
  const reduced = useReducedMotion()
  const config = feel === 'tight' ? TIGHT : SOFT

  // Vertical pointer drives rotateX, horizontal drives rotateY. The signs are
  // chosen so the surface tips *away* from the cursor, like a real object.
  const tiltX = useTransform(pointerY, [-1, 1], [max * depth, -max * depth])
  const tiltY = useTransform(pointerX, [-1, 1], [-max * depth, max * depth])
  const springX = useSpring(tiltX, config)
  const springY = useSpring(tiltY, config)

  const zeroX = useTransform(() => 0)
  const zeroY = useTransform(() => 0)
  if (reduced) return { rotateX: zeroX, rotateY: zeroY }
  return { rotateX: springX, rotateY: springY }
}

/**
 * Drag-reactive tilt for a card or panel.
 *
 * Returns 0 at rest and grows while the pointer is actually moving, so the
 * element leans into the drag and settles back when you stop. Fades out
 * entirely under reduced motion.
 */
export function useDragTilt({ max = 6, lift = 14 } = {}) {
  const reduced = useReducedMotion()
  const cfg = useMemo(() => ({ stiffness: 150, damping: 20, mass: 0.5, restDelta: 0.001 }), [])
  const dragCfg = useMemo(() => ({ stiffness: 200, damping: 24, restDelta: 0.001 }), [])

  // Every hook below runs unconditionally — the reduced-motion branch only
  // decides what is *returned*, never what is *called*.
  const moveX = useTransform(pointerX, [-1, 1], [-max, max])
  const moveY = useTransform(pointerY, [-1, 1], [max, -max])
  const riseX = useTransform(pointerX, [-1, 1], [-lift, lift])
  const riseY = useTransform(pointerY, [-1, 1], [-lift, lift])

  const rotateX = useSpring(moveX, cfg)
  const rotateY = useSpring(moveY, cfg)
  const x = useSpring(riseX, cfg)
  const y = useSpring(riseY, cfg)
  const dragScale = useSpring(isDragging, dragCfg)
  const velocityX = useSpring(pointerVX, cfg)
  const velocityY = useSpring(pointerVY, cfg)

  const zero = useTransform(() => 0)

  if (reduced) return { rotateX: zero, rotateY: zero, x: zero, y: zero }

  return { rotateX, rotateY, x, y, dragScale, velocityX, velocityY }
}

/** Media query as reactive state. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True on coarse pointers (touch) — used to disable expensive hover effects. */
export function useIsTouch() {
  return useMediaQuery('(hover: none)')
}

/**
 * Freeze page scroll while a modal is open, without layout shift.
 *
 * `overflow: hidden` alone still lets a touch drag scroll the page behind the
 * overlay (scroll chaining), and on iOS it does not actually stop the scroll
 * at all — so the background would drift under the dialog, which is exactly
 * the "popup looks wrong" symptom. `overscroll-behavior: contain` plus a
 * `position: fixed` body anchored at the current offset holds it steady.
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined
    const { body, documentElement } = document

    const prevOverflow = body.style.overflow
    const prevOverscroll = body.style.overscrollBehavior
    const prevPadding = body.style.paddingRight
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevWidth = body.style.width
    const prevLeft = body.style.left

    // Compensate for the scrollbar that `overflow: hidden` removes, so the
    // page underneath does not jump sideways on desktop.
    const gap = window.innerWidth - documentElement.clientWidth
    const scrollY = window.scrollY

    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'contain'
    if (gap > 0) body.style.paddingRight = `${gap}px`

    // Fixed-position fallback for iOS Safari, which ignores overflow:hidden.
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.width = '100%'

    return () => {
      body.style.overflow = prevOverflow
      body.style.overscrollBehavior = prevOverscroll
      body.style.paddingRight = prevPadding
      body.style.position = prevPosition
      body.style.top = prevTop
      body.style.left = prevLeft
      body.style.width = prevWidth
      // Put the scroll position back exactly where the user left it.
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}

/** Escape-key handler. */
export function useEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onEscape])
}

