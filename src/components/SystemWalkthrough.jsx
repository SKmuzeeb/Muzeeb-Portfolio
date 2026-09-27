import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DiagramImage from './ui/DiagramImage.jsx'
import Reveal from './ui/Reveal.jsx'
import { useReducedMotion } from 'framer-motion'

const STEP_MS = 3200

/**
 * System walkthrough.
 *
 * Stands in for a video slot without pretending a video exists: it steps
 * through the real request path of the project, highlighting each layer against
 * the architecture diagram. Steps are clickable and auto-advance, and stop
 * entirely under reduced-motion.
 */
export default function SystemWalkthrough({ project, diagrams, layers }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduced || !layers?.length) return undefined
    const timer = setInterval(() => setActive((i) => (i + 1) % layers.length), STEP_MS)
    return () => clearInterval(timer)
  }, [reduced, layers])

  if (!layers?.length) return null

  return (
    <Reveal>
      <figure className="panel overflow-hidden">
        <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-flame" aria-hidden="true">
              route
            </span>
            <span className="font-mono text-label tracking-[0.2em] text-ink uppercase">System walkthrough</span>
          </span>
          <span className="font-mono text-mono text-ink-faint">
            {String(active + 1).padStart(2, '0')} / {String(layers.length).padStart(2, '0')}
          </span>
        </figcaption>

        <div className="grid gap-0 lg:grid-cols-[1.55fr_1fr]">
          <div className="relative border-b border-line lg:border-r lg:border-b-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <DiagramImage config={diagrams.architecture} alt="" ratio="4 / 3" />
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-void to-transparent" />
          </div>

          <ol className="p-5 sm:p-6">
            {layers.map((layer, i) => {
              const isActive = i === active
              return (
                <li key={layer.tag}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`group flex w-full items-start gap-4 border-l-2 py-3 pl-4 text-left transition-all duration-400 ${
                      isActive ? 'border-flame bg-white/3' : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <span
                      className={`mt-0.5 font-mono text-label tracking-[0.16em] transition-colors ${
                        isActive ? 'text-flame' : 'text-ink-faint'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block font-mono text-sm tracking-[0.06em] transition-colors ${
                          isActive ? 'text-ink' : 'text-ink-dim'
                        }`}
                      >
                        {layer.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-mute">
                        {layer.side ? `${layer.side[0]} · ${layer.side[1]}` : layer.sub}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            <li className="pt-4 text-xs leading-relaxed text-ink-faint">
              A representative request path for {project.title}, derived from the technologies this
              system actually uses.
            </li>
          </ol>
        </div>
      </figure>
    </Reveal>
  )
}
