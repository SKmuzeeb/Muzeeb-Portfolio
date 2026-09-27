import { useMemo } from 'react'
import { motion, useTransform, useReducedMotion } from 'framer-motion'
import TechBadge from './ui/TechIcon.jsx'
import { TECH_GROUPS, TECH } from '../data/categories.js'
import { createRng } from '../lib/prng.js'
import { pointerX, pointerY } from '../lib/pointer.js'

/**
 * The whole toolset, floating in depth.
 *
 * This is the entire About hero panel. There is deliberately nothing else in
 * it — no spine, no packet, no layer labels, no status header. The Tech Stack
 * page already explains what each technology is and what layer it sits in;
 * repeating that here meant the hero was a smaller, worse version of a page
 * that already exists.
 *
 * So this is just the real brand marks, hanging in 3D space:
 *
 *  - Every mark sits at its own translateZ inside a perspective, and the field
 *    rotates with the pointer. That produces real parallax for free: near
 *    marks sweep further across the screen than far ones, because that is what
 *    perspective does. No per-mark fudge maths.
 *  - Position is seeded, so the field is byte-identical on every load. A
 *    constellation that reshuffles on refresh reads as a glitch, not a design.
 *  - Marks float on two alternating keyframes at staggered durations, so the
 *    field never bobs as one rigid object.
 *  - Depth also drives scale and opacity, so the far marks recede instead of
 *    just being smaller.
 *
 * Under reduced motion the float, the rotation and the depth all stop, leaving
 * a clean static constellation.
 */

/** Every technology on the site, de-duplicated, in a stable order. */
const ALL = [...new Set(TECH_GROUPS.flatMap((g) => g.items))]

const FIELD = (() => {
  const rng = createRng('about-logo-field')
  const n = ALL.length
  return ALL.map((key, i) => {
    // Golden-angle scatter spreads points evenly with no clumping, which
    // looks far more deliberate than pure random across a small panel.
    const a = i * 2.399963
    const r = 9 + (i / n) * 30 + (rng() - 0.5) * 6
    return {
      key,
      // Percentages of the panel, so the field scales with it.
      x: 50 + Math.cos(a) * r,
      y: 50 + Math.sin(a) * r * 0.88,
      z: -230 + rng() * 460,
      dur: 5.4 + rng() * 4.6,
      delay: -rng() * 7,
      alt: i % 2 === 0,
    }
  })
})()

/** Nearer marks are larger and more opaque; far ones recede. */
const scaleFor = (z) => 0.62 + ((z + 230) / 460) * 0.55
const fadeFor = (z) => 0.3 + ((z + 230) / 460) * 0.7

export default function LogoField() {
  const reduced = useReducedMotion()

  const rotY = useTransform(pointerX, [-1, 1], [11, -11])
  const rotX = useTransform(pointerY, [-1, 1], [-8, 8])

  const marks = useMemo(() => FIELD.filter((f) => TECH[f.key]), [])

  return (
    <div className="relative h-[24rem] w-full [perspective:1100px] sm:h-[27rem]">
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      >
        {marks.map((mark) => (
          <div
            key={mark.key}
            className="absolute"
            style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
          >
            <motion.div
              className="absolute"
              style={
                reduced
                  ? undefined
                  : {
                      z: mark.z,
                      scale: scaleFor(mark.z),
                      opacity: fadeFor(mark.z),
                      transformStyle: 'preserve-3d',
                    }
              }
            >
              <div
                className={`-translate-x-1/2 -translate-y-1/2 ${reduced ? '' : mark.alt ? 'float-b' : 'float-a'}`}
                style={{
                  '--dur': `${mark.dur.toFixed(2)}s`,
                  animationDelay: `${mark.delay.toFixed(2)}s`,
                }}
              >
                <TechBadge name={mark.key} size="lg" showLabel={false} />
                <span className="sr-only">{TECH[mark.key].label}</span>
              </div>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
