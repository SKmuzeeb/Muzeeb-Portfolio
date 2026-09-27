import { RevealCard } from '../components/ui/Reveal.jsx'
import HeroObject from '../components/HeroObject.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Study from './cases/Study.jsx'
import Cta from './home/Cta.jsx'
import { projects } from '../data/projects/index.js'
import { useState } from 'react'

/**
 * The shared six-phase process.
 *
 * This was the last flowchart left on the page — a `phases` blueprint showing
 * the same six steps as every other system on the site. Shown as a numbered
 * run of cards it reads in a second, and it stops the case studies ending on
 * yet another technical drawing.
 */
const PROCESS = [
  { step: '01', label: 'Understand', detail: 'Requirement, users and the business workflow behind it.' },
  { step: '02', label: 'Design', detail: 'API surface, schema and how data moves through the system.' },
  { step: '03', label: 'Build', detail: 'Frontend and backend against that design, not around it.' },
  { step: '04', label: 'Integrate', detail: 'External APIs, cloud services and payments — with failure handled.' },
  { step: '05', label: 'Test', detail: 'Functionality, edge cases and the full data flow end to end.' },
  { step: '06', label: 'Improve', detail: 'Debug, optimise and maintain as load and needs change.' },
]

export default function CaseStudies() {
  const [open, setOpen] = useState(projects[0]?.slug ?? null)

  return (
    <>
      <section className="relative border-b border-line pt-(--nav-h)">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="grid-field absolute inset-0 opacity-30" />
          <div className="absolute -top-32 left-1/4 h-[30rem] w-[30rem] rounded-full bg-plasma/10 blur-[140px]" />
        </div>

        <div className="shell py-(--spacing-margin)">
          <HeroObject variant="carousel" />
          <SectionHeading
            kicker={`${projects.length} deep dives`}
            title="Case studies —"
            accent="the decisions behind the code."
            lede="Expand any system to see what it covers, the role behind it, the services it integrates with and the stack it is built on."
          />
        </div>
      </section>

      <section className="shell py-(--spacing-margin)">
        <div className="space-y-4">
          {projects.map((project, i) => (
            <Study
              key={project.slug}
              project={project}
              index={i}
              open={open === project.slug}
              onToggle={() => setOpen((cur) => (cur === project.slug ? null : project.slug))}
            />
          ))}
        </div>

        <div className="mt-(--spacing-margin)">
          <RevealCard>
            <div className="panel p-6 sm:p-8">
              <p className="eyebrow">
                <span className="text-flame">✦</span>
                <span className="text-ink-faint">/</span>
                The same six phases across every system here
              </p>
              <ol className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {PROCESS.map((phase) => (
                  <li key={phase.step} className="border-t border-line pt-3.5">
                    <span className="font-mono text-label tabular-nums tracking-[0.2em] text-flame">
                      {phase.step}
                    </span>
                    <h3 className="mt-1.5 font-display text-base font-semibold tracking-tight">
                      {phase.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-mute text-pretty">
                      {phase.detail}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </RevealCard>
        </div>
      </section>

      <Cta />
    </>
  )
}
