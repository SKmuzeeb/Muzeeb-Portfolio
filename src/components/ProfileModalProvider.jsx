import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { quickProfile, profile, resume } from '../data/site.js'
import { TECH } from '../data/categories.js'
import { useLockBodyScroll, useEscape } from '../hooks/index.js'
import { ProfileModalContext } from '../lib/profile-context.js'
import { projects } from '../data/projects/index.js'

const EASE = [0.16, 1, 0.3, 1]
const STACK_KEYS = ['react', 'node', 'postgres', 'knex', 'lambda', 'graph', 'google', 'stripe', 'rest']

/** Keep Tab inside the dialog while it is open. */
function useFocusTrap(active, panelRef, initialRef) {
  useEffect(() => {
    if (!active) return undefined
    initialRef.current?.focus()
    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, panelRef, initialRef])
}

/** Left column: the layers of the stack I work across. */
function FocusColumn() {
  return (
    <div className="border-b border-line p-6 sm:p-8 md:border-r md:border-b-0">
      <p className="eyebrow">Layers I work in</p>
      <dl className="mt-5 divide-y divide-line">
        {quickProfile.focus.map((row) => (
          <div key={row.label} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3.5">
            <dt className="font-mono text-label tracking-[0.16em] text-ink-faint uppercase">{row.label}</dt>
            <dd className="text-sm text-ink-dim">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="eyebrow mt-8">Core stack</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {STACK_KEYS.map((key) => (
          <li
            key={key}
            className="rounded-full border px-3 py-1.5 font-mono text-label tracking-[0.1em]"
            style={{
              color: TECH[key].color,
              borderColor: `${TECH[key].color}44`,
              background: `${TECH[key].color}12`,
            }}
          >
            {TECH[key].label}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Right column: index of case studies plus primary actions. */
function CasesColumn({ onClose }) {
  return (
    <div className="p-6 sm:p-8">
      <p className="eyebrow">Case studies · {projects.length} systems</p>
      <ul className="mt-4 divide-y divide-line">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              to={`/projects/${project.slug}`}
              onClick={onClose}
              className="group flex items-center justify-between gap-4 py-3 transition-colors hover:text-flame"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{project.title}</span>
                <span className="block truncate text-xs text-ink-mute">{project.subtitle}</span>
              </span>
              <span className="shrink-0 font-mono text-label text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-flame">
                {project.index}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link to="/projects" className="btn btn-primary" onClick={onClose}>
          View all work
        </Link>
        <Link to={resume.fallbackRoute} className="btn btn-ghost" onClick={onClose}>
          Resume
        </Link>
      </div>
    </div>
  )
}

function Modal({ open, onClose }) {
  const closeRef = useRef(null)
  const panelRef = useRef(null)

  useLockBodyScroll(open)
  useEscape(open, onClose)
  useFocusTrap(open, panelRef, closeRef)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay z-modal flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-label={quickProfile.title}
        >
          <button
            type="button"
            aria-label="Close profile"
            onClick={onClose}
            className="overlay-scrim bg-void/92 backdrop-blur-md"
          />

          <motion.div
            ref={panelRef}
            className="panel overlay-panel w-full max-w-4xl overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-6 border-b border-line p-6 sm:p-8">
              <div>
                <p className="eyebrow">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-flame" />
                  {profile.name}
                </p>
                <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {quickProfile.title}
                </h2>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-dim text-pretty">
                  {quickProfile.blurb}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close profile"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong text-ink-dim transition-colors hover:border-flame hover:text-flame"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
              <FocusColumn />
              <CasesColumn onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ProfileModalProvider({ children }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(
    () => ({ open: () => setOpen(true), close: () => setOpen(false), isOpen: open }),
    [open],
  )
  return (
    <ProfileModalContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} />
    </ProfileModalContext.Provider>
  )
}

