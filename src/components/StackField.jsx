import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, useReducedMotion, animate } from 'framer-motion'
import TechBadge from './ui/TechIcon.jsx'
import { TECH } from '../data/categories.js'
import { pointerX, pointerY } from '../lib/pointer.js'

/**
 * The default full-stack shape, floating in depth.
 *
 * The About hero panel used to be a vertical list: five rows, one lit at a
 * time, nothing moving but a small dot. It read as a table rather than as
 * "this is what I am". This is a real 3D field instead:
 *
 *  - Every layer sits at its own translateZ, so the client genuinely is
 *    nearer the viewer than the database. The field then rotates with the
 *    pointer inside a perspective, which produces actual parallax — near
 *    layers sweep further across the screen than far ones for free, because
 *    that is simply what perspective does. No per-layer maths required.
 *  - Each layer floats on its own phase (two keyframes, alternating) so the
 *    field never bobs as one rigid object.
 *  - One packet runs the request path continuously and the layer it is
 *    passing lights up. Progress is a single animated motion value, so the
 *    packet and the highlights come from the same clock and cannot drift.
 *
 * DOM rather than a generated SVG, so the badges stay real brand marks in
 * their real brand colours and the text stays selectable.
 */

const LAYERS = [
  { key: 'react', label: 'Client', sub: 'interface & routing' },
  { key: 'rest', label: 'REST API', sub: 'transport' },
  { key: 'node', label: 'Service layer', sub: 'business logic' },
  { key: 'knex', label: 'Query layer', sub: 'query building' },
  { key: 'postgres', label: 'Database', sub: 'system of record' },
]

/* Internal coordinate space. Nodes are laid out here and then mapped to
   percentages, so the spine geometry and the node positions can never drift
   apart the way hand-tuned absolute offsets do. */
const VB = { w: 300, h: 440 }
const PAD_TOP = 40
const PAD_BOTTOM = 40
/* Hand-placed cascade. Alternating offsets stop the spine being a straight
   line, which would make it read as a list again. */
const OFFSETS = [0, 26, -22, 30, -14]

const stepFor = (n) => (VB.h - PAD_TOP - PAD_BOTTOM) / Math.max(n - 1, 1)

const layout = (n) =>
  Array.from({ length: n }, (_, i) => {
    const cx = VB.w / 2 + (OFFSETS[i % OFFSETS.length] ?? 0)
    const cy = PAD_TOP + i * stepFor(n)
    return {
      cx,
      cy,
      xPct: (cx / VB.w) * 100,
      yPct: (cy / VB.h) * 100,
      // Client nearest the viewer, database furthest away.
      z: (n - 1 - i) * 34,
    }
  })

const SPARK = [0.34, 1, 0.34]

export default function StackField({ layers = LAYERS }) {
  const reduced = useReducedMotion()
  const n = layers.length
  const pts = layout(n)

  /* One clock for the whole panel: 0 → n, looping. */
  const progress = useMotionValue(0)

  useEffect(() => {
    if (reduced || n < 2) return undefined
    const controls = animate(progress, n, {
      duration: n * 2.1,
      ease: 'linear',
      repeat: Infinity,
    })
    return () => controls.stop()
  }, [reduced, n, progress])

  /* Field rotation. Reads the shared pointer store, so a drag anywhere on the
     page moves it, not just a drag over the panel. */
  const rotY = useTransform(pointerX, [-1, 1], [9, -9])
  const rotX = useTransform(pointerY, [-1, 1], [-7, 7])

  /* Packet position down the path, as a percentage of panel height. */
  const packetTop = useTransform(progress, (p) => {
    const t = Math.min(Math.max(p, 0), n - 1) / Math.max(n - 1, 1)
    const topPct = (PAD_TOP / VB.h) * 100
    const bottomPct = ((VB.h - PAD_BOTTOM) / VB.h) * 100
    return topPct + t * (bottomPct - topPct)
  })

  const spine = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ')

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 font-mono text-label tracking-[0.2em] text-ink-mute uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-flame" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flame" />
          </span>
          The stack
        </span>
        <span className="font-mono text-mono text-ink-faint">client → database</span>
      </div>

      {/* Perspective on the viewport, preserve-3d all the way down, so
          translateZ on the layers becomes real depth. */}
      <div className="relative h-[27rem] w-full [perspective:1100px] sm:h-[30rem]">
        <motion.div
          className="absolute inset-0"
          style={
            reduced
              ? undefined
              : { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }
          }
        >
          {/* Spine, pushed behind everything. */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ transform: 'translateZ(-60px)' }}
          >
            <path d={spine} fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" />
            <path
              d={spine}
              fill="none"
              stroke="var(--color-flame)"
              strokeWidth="1.5"
              strokeOpacity="0.65"
              className={reduced ? undefined : 'spine-flow'}
            />
          </svg>

          {/* The packet running the request path. */}
          {!reduced && (
            <motion.div
              className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-flame shadow-[0_0_14px_3px_rgb(255_106_26/0.7)]"
              style={{ top: packetTop, translateZ: 20 }}
              aria-hidden="true"
            >
              <span
                className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame/25"
                style={{ animation: 'halo 2.1s ease-in-out infinite' }}
              />
            </motion.div>
          )}

          {/* Layers. Each is its own hook-free leaf so the transforms below
              stay on the compositor. */}
          {layers.map((layer, i) => (
            <Layer
              key={layer.key}
              layer={layer}
              index={i}
              total={n}
              xPct={pts[i].xPct}
              yPct={pts[i].yPct}
              z={pts[i].z}
              progress={progress}
              reduced={reduced}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/**
 * One floating layer.
 *
 * Split into its own component so each of these can hold a small set of
 * `useTransform` calls. Hooks cannot be called inside a loop, and inlining
 * them into the map would either break the rules of hooks or force a single
 * shared set of values across all five layers.
 */
function Layer({ layer, index, total, xPct, yPct, z, progress, reduced }) {
  const tech = TECH[layer.key]

  // Light up the layer the packet is currently passing.
  const lit = useTransform(progress, [index - 0.55, index, index + 0.55], SPARK)
  const scale = useTransform(lit, [0.34, 1], [0.94, 1.06])
  const glow = useTransform(lit, [0.34, 1], [0, 0.6])

  return (
    <div className="absolute" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
      <motion.div
        className="absolute"
        style={
          reduced ? undefined : { z, scale, opacity: lit, transformStyle: 'preserve-3d' }
        }
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 ${reduced ? '' : index % 2 ? 'float-b' : 'float-a'}`}
          style={{
            '--dur': `${(6.4 + index * 0.9).toFixed(1)}s`,
            animationDelay: `${(index * -1.3).toFixed(2)}s`,
          }}
        >
          <div className="flex flex-col items-center gap-2.5">
            <div className="relative">
              <span
                className="absolute inset-0 rounded-full bg-flame"
                style={{ opacity: glow, filter: 'blur(16px)' }}
                aria-hidden="true"
              />
              <TechBadge name={layer.key} size="xl" showLabel={false} />
            </div>
            <div className="text-center">
              <p className="font-display text-xs font-semibold tracking-tight whitespace-nowrap text-ink">
                {layer.label}
              </p>
              <p className="mt-0.5 font-mono text-[0.6rem] tracking-[0.1em] whitespace-nowrap text-ink-faint">
                {layer.sub}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Announced for assistive tech, since the visual sequence is decorative. */}
      <span className="sr-only">
        {layer.label} — {layer.sub} ({tech.label}), layer {index + 1} of {total}
      </span>
    </div>
  )
}
