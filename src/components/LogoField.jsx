import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useTransform, useReducedMotion } from 'framer-motion'
import TechBadge from './ui/TechIcon.jsx'
import { TECH_GROUPS, TECH } from '../data/categories.js'
import { createRng } from '../lib/prng.js'
import { pointerX, pointerY } from '../lib/pointer.js'
import { useMediaQuery, useIsTouch } from '../hooks/index.js'

/**
 * The whole toolset, floating across the hero.
 *
 * This used to sit inside a bordered card beside the hero copy, which meant
 * the marks were clipped, crowded and obviously "a box of logos". It is now a
 * full-bleed layer of the hero itself, so the tools float in the same space as
 * the text that describes them.
 *
 * The marks are draggable: grab one and it follows the pointer, let go and it
 * carries on with the throw and decelerates to a stop, like a ball on a table.
 * Each mark is bounded by the hero, so it can never be thrown off screen, and
 * only the mark you grabbed moves.
 *
 * Structure is three nested elements on purpose, because each animation system
 * wants its own transform and they would otherwise overwrite each other:
 *
 *   outer  — pointer parallax, scaled per mark by its depth
 *   middle — Framer drag + release momentum
 *   inner  — the idle float, as a CSS animation
 *
 * Mobile shows a smaller subset on a wider grid: 26 marks in a phone-width
 * hero reads as noise, and a denser grid means touching one steals the page
 * scroll from the reader.
 */

const ALL = [...new Set(TECH_GROUPS.flatMap((g) => g.items))]

/** Marks shown per breakpoint. Fewer on a phone, and drag is touch-disabled. */
const SETS = {
  desktop: { keys: ALL, cols: 6 },
  mobile: { keys: ALL.filter((_, i) => i % 2 === 0).slice(0, 12), cols: 3 },
}

/**
 * Even grid with organic jitter.
 *
 * The previous version scattered marks on a golden-angle spiral, which packed
 * them towards the middle and left the corners empty — the clumping the brief
 * called out. A grid guarantees real distance between every mark, and the
 * jitter keeps it from looking like a spreadsheet.
 *
 * Seeded, so the constellation is identical on every load. A field that
 * reshuffles on refresh reads as a glitch rather than a design.
 */
const build = (keys, cols) => {
  const rng = createRng(`about-logo-field:${cols}`)
  const cw = 100 / cols
  const ch = 100 / Math.ceil(keys.length / cols)
  return keys.map((key, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      key,
      x: (col + 0.5) * cw + (rng() - 0.5) * cw * 0.4,
      y: (row + 0.5) * ch + (rng() - 0.5) * ch * 0.36,
      z: -230 + rng() * 460,
      dur: 5.4 + rng() * 4.6,
      delay: -rng() * 7,
      alt: i % 2 === 0,
      parallax: 6 + rng() * 26,
    }
  })
}

/** Nearer marks are larger and more opaque; far ones recede. */
const scaleFor = (z) => 0.7 + ((z + 230) / 460) * 0.5
const fadeFor = (z) => 0.35 + ((z + 230) / 460) * 0.65


export default function LogoField({ constraintsRef }) {
  const reduced = useReducedMotion()
  const isTouch = useIsTouch()
  const wide = useMediaQuery('(min-width: 768px)')
  const selfRef = useRef(null)
  const [grabbed, setGrabbed] = useState(null)

  // Drag is pointer-only. On touch the marks sit over the copy, and a
  // draggable target there would swallow the page scroll.
  const draggable = !isTouch && !reduced

  // While a mark is held the ambient parallax would fight the hand, so the
  // field goes still until it is released.
  useEffect(() => {
    if (grabbed) pointerX.set(0)
  }, [grabbed])

  const marks = useMemo(() => {
    const set = wide ? SETS.desktop : SETS.mobile
    return build(set.keys, set.cols)
  }, [wide])

  const bounds = constraintsRef || selfRef

  return (
    <div ref={selfRef} className="absolute inset-0 overflow-hidden">
      {marks.map((mark) => (
        <Mark
          key={mark.key}
          mark={mark}
          bounds={bounds}
          draggable={draggable}
          reduced={reduced}
          grabbed={grabbed}
          onGrab={() => setGrabbed(mark.key)}
          onRelease={() => setGrabbed(null)}
        />
      ))}
    </div>
  )
}

function Mark({ mark, bounds, draggable, reduced, grabbed, onGrab, onRelease }) {
  const held = grabbed === mark.key
  // Parallax is suppressed while any mark is held, so the grabbed one tracks
  // the hand exactly instead of sliding out from under it.
  const still = reduced || grabbed
  const px = useTransform(pointerX, [-1, 1], [-mark.parallax, mark.parallax])
  const py = useTransform(pointerY, [-1, 1], [-mark.parallax, mark.parallax])

  return (
    <div className="absolute" style={{ left: `${mark.x}%`, top: `${mark.y}%` }}>
      {/* Depth parallax. */}
      <motion.div
        className="absolute"
        style={still ? undefined : { x: px, y: py, opacity: fadeFor(mark.z) }}
      >
        {/* Drag + release momentum.

            `touch-none` is only applied when dragging is actually enabled.
            Left on unconditionally it silently kills page scrolling anywhere
            a mark happens to sit — the worst kind of mobile bug, because it
            just looks like the page is broken. */}
        <motion.div
          className={`absolute ${draggable ? 'cursor-grab touch-none' : ''}`}
          style={{ scale: held ? scaleFor(mark.z) * 1.35 : scaleFor(mark.z) }}
          drag={draggable}
          dragConstraints={bounds}
          // A little give at the edges, so a hard throw thuds against the
          // hero rather than stopping dead against an invisible wall.
          dragElastic={0.12}
          dragMomentum
          dragTransition={{ type: 'inertia', power: 0.32, timeConstant: 900 }}
          onDragStart={onGrab}
          onDragEnd={onRelease}
          onPointerDown={onGrab}
          whileDrag={draggable ? { zIndex: 40 } : undefined}
        >
          {/* Idle float. */}
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
      </motion.div>
    </div>
  )
}
