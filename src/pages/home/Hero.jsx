import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { lazy, Suspense, useRef } from 'react'
import HeroContent from './HeroContent.jsx'
import { useParallax } from '../../hooks/index.js'
import { pointerX, pointerY } from '../../lib/pointer.js'

// three.js is ~190 kB gzipped. Only the home page needs it, so it is loaded
// on demand rather than sitting in the initial bundle for every route.
const HeroScene = lazy(() => import('../../components/three/HeroScene.jsx'))

/**
 * Full-viewport hero.
 *
 * A single copy column — the decorative floating cards that used to sit in a
 * second column were overlapping the copy and the header, so they are gone.
 *
 * Behind the copy is one continuous background responding to the pointer at
 * several depths, so a drag pulls the field apart rather than sliding one flat
 * image around:
 *
 *   - the WebGL service mesh (also driven by the shared pointer store)
 *   - a grid field that counter-drifts on a slower spring
 *   - three large accent glows at different depths
 *
 * There is deliberately NO layer that paints a shade under the pointer. A
 * radial gradient tracking the cursor reads as a smudge sliding around the
 * page rather than as depth, and on the cream theme it reads as a black stain
 * following the mouse — which looked like a rendering fault, not a design.
 * Depth here comes from parallax and the mesh rotating, not from a shadow.
 *
 * The section is `isolate`d, so the negative-z layers stay inside it instead
 * of escaping behind the page background.
 */
export default function Hero() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const far = useParallax({ depth: 0.3, max: 74 })
  const mid = useParallax({ depth: 0.75, max: 52 })
  const tight = useParallax({ depth: 1.3, max: 30, feel: 'tight' })

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.22])
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0])

  /* The grid counter-drifts, which sells depth far better than moving the
     whole layer with the cursor. */
  const gridX = useTransform(pointerX, (v) => `${v * -26}px`)
  const gridY = useTransform(pointerY, (v) => `${v * -26}px`)

  return (
    <section
      ref={ref}
      className="bleed flex min-h-svh items-center overflow-hidden pt-(--nav-h)"
      aria-labelledby="hero-title"
    >
      {/* ── Layer 0 · WebGL service mesh ─────────────────── */}
      <motion.div
        className="absolute inset-0"
        data-hero-canvas=""
        style={{ scale: canvasScale, opacity: canvasOpacity, zIndex: -30 }}
      >
        <Suspense fallback={null}>
          <HeroScene className="h-full w-full" />
        </Suspense>
      </motion.div>

      {/* ── Layer 1 · grid field + accent glows ──────────── */}
      <div className="bleed-decor" style={{ zIndex: -20 }} aria-hidden="true">
        <motion.div
          className="grid-field absolute -inset-16 opacity-45 mask-fade-b"
          style={{ x: gridX, y: gridY }}
        />
        <motion.div
          data-hero-glow=""
          className="absolute top-[4%] left-[2%] h-[46rem] w-[46rem] rounded-full bg-flame/12 blur-[140px]"
          style={{ x: far.x, y: far.y }}
        />
        <motion.div
          data-hero-glow=""
          className="absolute right-[2%] bottom-[4%] h-[38rem] w-[38rem] rounded-full bg-plasma/14 blur-[150px]"
          style={{ x: mid.x, y: mid.y }}
        />
        <motion.div
          data-hero-glow=""
          className="absolute top-[38%] left-[46%] h-[22rem] w-[22rem] rounded-full bg-aqua/8 blur-[120px]"
          style={{ x: tight.x, y: tight.y }}
        />

        {/* Paper grain. Empty in the dark theme; a fine cross-hatch in the
            cream one, because a flat cream field reads as an unstyled page
            and this is what makes it read as paper. */}
        <div data-hero-grain="" className="absolute inset-0" />

        <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-void to-transparent" />
        <div className="vignette" />
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="shell relative z-10 w-full py-24 sm:py-28">
        <div className="max-w-4xl">
          <motion.div style={{ y: contentY, opacity: contentOpacity }}>
            <HeroContent />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-6 flex justify-center"
        style={{ opacity: contentOpacity }}
        aria-hidden="true"
      >
        <motion.div
          className="flex flex-col items-center gap-3"
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-mono text-label tracking-[0.24em] text-ink-faint uppercase">Scroll</span>
          <span className="h-10 w-px bg-linear-to-b from-flame to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

