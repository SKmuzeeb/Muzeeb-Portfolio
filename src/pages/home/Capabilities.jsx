import { Link } from 'react-router-dom'
import SectionHeading from '../../components/SectionHeading.jsx'
import Reveal, { RevealGroup, RevealChild } from '../../components/ui/Reveal.jsx'
import TechIcon from '../../components/ui/TechIcon.jsx'
import { TECH_GROUPS } from '../../data/categories.js'
import { approach } from '../../data/about.js'

/** Endless marquee of the toolset. Duplicated once for a seamless loop. */
function ToolMarquee() {
  const row = [...TECH_GROUPS.flatMap((g) => g.items), ...TECH_GROUPS.flatMap((g) => g.items)]

  return (
    <div className="mask-fade-r relative overflow-hidden border-y border-line py-5" aria-label="Technologies used">
      <div className="marquee-track gap-8">
        {row.map((key, i) => (
          <span key={`${key}-${i}`} className="shrink-0 opacity-70 transition-opacity hover:opacity-100">
            <TechIcon name={key} showLabel={false} />
          </span>
        ))}
      </div>
    </div>
  )
}

const SERVICES = [
  {
    title: 'Full stack applications',
    detail:
      'React.js interfaces over Node.js services, with PostgreSQL for persistence and a REST API between them that both sides actually agree on.',
    icon: 'code',
    points: ['React.js', 'Node.js', 'PostgreSQL', 'REST'],
  },
  {
    title: 'Backend & APIs',
    detail:
      'Service design, validation, error contracts and query building — the parts of a product that have to stay correct after the interface moves on.',
    icon: 'dns',
    points: ['REST APIs', 'Knex.js', 'PostgreSQL', 'Node.js'],
  },
  {
    title: 'Third-party integrations',
    detail:
      'Microsoft Graph, Google APIs and payment providers consumed as ordinary services, isolated so the domain does not inherit their quirks.',
    icon: 'hub',
    points: ['Microsoft Graph', 'Google APIs', 'Stripe', 'Helcim'],
  },
  {
    title: 'Cloud & serverless',
    detail:
      'Packaging Node.js work for AWS Lambda, object storage in S3, and deployment that stays repeatable as the service count grows.',
    icon: 'cloud',
    points: ['AWS Lambda', 'AWS S3', 'Lambda Layers', 'Serverless'],
  },
]

export default function Capabilities() {
  return (
    <section id="capabilities" className="bleed scroll-mt-24 overflow-hidden py-(--spacing-margin)">
      <div className="bleed-decor" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-plasma/8 blur-[160px]" />
        <div className="grid-field absolute inset-0 opacity-25" />
      </div>

      <ToolMarquee />

      <div className="shell py-(--spacing-margin)">
        <SectionHeading
          index="03"
          kicker="What I build"
          title="Four layers, and how they"
          accent="fit together."
          lede="Most of my work sits across more than one of these. The interesting problems are always in the seams between them."
        />

        <RevealGroup className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          {SERVICES.map((service) => (
            <RevealChild
              key={service.title}
              className="group relative bg-panel p-8 transition-colors duration-500 hover:bg-panel-2"
            >
              <span className="material-symbols-outlined text-3xl text-flame" aria-hidden="true">
                {service.icon}
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{service.title}</h3>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-dim text-pretty">
                {service.detail}
              </p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {service.points.map((point) => (
                  <li key={point} className="chip">{point}</li>
                ))}
              </ul>
            </RevealChild>
          ))}
        </RevealGroup>

        <Reveal>
          <Link to="/tech-stack" className="btn btn-ghost mt-8">
            Full technology stack
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/** Six-step engineering approach. */
export function Approach() {
  return (
    <div className="shell pb-(--spacing-margin)">
      <RevealChild>
        <p className="eyebrow">
          <span className="text-flame">04</span>
          <span className="text-ink-faint">/</span>
          How I approach problems
        </p>
      </RevealChild>
      <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
        {approach.map((step) => (
          <RevealChild key={step.step} className="panel h-full p-6">
            <div className="flex items-start justify-between">
              <span className="material-symbols-outlined text-xl text-flame" aria-hidden="true">
                {step.icon}
              </span>
              <span className="font-mono text-label tracking-[0.2em] text-ink-faint">{step.step}</span>
            </div>
            <h3 className="mt-4 font-display text-base font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-mute text-pretty">{step.detail}</p>
          </RevealChild>
        ))}
      </RevealGroup>
    </div>
  )
}
