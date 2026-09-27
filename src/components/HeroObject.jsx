import { motion } from 'framer-motion'
import { useTilt } from '../hooks/index.js'

/**
 * A 3D object for the right-hand side of a page hero.
 *
 * Every interior page hero was the same three things: a blueprint grid, one
 * blurred circle, and a heading. That is a lot of empty canvas to the right of a
 * short heading, and it is the same emptiness on every page, so nothing told
 * you where you were.
 *
 * Each page now gets its own form, chosen to mean something about that page
 * rather than to fill space:
 *
 *   strata    Experience     thick slabs stepped into depth
 *   bars      Projects        a travelling wave of bars
 *   gyro      Tech Stack      three rings on orthogonal axes
 *   carousel  Case Studies    a ring of cards turning on a circle
 *
 * These are real 3D, not pictures of 3D. A CSS `perspective` is an actual
 * projection: nested `translateZ` and `rotate` genuinely scale and occlude, so
 * an object here has a front and a back and you can tell which is which. What
 * it is not is WebGL — a second canvas per page would add bundle weight, a
 * second rAF loop competing for the main thread, and exactly the stutter that
 * was already fixed once. Every animation below is `transform` and `opacity`,
 * so the whole set runs on the compositor for free.
 *
 * The idle motion is CSS; only the pointer tilt is JavaScript, spring-driven off
 * the shared pointer store like every other parallax layer on the site. Both
 * are disabled under reduced motion.
 *
 * Everything is built from filled surfaces rather than hairlines. That is a
 * correction, not a style preference: earlier passes used 1px borders at low
 * alpha, and a 1px border at a fifth of full strength on a dark ground is a
 * suggestion, not a shape. The ring set in particular was invisible for that
 * reason and it took three passes to notice.
 *
 * Sits behind the copy on small screens and is hidden there entirely: the
 * heroes are text-first on a phone, and a 3D object behind a paragraph is just
 * noise.
 */

const RING = 'rounded-full border'

/**
 * Tech Stack: three rings on orthogonal axes.
 *
 * Each ring sits in its own plane and turns on its own axis at its own rate, so
 * the shape is never the same twice and never visibly repeats. This is the most
 * obviously "instrument"-like of the four, which is the point — it is the page
 * about the machinery.
 *
 * The rings were invisible at first for two compounding reasons: a 1px border,
 * and `color-mix(... 52% ...)` against an accent that is itself translucent.
 * Multiplied together that is a stroke at roughly a fifth of full strength.
 * So: 2px borders, an alpha that does not decay until the far ring vanishes,
 * and a faint fill so the rings occlude one another — which is what makes a
 * tilted ring read as a ring rather than as a circle drawn on a flat page.
 */
