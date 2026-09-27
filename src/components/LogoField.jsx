import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import TechBadge from './ui/TechIcon.jsx'
import { TECH_GROUPS, TECH } from '../data/categories.js'
import { createRng } from '../lib/prng.js'
import { useMediaQuery, useIsTouch } from '../hooks/index.js'

/**
 * The toolset, dropped into the empty side of the hero.
 *
 * Three behaviours, one per requirement:
 *
 *  - They fall in. Each mark drops from above its own resting place on a
 *    low-damping spring, staggered, so the field settles like something
 *    physical rather than fading up.
 *  - Click one and it bounces and falls again — up, squash on landing, settle.
 *  - They fill only the empty side of the hero, never the column the copy sits
 *    in. Previously this was a full-bleed layer behind the text, which made the
 *    headline fight the marks for legibility.
 *
 * Each mark is also draggable, bounded by the hero: grab one, it follows the
 * pointer, let go and it carries the throw and decelerates to a stop.
 *
 * Four nested elements, because four different animation systems each want
 * their own transform and would otherwise overwrite one another:
 *
 *   1  parallax + depth scale + fade   (pointer)
 *   2  drag + release momentum          (Framer drag)
 *   3  fall in / bounce on click       (Framer animate controls)
 *   4  idle float                       (CSS keyframes)
 */

const ALL = [...new Set(TECH_GROUPS.flatMap((g) => g.items))]

/** Marks per breakpoint. Fewer on a phone, where the region is much smaller. */
/**
 * Four to a row, and every mark used.
 *
 * The brief is a line that fills in one by one, so the grid is a strict 4 wide
 * at every breakpoint and nothing is dropped to make the numbers work. 26 marks
 * come, so 26 land: six full rows of four and a final row of two.
 *
 * Falling order is row-major — left to right, then down — because the delay is
 * driven by the mark's index and the index walks the grid in reading order.
 */
const SETS = {
  desktop: { keys: ALL, cols: 4 },
  mobile: { keys: ALL, cols: 4 },
}

/**
 * Even grid with organic jitter.
 *
 * The previous version scattered marks on a golden-angle spiral, which packs
 * points towards the middle and leaves the corners empty. A grid guarantees
 * real distance between every mark, and the jitter keeps it organic.
 * Seeded, so the field is identical on every load.
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
      x: (col + 0.5) * cw + (rng() - 0.5) * cw * 0.34,
      y: (row + 0.5) * ch + (rng() - 0.5) * ch * 0.3,
      z: -230 + rng() * 460,
      alt: i % 2 === 0,
      // Where it falls in from, how long the drop takes, and how long after
      // the one before it. The delay is index-driven and the index walks the
      // grid in reading order, so the field fills in left to right, row by row.
      drop: 110 + rng() * 150,
      fallDur: 1.1 + rng() * 0.9,
      fallDelay: 0.04 + i * 0.085,
    }
  })
}

/** Nearer marks are larger; far ones recede. */
const scaleFor = (z) => 0.7 + ((z + 230) / 460) * 0.5

export default function LogoField({ constraintsRef }) {
  const reduced = useReducedMotion()
  const isTouch = useIsTouch()
  const wide = useMediaQuery('(min-width: 1024px)')
  const selfRef = useRef(null)
  const [grabbed, setGrabbed] = useState(null)

  // Drag is pointer-only: on touch a draggable target sitting over the hero
  // would steal the page scroll from the reader.
  const draggable = !isTouch && !reduced

  const marks = useMemo(() => {
    const set = wide ? SETS.desktop : SETS.mobile
    return build(set.keys, set.cols)
  }, [wide])

  return (
    <div ref={selfRef} className="absolute inset-0 overflow-hidden">
      {marks.map((mark) => (
        <Mark
          key={mark.key}
          mark={mark}
          bounds={constraintsRef || selfRef}
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

/* Landing easing. easeInCubic accelerates the way gravity does, so a falling
   mark speeds up as it drops instead of easing in evenly — an even ease reads
   as a fade, not as weight. */
const FALL = [0.33, 0, 0.67, 0]
const RISE = [0.16, 1, 0.3, 1]

function Mark({ mark, bounds, draggable, reduced, grabbed, onGrab, onRelease }) {
  const controls = useAnimationControls()
  // A drag also ends with a click event, so the fall needs to know whether this
  // was a tap or the end of a throw.
  const dragged = useRef(false)
  const held = grabbed === mark.key

  /* Fall in on arrival. Deliberately NOT a spring: the brief is a slow,
     complete drop that settles and stays put, and a spring would leave the
     marks bobbing forever. Every mark gets its own distance, duration and
     delay, so the field lands staggered rather than as one block. */
  useEffect(() => {
    if (reduced) return
    controls.start({
      y: [-mark.drop, 0],
      opacity: [0, 1],
      transition: {
        duration: mark.fallDur,
        delay: mark.fallDelay,
        ease: FALL,
      },
    })
  }, [controls, reduced, mark.drop, mark.fallDur, mark.fallDelay])

  const fall = () => {
    if (reduced || dragged.current) {
      dragged.current = false
      return
    }
    // Lifts a little, then drops back the rest of the way slowly.
    controls.start({
      y: [0, -34, 0],
      scaleY: [1, 1, 0.9, 1],
      transition: {
        duration: mark.fallDur * 1.5,
        times: [0, 0.22, 0.72, 1],
        ease: [RISE, FALL, FALL],
      },
    })
  }

  return (
    <div className="absolute" style={{ left: `${mark.x}%`, top: `${mark.y}%` }}>
      {/* 1 — fall and landing squash. No pointer parallax: the marks were
          drifting on hover, which read as a screensaver rather than content. */}
      <motion.div className="absolute" animate={controls}>
        {/* 2 — drag and release momentum.

            `touch-none` only when dragging is on: applied unconditionally it
            silently kills page scrolling over any mark. */}
        <motion.div
          className={`absolute ${draggable ? 'cursor-grab touch-none' : ''}`}
          style={{ scale: held ? scaleFor(mark.z) * 1.35 : scaleFor(mark.z) }}
          drag={draggable}
          dragConstraints={bounds}
          dragElastic={0.12}
          dragMomentum
          dragTransition={{ type: 'inertia', power: 0.32, timeConstant: 900 }}
          onDragStart={() => {
            dragged.current = true
            onGrab()
          }}
          onDragEnd={onRelease}
          onPointerDown={onGrab}
          onClick={fall}
          whileDrag={draggable ? { zIndex: 40 } : undefined}
        >
          {/* 3 — no idle float. The marks land and stay where they land. */}
          <div className="-translate-x-1/2 -translate-y-1/2">
            <TechBadge name={mark.key} size="md" showLabel={false} />
            <span className="sr-only">{TECH[mark.key].label}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
