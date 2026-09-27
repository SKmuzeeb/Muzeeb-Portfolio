import { Link } from 'react-router-dom'
import { StackRow } from './ProjectStack.jsx'
import { categoryLabel } from '../data/categories.js'
import { RevealCard } from './ui/Reveal.jsx'
import { coverFor } from '../lib/covers.js'
import { primaryCategory } from '../data/projects/index.js'

/**
 * Project card.
 *
 * Leads with the project's own cover, and opens with a spring as it scrolls
 * into view rather than just fading.
 *
 * Hovering used to crossfade into a live request-flow chart. That put a
 * flowchart on top of a cover that was never a flowchart in the first place,
 * and it made the card look like a different system on hover. Hover now moves
 * the stack badges instead: each logo lifts and scales with a small stagger,
 * which says "here is what this is built on" in the one place the eye already
 * is. Done in CSS so it costs nothing and runs on the compositor.
 */
export default function ProjectCard({ project, size = 'md', index = 0, eager = false }) {
  const ratio = size === 'lg' ? '16 / 9' : '4 / 3'
  const primary = primaryCategory(project)
  const cover = coverFor(project)

  return (
    <RevealCard delay={(index % 3) * 0.07} amount={0.15} className="h-full">
      <Link
        to={`/projects/${project.slug}`}
        className="group lift panel block h-full overflow-hidden focus-visible:outline-flame"
      >
        <div className="image-zoom relative">
          {/* The project's own image — see lib/covers.js to swap in a real one. */}
          <div className="relative w-full bg-panel" style={{ aspectRatio: ratio }}>
            <img
              src={cover}
              alt={`${project.title} — ${project.kind}`}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="rounded-full border border-white/12 bg-void/65 px-2.5 py-1 font-mono text-mono text-ink-dim backdrop-blur-sm">
              {project.index}
            </span>
            <span className="rounded-full border border-white/12 bg-void/65 px-2.5 py-1 font-mono text-label tracking-[0.16em] text-ink-dim uppercase backdrop-blur-sm">
              {project.kind}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="flex translate-y-2 items-center gap-2 rounded-full border border-flame/60 bg-void/70 px-5 py-2.5 font-mono text-label tracking-[0.2em] text-flame uppercase opacity-0 backdrop-blur-md transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
              View case study
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_outward</span>
            </span>
          </div>
        </div>

        <div className="flex h-full flex-col p-(--spacing-card)">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-flame">
                {project.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-mute text-pretty">
                {project.tagline}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="block font-mono text-mono text-ink-faint">{project.kind}</span>
              <span className="mt-2 block font-mono text-label tracking-[0.14em] text-flame uppercase">
                {categoryLabel(primary)}
              </span>
            </div>
          </div>

          {/* Stack badges — they lift and stagger on hover. */}
          <div className="mt-auto pt-5">
            <StackRow keys={project.tech} size="sm" animate />
          </div>
        </div>
      </Link>
    </RevealCard>
  )
}