function Gyro() {
  const rings = [
    { size: 94, axis: 'obj-spin-y', plane: 'rotateX(74deg)', dur: '38s' },
    { size: 74, axis: 'obj-spin-x', plane: 'rotateY(68deg)', dur: '52s' },
    { size: 56, axis: 'obj-spin-z', plane: 'rotateX(24deg) rotateY(30deg)', dur: '70s' },
  ]
  return (
    <div className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
      {rings.map((r, i) => (
        <div
          key={r.size}
          className="absolute grid place-items-center [transform-style:preserve-3d]"
          style={{ width: `${r.size}%`, aspectRatio: '1', transform: r.plane }}
        >
          {/* The turning element is a child, so the static plane and the
              animation never fight over the same transform property. */}
          <div className={`relative ${r.axis}`} style={{ '--obj-dur': r.dur, width: '100%', aspectRatio: '1' }}>
            <div
              className={`${RING} size-full`}
              style={{
                borderWidth: '2px',
                borderColor: `color-mix(in srgb, var(--color-flame) ${96 - i * 10}%, transparent)`,
                background: `color-mix(in srgb, var(--color-flame) ${7 - i * 1.6}%, transparent)`,
                boxShadow: `0 0 24px color-mix(in srgb, var(--color-flame) ${22 - i * 5}%, transparent)`,
              }}
            />
            {/* A second, inner ring, so one ring does not have to carry the
                whole read on its own. */}
            <div
              className={`${RING} absolute inset-[9%]`}
              style={{
                borderWidth: '1px',
                borderColor: `color-mix(in srgb, var(--color-flame) ${40 - i * 8}%, transparent)`,
              }}
            />
            <span
              className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: `color-mix(in srgb, var(--color-flame) ${100 - i * 8}%, transparent)`,
                boxShadow: '0 0 18px color-mix(in srgb, var(--color-flame) 70%, transparent)',
              }}
            />
            {/* A marker on the rim, so the rotation is legible as rotation
                rather than as a ring that happens to be a different colour. */}
            <span
              className="absolute top-1/2 left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'var(--color-plasma)' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Projects: a travelling wave of bars.
 *
 * Bars rising in sequence is a different shape from everything else here, and
 * it happens to be what a projects page is about: a set of distinct things at
 * different scales, seen together. The phase offset per bar is what makes it a
 * wave travelling across the row rather than seven things pulsing at once.
 */
function Bars() {
  const bars = [0, 1, 2, 3, 4, 5, 6]
  return (
    <div className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
      <div
        className="obj-turntable relative flex h-[62%] w-[72%] items-end justify-between [transform-style:preserve-3d]"
        style={{ '--obj-dur': '21s' }}
      >
        {bars.map((i) => {
          const last = bars.length - 1
          // Recede in Z across the row so the bars occupy real depth, and lift
          // the middle ones so the row reads as an arc rather than a flat wall.
          const t = i / last
          const arc = Math.sin(t * Math.PI) * 46
          return (
            <div
              key={i}
              className="relative h-full flex-1 [transform-style:preserve-3d]"
              style={{ transform: `translate3d(0, ${-arc}%, ${-Math.abs(t - 0.5) * 150}px)` }}
            >
              <div
                className="obj-bar absolute inset-x-[14%] bottom-0 h-full rounded-t-sm"
                style={{
                  // Negative delay so the wave starts mid-travel rather than
                  // waiting a full cycle for the first bar to begin.
                  animationDelay: `${(i - last / 2) * -0.42}s`,
                  background: `linear-gradient(to top, transparent, color-mix(in srgb, var(--color-flame) ${58 - i * 5}%, transparent))`,
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Experience: strata.
 *
 * Thick filled slabs stacked and stepped in real depth.
 *
 * The motion is a continuous loop, deliberately. A staged entrance is not a
 * flow: it plays once, and then the hero is a static diagram. Here the stack
 * never stops moving, with each slab offset in phase so the motion travels up
 * through it.
 */
function Strata() {
  const slabs = [0, 1, 2, 3, 4]
  return (
    <div className="obj-rise absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
      <div
        className="obj-turntable relative h-[58%] w-[86%] [transform-style:preserve-3d]"
        style={{ '--obj-dur': '26s' }}
      >
        {slabs.map((i) => {
          const last = slabs.length - 1
          // Step up and recede: the eye reads it as a staircase into depth.
          const rise = (last / 2 - i) * 15
          const z = -i * 108
          const scale = 1 - i * 0.06
          return (
            <div
              key={i}
              className="absolute left-1/2 w-full [transform-style:preserve-3d]"
              style={{
                top: `${50 + rise}%`,
                transform: `translate3d(-50%, -50%, ${z}px) scale(${scale})`,
                zIndex: last - i,
              }}
            >
              {/* A lit top edge over a filled body. On the dark theme
                  --color-flame is white, so this is a pale slab; on cream it is
                  near-black. Both read without a second palette. */}
              <div
                className="obj-bob h-[54px] w-full rounded-lg"
                style={{
                  transformOrigin: 'bottom',
                  // Negative delay so the phase is already part-way through at
                  // load, rather than the whole stack starting flat.
                  animationDelay: `${i * -1.9}s`,
                  animationDuration: `${7 + i * 1.1}s`,
                  background: `linear-gradient(to bottom, color-mix(in srgb, var(--color-flame) ${30 - i * 4}%, transparent), color-mix(in srgb, var(--color-flame) ${9 - i * 1.4}%, transparent))`,
                  borderTop: `2px solid color-mix(in srgb, var(--color-flame) ${92 - i * 12}%, transparent)`,
                  borderLeft: `1px solid color-mix(in srgb, var(--color-flame) ${34 - i * 5}%, transparent)`,
                  borderRight: `1px solid color-mix(in srgb, var(--color-flame) ${34 - i * 5}%, transparent)`,
                  borderBottom: `1px solid color-mix(in srgb, var(--color-flame) ${18 - i * 3}%, transparent)`,
                  backdropFilter: 'blur(2px)',
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}


/**
 * Case Studies: a carousel.
 *
 * Replaces an earlier spiral of small dots, which read as scattered dust: at
 * that size and weight there was no mass anywhere in it and nothing occluded
 * anything else.
 *
 * This is the opposite approach. A ring of thick cards, each a filled surface
 * with an edge, standing on a circle and turning. It is the most physically
 * legible thing in this set — you can tell which card is in front, which is
 * behind and which is edge-on, and that is exactly what makes CSS 3D read as
 * 3D rather than as layered flat art.
 *
 * The ring turns continuously and never visibly repeats, so the motion is a
 * flow rather than an entrance that has already finished.
 */
function Carousel() {
  const cards = 7
  const RADIUS = 320
  return (
    <div className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
      <div
        className="obj-spin-y relative h-[42%] w-[30%] [transform-style:preserve-3d]"
        style={{ '--obj-dur': '34s' }}
      >
        {Array.from({ length: cards }, (_, i) => {
          const a = (i / cards) * 360
          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 h-[300px] w-[210px] [transform-style:preserve-3d]"
              style={{ transform: `rotateY(${a}deg) translateZ(${RADIUS}px)` }}
            >
              {/* The fill is what makes each card occlude the ones behind it.
                  Without it every card is a floating outline and the ring has
                  no depth at all. */}
              <div
                className="size-full rounded-xl p-4"
                style={{
                  background: `linear-gradient(150deg, color-mix(in srgb, var(--color-flame) ${17 - i}%, transparent), color-mix(in srgb, var(--color-flame) 5%, transparent))`,
                  border: `1px solid color-mix(in srgb, var(--color-flame) ${52 - i * 3}%, transparent)`,
                  boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--color-flame) 70%, transparent)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                {/* Two bars, so a card reads as a document rather than a tile. */}
                <span
                  className="block h-2.5 w-[68%] rounded-full"
                  style={{ background: `color-mix(in srgb, var(--color-flame) ${80 - i * 5}%, transparent)` }}
                />
                <span
                  className="mt-3 block h-1.5 w-[46%] rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--color-flame) 30%, transparent)' }}
                />
                <span
                  className="mt-1.5 block h-1.5 w-[56%] rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--color-flame) 22%, transparent)' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const VARIANTS = { strata: Strata, bars: Bars, gyro: Gyro, carousel: Carousel }

export default function HeroObject({ variant = 'bars', className = '' }) {
  const Form = VARIANTS[variant] ?? Bars
  // The object sits on the right, away from the copy, so it can take more tilt
  // than a content layer would without the page feeling loose.
  const { rotateX, rotateY } = useTilt({ depth: 1, max: 11, feel: 'tight' })

  return (
    <div
      aria-hidden="true"
      className={`mask-fade-left pointer-events-none absolute top-0 right-0 hidden h-full w-[46%] lg:block ${className}`}
      style={{ perspective: '1150px', perspectiveOrigin: '50% 50%' }}
    >
      <motion.div className="size-full [transform-style:preserve-3d]" style={{ rotateX, rotateY }}>
        <div className="size-full [transform-style:preserve-3d]">
          <Form />
        </div>
      </motion.div>
    </div>
  )
}
