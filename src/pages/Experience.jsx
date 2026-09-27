import Reveal, { RevealCard } from '../components/ui/Reveal.jsx'
import HeroObject from '../components/HeroObject.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import TechIcon from '../components/ui/TechIcon.jsx'
import { TECH } from '../data/categories.js'
import { experience } from '../data/about.js'
import { projects } from '../data/projects/index.js'

/** One employer card: role, focus, responsibilities and stack. */
function Role({ job, index }) {
  return (
    <article className="lift panel overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-line bg-panel-2 text-flame">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">{job.icon}</span>
          </span>
          <div>
            <p className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
              0{index + 1} / {String(experience.length).padStart(2, '0')}
              {job.period ? ` · ${job.period}` : ''}
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">{job.company}</h2>
            <p className="mt-1 font-mono text-mono text-flame">{job.position}</p>
          </div>
        </div>
        <span className="chip">{job.focus}</span>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Summary</h3>
          <p className="mt-4 text-sm leading-relaxed text-ink-dim text-pretty">{job.summary}</p>

          <h3 className="mt-7 font-mono text-label tracking-[0.2em] text-ink uppercase">Technologies</h3>
          {/* The badge is the whole chip now. It used to sit inside a bordered
              pill, so the round logo was framed twice and read as a tiny
              squashed glyph. */}
          <ul className="mt-4 flex flex-wrap items-center gap-2.5">
            {job.tech.map((key) => (
              <li key={key}>
                <TechIcon name={key} size="md" showLabel={false} />
                <span className="sr-only">{TECH[key]?.label || key}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Responsibilities</h3>
          <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {job.responsibilities.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-flame" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

export default function Experience() {
  return (
    <>
      <section className="relative border-b border-line pt-(--nav-h)">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="grid-field absolute inset-0 opacity-30" />
          <div className="absolute -top-32 right-1/3 h-[30rem] w-[30rem] rounded-full bg-plasma/10 blur-[140px]" />
        </div>

        {/* 3D strata, to the right of the heading. */}
        <HeroObject variant="strata" />

        <div className="shell py-(--spacing-margin)">
          <SectionHeading
            kicker="Experience"
            title="Building systems across"
            accent="different products and domains."
            lede="Backend services, API integrations, database design and the React.js interfaces on top of them. Employment dates are shown where recorded."
          />
        </div>
      </section>

      <section className="shell py-(--spacing-margin)">
        <div className="relative">
          {/* Timeline spine */}
          <div className="absolute top-2 bottom-2 left-[1.4rem] hidden w-px bg-linear-to-b from-flame via-plasma to-transparent lg:block" aria-hidden="true" />
          <div className="space-y-6">
            {experience.map((job, i) => (
              <RevealCard key={job.id} delay={i * 0.1} amount={0.12} className="relative">
                <span
                  className="absolute top-8 -left-[1.4rem] hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-flame bg-void lg:block"
                  aria-hidden="true"
                />
                <Role job={job} index={i} />
              </RevealCard>
            ))}
          </div>
        </div>

        <Reveal delay={0.12}>
          <div className="panel mt-8 p-6 sm:p-8">
            <h2 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Where this work landed</h2>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-mute text-pretty">
              The systems described in this portfolio come from the roles above. Each one opens into a
              full case study covering architecture, API surface and implementation.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {projects.map((p) => (
                <li key={p.slug} className="chip">{p.title}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </>
  )
}
