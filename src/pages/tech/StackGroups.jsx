import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Reveal from '../../components/ui/Reveal.jsx'
import TechBadge from '../../components/ui/TechIcon.jsx'
import { TECH, TECH_GROUPS } from '../../data/categories.js'

/**
 * Stack groups as an accordion, with a real card per technology.
 *
 * The + affordance and the open/close were already right, so they stay. Two
 * things changed:
 *
 *  - Each technology is now a card that opens on scroll and lifts on hover,
 *    carrying the real brand mark, instead of a flat list row with a small
 *    square monogram.
 *  - The first group is open on arrival and the open state is made obvious —
 *    a coloured rule, a filled plus and the group blurb promoted — because a
 *    `1fr` grid animation on its own was easy to miss.
 *
 * Contents are only mounted while open, so a closed group costs nothing.
 */
export default function StackGroups() {
  const [open, setOpen] = useState(0)
  const reduced = useReducedMotion()

  return (
    <div className="mt-12">
      {TECH_GROUPS.map((group, gi) => {
        const isOpen = open === gi
        return (
          <Reveal key={group.key} delay={gi * 0.05}>
            <div className="border-t border-line last:border-b">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : gi)}
                aria-expanded={isOpen}
                aria-controls={`stack-panel-${group.key}`}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <div className="flex flex-wrap items-baseline gap-4">
                  <span
                    className="h-6 w-0.5 rounded-full transition-colors duration-500"
                    style={{ background: isOpen ? 'var(--color-flame)' : 'var(--color-line-strong)' }}
                    aria-hidden="true"
                  />
                  <h2
                    className="font-display text-lg font-semibold tracking-tight transition-colors duration-300"
                    style={{ color: isOpen ? 'var(--color-ink)' : undefined }}
                  >
                    {group.label}
                  </h2>
                  <span
                    className="font-mono text-label tracking-[0.18em] uppercase transition-colors duration-300"
                    style={{ color: isOpen ? 'var(--color-flame)' : 'var(--color-ink-faint)' }}
                  >
                    {group.blurb}
                  </span>
                </div>
                <span
                  className="material-symbols-outlined shrink-0 transition-all duration-500"
                  style={{
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                    color: isOpen ? 'var(--color-flame)' : 'var(--color-ink-mute)',
                  }}
                  aria-hidden="true"
                >
                  add
                </span>
              </button>

              <div
                id={`stack-panel-${group.key}`}
                className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}
              >
                <div className="overflow-hidden">
                  <ul className="grid gap-3 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <AnimatePresence initial={false}>
                      {isOpen &&
                        group.items.map((key, i) => {
                          const tech = TECH[key]
                          if (!tech) return null
                          return (
                            <motion.li
                              key={key}
                              initial={reduced ? false : { opacity: 0, y: 18, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.94 }}
                              transition={{
                                type: 'spring',
                                stiffness: 160,
                                damping: 20,
                                delay: reduced ? 0 : 0.04 * i,
                              }}
                              whileHover={reduced ? undefined : { y: -5 }}
                              className="group flex items-center gap-3 rounded-2xl bg-panel-2 px-4 py-4 transition-colors duration-400 hover:bg-panel-3"
                            >
                              <TechBadge name={key} size="md" showLabel={false} />
                              <span className="min-w-0">
                                <span className="block truncate font-mono text-xs tracking-[0.06em] text-ink-dim transition-colors duration-400 group-hover:text-ink">
                                  {tech.label}
                                </span>
                                <span
                                  className="mt-0.5 block font-mono text-[0.6rem] tracking-[0.14em] uppercase transition-opacity duration-400 group-hover:opacity-100"
                                  style={{ color: tech.color, opacity: 0.7 }}
                                >
                                  {key}
                                </span>
                              </span>
                            </motion.li>
                          )
                        })}
                    </AnimatePresence>
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}
