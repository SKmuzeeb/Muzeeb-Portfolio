import { experience, proficiency, approach } from '../../data/about.js'
import { TECH, TECH_GROUPS } from '../../data/categories.js'
import { projects } from '../../data/projects/index.js'

/** Small labelled section used throughout the document. */
export function Block({ title, children }) {
  return (
    <section>
      <h2 className="font-mono text-label tracking-[0.22em] text-flame uppercase">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Experience entries. */
export function ExperienceBlock() {
  return (
    <Block title="Experience">
      <div className="space-y-8">
        {experience.map((job) => (
          <div key={job.id} className="border-l-2 border-line pl-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-base font-bold tracking-tight">{job.company}</h3>
              {job.period && <span className="font-mono text-mono text-ink-faint">{job.period}</span>}
            </div>
            <p className="mt-1 font-mono text-mono text-flame">{job.position}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim text-pretty">{job.summary}</p>
            <p className="mt-3 font-mono text-label tracking-[0.16em] text-ink-faint uppercase">{job.focus}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {job.tech.map((key) => (
                <li key={key} className="chip">{TECH[key].label}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Block>
  )
}

/** Skills, proficiency and approach. */
export function SkillsBlock() {
  return (
    <>
      <Block title="Technical skills">
        <div className="grid gap-5 sm:grid-cols-2">
          {TECH_GROUPS.map((group) => (
            <div key={group.key}>
              <h3 className="font-mono text-label tracking-[0.18em] text-ink uppercase">{group.label}</h3>
              <p className="mt-2 text-sm text-ink-dim">
                {group.items.map((key) => TECH[key].label).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Proficiency">
        <div className="space-y-4">
          {proficiency.map((group) => (
            <div key={group.key}>
              <h3 className="font-display text-sm font-semibold tracking-tight">{group.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-mute">{group.note}</p>
              <p className="mt-2 font-mono text-mono text-ink-dim">
                {group.items.map((key) => TECH[key].label).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Approach">
        <ol className="grid gap-3 sm:grid-cols-2">
          {approach.map((step) => (
            <li key={step.step} className="flex items-start gap-3">
              <span className="font-mono text-label text-flame">{step.step}</span>
              <div>
                <h3 className="font-display text-sm font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-mute">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Block>
    </>
  )
}

/** Project list. */
export function ProjectsBlock() {
  return (
    <Block title="Projects">
      <div className="space-y-5">
        {projects.map((project) => (
          <div key={project.slug}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-sm font-bold tracking-tight">{project.title}</h3>
              <span className="font-mono text-label tracking-[0.14em] text-ink-faint uppercase">
                {project.kind}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-dim text-pretty">{project.tagline}</p>
            <p className="mt-2 font-mono text-mono text-ink-faint">
              {project.tech.map((key) => TECH[key].label).join(' · ')}
            </p>
          </div>
        ))}
      </div>
    </Block>
  )
}
