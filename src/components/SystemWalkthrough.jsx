import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Reveal from './ui/Reveal.jsx'

const STEP_MS = 4200

/**
 * The request path, presented as a designed sequence rather than a flowchart.
 *
 * This used to be a two-column panel: a generated architecture diagram on the
 * left, a numbered step list on the right. The diagram was a `layered` schema —
 * stacked boxes joined by downward arrows — which is a flowchart. It appeared on
 * every case study, and because it was a generated SVG it looked the same on
 * every project: the same rectangles, the same arrows, the same blue-grey
 * strokes. It described the shape of a request without saying anything about
 * the project it belonged to.
 *
 * The layer data is unchanged and still comes from the project record, so this
 * cannot drift from the stack. What changed is the presentation:
 *
 *   - no boxes, no arrows, no diagram. A single rail with stage markers carries
 *     the order instead.
 *   - one stage is shown at a time, at display size, so the label is readable
 *     rather than being one line in a list of six.
 *   - the supporting detail for each layer — which the old diagram squeezed
 *     into a small side box — is set as real prose.
 *
 * Everything animates with transform and opacity, and the auto-advance stops
 * completely under reduced-motion.
 */
export default function SystemWalkthrough({ project, layers }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const total = layers?.length ?? 0

  useEffect(() => {
    if (reduced || !total) return undefined
    const timer = setInterval(() => setActive((i) => (i + 1) % total), STEP_MS)
    return () => clearInterval(timer)
  }, [reduced, total])

  if (!total) return null

  const layer = layers[active]

  return (
    <Reveal>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-16">
        {/* The rail. Stage markers, clickable, with the current one filled. */}
        <ol className="relative flex gap-3 lg:block lg:gap-0">
          {/* One continuous rule behind the markers. Horizontal on small screens,
              where the stages sit in a row rather than a column. */}
          <span
            aria-hidden="true"
            className="absolute top-[7px] right-0 left-0 h-px bg-line lg:top-0 lg:right-auto lg:bottom-0 lg:left-[7px] lg:h-auto lg:w-px"
          />
          {layers.map((l, i) => {
            const isActive = i === active
            const isPast = i < active
            return (
              <li key={l.tag} className="relative flex-1 lg:flex-none">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive ? 'step' : undefined}
                  className="group flex w-full flex-col items-center gap-3 text-center lg:flex-row lg:items-baseline lg:gap-5 lg:py-4 lg:text-left"
                >
                  {/* Marker. Dims the further back in the path it is. */}
                  <span
                    aria-hidden="true"
                    className={`relative z-10 size-[15px] shrink-0 rounded-full border transition-all duration-500 ${
                      isActive
                        ? 'scale-110 border-flame bg-flame'
                        : isPast
                          ? 'border-line-strong bg-line-strong'
                          : 'border-line bg-void group-hover:border-line-strong'
                    }`}
                  />
                  <span
                    className={`font-mono text-label tracking-[0.16em] uppercase transition-colors duration-400 ${
                      isActive ? 'text-ink' : 'text-ink-faint group-hover:text-ink-dim'
                    }`}
                  >
                    {l.tag}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>


        {/* The stage itself. */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={layer.tag}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-label tracking-[0.24em] text-flame uppercase">
                {String(active + 1).padStart(2, '0')}
                <span className="mx-2 text-ink-faint">/</span>
                {String(total).padStart(2, '0')}
              </p>

              <h3 className="mt-5 font-display text-4xl font-extrabold text-balance sm:text-5xl">
                {layer.label}
              </h3>

              <p className="mt-3 font-display text-lg font-light text-ink-dim">{layer.sub}</p>

              {layer.side && (
                <dl className="mt-9 grid gap-x-10 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
                  <div>
                    <dt className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
                      Concern
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-ink-mute">{layer.side[0]}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
                      Handled by
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-ink-mute">{layer.side[1]}</dd>
                  </div>
                </dl>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress as one rule, not a counter printed twice. */}
          <div aria-hidden="true" className="mt-10 h-px w-full bg-line">
            <motion.div
              className="h-px bg-flame"
              animate={{ width: `${((active + 1) / total) * 100}%` }}
              transition={{ duration: reduced ? 0 : 0.7, ease: 'easeOut' }}
            />
          </div>

          <p className="mt-6 max-w-prose text-sm leading-relaxed text-ink-faint text-pretty">
            The layers a request passes through in {project.title}, in the order they are actually
            arranged — derived from the technologies this system uses, not drawn by hand.
          </p>
        </div>
      </div>
    </Reveal>
  )
}
