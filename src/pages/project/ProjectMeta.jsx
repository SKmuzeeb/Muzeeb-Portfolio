import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../../components/ui/Reveal.jsx'
import { categoryLabel } from '../../data/categories.js'

function MetaRow({ label, children }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line py-4 last:border-b-0">
      <dt className="font-mono text-label tracking-[0.18em] text-ink-faint uppercase">{label}</dt>
      <dd className="text-sm text-ink-dim">{children}</dd>
    </div>
  )
}

/** Project facts: type, scope, category, role and technology stack. */
export default function ProjectMeta({ project }) {
  const [showAll, setShowAll] = useState(false)
  const areas = showAll ? project.areas : project.areas.slice(0, 6)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <Reveal>
        <div className="panel p-6 sm:p-8">
          <dl>
            <MetaRow label="Type">{project.kind}</MetaRow>
            <MetaRow label="Scope">{project.format}</MetaRow>
            <MetaRow label="Category">
              <span className="flex flex-wrap gap-x-3 gap-y-1">
                {project.category.map((key) => (
                  <Link key={key} to={`/projects?category=${key}`} className="link-underline text-flame">
                    {categoryLabel(key)}
                  </Link>
                ))}
              </span>
            </MetaRow>
            <MetaRow label="My role">
              <span className="flex flex-wrap gap-1.5">
                {project.roles.map((role) => (
                  <span key={role} className="chip">{role}</span>
                ))}
              </span>
            </MetaRow>
            {/* Stack moved to the hero, where it is grouped by layer and sits
                directly under the headline. Repeating it here as a flat chip
                list just made the page read twice for no extra clarity. */}
            {project.integrationTargets?.length > 0 && (
              <MetaRow label="Integrations">
                <span className="flex flex-wrap gap-1.5">
                  {project.integrationTargets.map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </span>
              </MetaRow>
            )}
          </dl>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="panel p-6 sm:p-8">
          <h2 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Project areas</h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {areas.map((area) => (
              <li key={area} className="flex items-start gap-2 text-sm text-ink-dim">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-flame" aria-hidden="true" />
                {area}
              </li>
            ))}
          </ul>
          {project.areas.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-5 font-mono text-label tracking-[0.16em] text-flame uppercase"
            >
              {showAll ? 'Show less' : `+${project.areas.length - 6} more`}
            </button>
          )}
        </div>
      </Reveal>
    </div>
  )
}
