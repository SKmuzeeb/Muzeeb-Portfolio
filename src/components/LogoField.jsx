import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimationControls, useTransform, useReducedMotion } from 'framer-motion'
import TechBadge from './ui/TechIcon.jsx'
import { TECH_GROUPS, TECH } from '../data/categories.js'
import { createRng } from '../lib/prng.js'
import { pointerX, pointerY } from '../lib/pointer.js'
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
const SETS = {
  desktop: { keys: ALL, cols: 4 },
  mobile: { keys: ALL.filter((_, i) => i % 3 === 0).slice(0, 9), cols: 3 },
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
      dur: 5.4 + rng() * 4.6,
      delay: -rng() * 7,
      alt: i % 2 === 0,
      parallax: 5 + rng() * 18,
      // Where it falls in from, and how long after the one before it.
      drop: 90 + rng() * 120,
      fallDelay: 0.05 + i * 0.055,
    }
  })
}

/** Nearer marks are larger and more opaque; far ones recede. */
const scaleFor = (z) => 0.7 + ((z + 230) / 460) * 0.5
const fadeFor = (z) => 0.4 + ((z + 230) / 460) * 0.6

export default function LogoField({ constraintsRef }) {
  const reduced = useReducedMotion()
  const isTouch = useIsTouch()
  const wide = useMediaQuery('(min-width: 1024px)')
  const selfRef = useRef(null)
  const [grabbed, setGrabbed] = useState(null)

  // Drag is pointer-only: on touch a draggable target sitting over the hero
  // would steal the page scroll from the reader.
  const draggable = !isTouch && !reduced

  // While a mark is held the ambient parallax would fight the hand.
  useEffect(() => {
    if (grabbed) pointerX.set(0)
  }, [grabbed])

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

function Mark({ mark, bounds, draggable, reduced, grabbed, onGrab, onRelease }) {
  const controls = useAnimationControls()
  // A drag also ends with a click event, so the bounce needs to know whether
  // this was a tap or the end of a throw.
  const dragged = useRef(false)
  const held = grabbed === mark.key
  const still = reduced || grabbed

  const px = useTransform(pointerX, [-1, 1], [-mark.parallax, mark.parallax])
  const py = useTransform(pointerY, [-1, 1], [-mark.parallax, mark.parallax])

  /* Fall in on arrival. A low-damping spring is what makes it read as a drop
     with a settle rather than an ease — the overshoot is the whole point. */
  useEffect(() => {
    if (reduced) return
    controls.start({
      y: [-mark.drop, 0],
      opacity: [0, 1],
      transition: {
        type: 'spring',
        stiffness: 130,
        damping: 11,
        mass: 1.1,
        delay: mark.fallDelay,
      },
    })
  }, [controls, reduced, mark.drop, mark.fallDelay])

  const bounce = () => {
    if (reduced || dragged.current) {
      dragged.current = false
      return
    }
    // Up, then down squashing on impact, then settle.
    controls.start({
      y: [0, -62, 10, 0],
      scaleY: [1, 1, 0.82, 1],
      scaleX: [1, 1, 1.12, 1],
      transition: { duration: 0.72, times: [0, 0.32, 0.52, 1], ease: 'easeOut' },
    })
  }

  return (
    <div className="absolute" style={{ left: `${mark.x}%`, top: `${mark.y}%` }}>
      {/* 1 — parallax, depth scale, depth fade. */}
      <motion.div
        className="absolute"
        animate={controls}
        style={still ? undefined : { x: px, y: py, opacity: fadeFor(mark.z) }}
      >
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
          onClick={bounce}
          whileDrag={draggable ? { zIndex: 40 } : undefined}
        >
          {/* 3 + 4 — the fall and the bounce are driven by the controls above;
              the idle float is CSS on the element inside. */}
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
