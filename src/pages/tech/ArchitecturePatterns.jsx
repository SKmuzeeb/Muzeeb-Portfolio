import Reveal, { RevealGroup, RevealChild } from '../../components/ui/Reveal.jsx'
import DiagramImage from '../../components/ui/DiagramImage.jsx'
import SectionHeading from '../../components/SectionHeading.jsx'
import { TECH } from '../../data/categories.js'
import { architectures } from '../../data/architecture.js'

/** The three architecture patterns, each with a generated layered diagram. */
export default function ArchitecturePatterns() {
  return (
    <section className="shell pb-(--spacing-margin)">
      <Reveal>
        <p className="eyebrow">
          <span className="text-flame">✦</span>
          <span className="text-ink-faint">/</span>
          Architecture patterns
        </p>
      </Reveal>

      <RevealGroup className="mt-10 space-y-6" stagger={0.08}>
        {architectures.map((arch) => (
          <RevealChild key={arch.id}>
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="panel p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold tracking-tight">{arch.label}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-mute text-pretty">{arch.blurb}</p>

                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {arch.steps.map((key) => (
                    <li
                      key={key}
                      className="rounded-full border px-3 py-1.5 font-mono text-label"
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

                <ul className="mt-6 space-y-2 border-t border-line pt-5">
                  {arch.notes.map((note) => (
                    <li key={note} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-plasma" aria-hidden="true" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              <Reveal>
                <DiagramImage
                  config={{
                    schema: 'layered',
                    seed: `arch-${arch.id}`,
                    accent: arch.accent,
                    title: arch.label,
                    tag: 'PATTERN',
                    sub: arch.blurb,
                    layers: arch.steps.map((key, i) => ({
                      tag: `LAYER ${String(i + 1).padStart(2, '0')}`,
                      label: TECH[key].label,
                      sub: i === 0 ? 'entry point' : '',
                      side: [TECH[key].mark, key],
                    })),
                  }}
                  alt={`${arch.label} — layered architecture diagram`}
                  ratio="4 / 3"
                />
              </Reveal>
            </div>
          </RevealChild>
        ))}
      </RevealGroup>
    </section>
  )
}

/** "How I build" narrative, paired with the animated flow. */
export function HowIBuildIntro() {
  const notes = [
    'The client never talks to the database directly.',
    'Business rules live in the service layer, not in routes or components.',
    'Tenancy and role scope are applied to the query, not only to the view.',
    'External providers are isolated behind a service boundary.',
  ]

  return (
    <div>
      <SectionHeading
        index="✦"
        kicker="How I build"
        title="The default"
        accent="request path."
        lede="Most of what I build ends up in this shape. The interesting decisions are not the technologies — they are where the boundaries go."
      />
      <Reveal delay={0.2}>
        <ul className="mt-8 space-y-3">
          {notes.map((note) => (
            <li key={note} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-flame" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  )
}
