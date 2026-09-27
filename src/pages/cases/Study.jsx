import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { RevealCard } from '../../components/ui/Reveal.jsx'
import ProjectStack, { StackRow } from '../../components/ProjectStack.jsx'
import { categoryLabel } from '../../data/categories.js'
import { coverFor } from '../../lib/covers.js'

const EASE = [0.16, 1, 0.3, 1]

/**
 * One case study, expandable.
 *
 * The expanded panel used to be the project's hero diagram plus a grid of six
 * more blueprint thumbnails — problem, architecture, API, data, flow,
 * implementation. Seven of the same technical drawing in one box, and at that
 * size the SVG labels render at roughly 5px, so none of it was readable. A
 * summary you cannot read is worse than no summary.
 *
 * What is here now is what a reader actually wants at a glance: the project's
 * own cover, what it covers, the role, what it integrates with and the stack,
 * with the real brand marks. The deep diagrams still live on the full case
 * study page, where there is room for them to be legible.
 */
function Study({ project, index, open, onToggle }) {
  const cover = coverFor(project)

  const facts = [
    { key: 'areas', label: 'Covers', items: project.areas },
    { key: 'roles', label: 'My role', items: project.roles },
    { key: 'integrations', label: 'Integrates with', items: project.integrationTargets },
    { key: 'tags', label: 'Also', items: project.tags },
  ].filter((f) => f.items?.length)

  return (
    <RevealCard delay={Math.min(index, 4) * 0.06} amount={0.1}>
      <article className="panel overflow-hidden">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`study-${project.slug}`}
          className="group flex w-full items-center gap-5 p-5 text-left sm:p-6"
        >
          <span className="font-mono text-mono text-ink-faint">{project.index}</span>

          {/* Round marks, so a row is identifiable before it is read. */}
          <StackRow keys={project.tech} size="sm" className="hidden shrink-0 lg:flex" />

          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold tracking-tight transition-colors group-hover:text-flame">
              {project.title}
            </span>
            <span className="mt-1 block text-sm text-ink-mute">{project.subtitle}</span>
          </span>

          <span className="hidden shrink-0 font-mono text-label tracking-[0.16em] text-flame uppercase sm:block">
            {categoryLabel(project.category[0])}
          </span>
          <span
            className="material-symbols-outlined shrink-0 transition-all duration-500"
            style={{
              transform: open ? 'rotate(45deg)' : 'none',
              color: open ? 'var(--color-flame)' : 'var(--color-ink-mute)',
            }}
            aria-hidden="true"
          >
            add
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`study-${project.slug}`}
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden border-t border-line"
            >
              <div className="grid gap-0 lg:grid-cols-[1fr_1.3fr]">
                {/* Cover + the way in. */}
                <div className="border-b border-line p-5 sm:p-6 lg:border-r lg:border-b-0">
                  <div className="overflow-hidden rounded-xl border border-line">
                    <img
                      src={cover}
                      alt={`${project.title} — ${project.kind}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-ink-dim text-pretty">{project.tagline}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {project.category.map((key) => (
                      <li key={key} className="chip">{categoryLabel(key)}</li>
                    ))}
                  </ul>
                  <Link to={`/projects/${project.slug}`} className="btn btn-primary mt-6 w-full">
                    Open full case study
                    <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_outward</span>
                  </Link>
                </div>

                {/* Readable facts, each on its own rule. */}
                <div className="p-5 sm:p-6">
                  <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                    {facts.map((fact, fi) => (
                      <div
                        key={fact.key}
                        className="border-t pt-3.5"
                        style={{ borderColor: fi === 0 ? 'var(--color-line-accent)' : 'var(--color-line)' }}
                      >
                        <p className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
                          {fact.label}
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {fact.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-ink-dim">
                              <span
                                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-flame"
                                aria-hidden="true"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 border-t border-line pt-6">
                    <p className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
                      Built with
                    </p>
                    <ProjectStack project={project} size="sm" className="mt-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </RevealCard>
  )
}

export default Study
