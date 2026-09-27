import Reveal from '../../components/ui/Reveal.jsx'

/** Narrative block: overview prose plus problem, approach and role. */
export default function ProjectOverview({ project }) {
  return (
    <section className="py-(--spacing-margin)">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Reveal>
              <p className="eyebrow">
                <span className="text-flame">00</span>
                <span className="text-ink-faint">/</span>
                Overview
              </p>
            </Reveal>
            <div className="mt-7 space-y-6">
              {project.overview.map((paragraph, i) => (
                <Reveal key={i} delay={0.05 + i * 0.06}>
                  <p
                    className={
                      i === 0
                        ? 'font-display text-xl leading-relaxed font-light text-ink text-pretty'
                        : 'text-lead font-light text-ink-dim text-pretty'
                    }
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <Reveal delay={0.1}>
              <div className="panel p-6">
                <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">My role</h3>
                <ul className="mt-4 space-y-2.5">
                  {project.roles.map((role) => (
                    <li key={role} className="flex items-start gap-2.5 text-sm text-ink-dim">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-flame" aria-hidden="true" />
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="panel p-6">
                <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Project areas</h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.areas.map((area) => (
                    <li key={area} className="chip">{area}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <div className="panel p-6">
                <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">A note on numbers</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-mute text-pretty">
                  This case study describes architecture, scope and approach. No performance metrics,
                  user counts or revenue figures are published here, because none of them are mine to
                  claim.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
