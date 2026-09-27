import { Link } from 'react-router-dom'
import { useRef } from 'react'
import Reveal, { RevealCard } from '../../components/ui/Reveal.jsx'
import TechBadge from '../../components/ui/TechIcon.jsx'
import LogoField from '../../components/LogoField.jsx'
import { profile, resume, availability } from '../../data/site.js'
import { bio, journey, proficiency, exploring } from '../../data/about.js'
import { TECH } from '../../data/categories.js'

/**
 * About hero.
 *
 * This used to be the full biography — a long summary, two bio paragraphs, a
 * pull quote and two buttons — with an architecture blueprint beside it. It was
 * the text-heaviest screen on the site and the diagram said nothing about the
 * person, so the copy is now a short headline and one line, and the panel shows
 * the real stack with real brand marks.
 */
export function AboutHero() {
  const heroRef = useRef(null)

  return (
    <section ref={heroRef} className="bleed relative overflow-hidden pt-(--nav-h)">
      {/* Background field. */}
      <div className="bleed-decor" aria-hidden="true">
        <div className="grid-field absolute inset-0 opacity-25 mask-fade-b" />
        <div className="absolute -top-32 left-1/4 h-[30rem] w-[30rem] rounded-full bg-flame/10 blur-[140px]" />
        <div className="absolute right-1/4 bottom-0 h-[26rem] w-[26rem] rounded-full bg-plasma/10 blur-[140px]" />
      </div>

      {/* The marks fill only the empty side of the hero. This used to be a
          full-bleed layer behind the text, which made the headline compete
          with the logos for legibility. */}
      <div className="shell relative z-10 py-(--spacing-margin)">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0">
            <Reveal>
              <p className="eyebrow">
                <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-lime" />
                About me
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-title font-extrabold text-balance">
                Full stack developer working across{' '}
                <span className="text-gradient">interfaces, services and data.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-6 max-w-xl text-lead font-light text-ink-dim text-pretty">
                {profile.summary}
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/projects" className="btn btn-primary">
                  See my work
                  <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_outward</span>
                </Link>
                <Link to={resume.fallbackRoute} className="btn btn-ghost">
                  Download resume
                  <span className="material-symbols-outlined text-base" aria-hidden="true">download</span>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Empty space beside the copy. No border, no panel — the marks are
              the content, so wrapping them in a box would only box them in
              again. Height reserves the room they fall into. */}
          <div className="pointer-events-none relative hidden h-[24rem] lg:block">
            <div className="pointer-events-auto absolute inset-0">
              <LogoField constraintsRef={heroRef} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The written story, directly under the hero.
 *
 * The biography paragraphs and the pull quote used to live inside the hero
 * itself, which made the top of the page a wall of text before anything had
 * been said. They are all still here — they just start once the headline and
 * the stack have landed.
 */
export default function Profile() {
  return (
    <section className="shell pb-(--spacing-margin)">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          {bio.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="text-lead font-light text-ink-dim text-pretty">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="panel h-full p-7">
            <p className="eyebrow">
              <span className="text-flame">◈</span>
              <span className="text-ink-faint">/</span>
              Where this work sits
            </p>
            <p className="mt-5 font-display text-lg leading-snug font-light text-ink text-pretty">
              {journey}
            </p>
            <dl className="mt-7 space-y-4 border-t border-line pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-label tracking-[0.18em] text-ink-faint uppercase">Focus</dt>
                <dd className="text-sm text-ink-dim">Backend + APIs</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-label tracking-[0.18em] text-ink-faint uppercase">Stack</dt>
                <dd className="text-sm text-ink-dim">{profile.stackLine}</dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Availability modes, proficiency groups, and what I am exploring. */
export function Background() {
  return (
    <>
      <section className="pb-(--spacing-margin)">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">
              <span className="text-flame">01</span>
              <span className="text-ink-faint">/</span>
              Available for
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {availability.modes.map((mode, i) => (
              <Reveal key={mode.key} delay={i * 0.08}>
                <div className="lift panel h-full p-6">
                  <div className="flex items-start justify-between">
                    <span className="material-symbols-outlined text-2xl text-flame" aria-hidden="true">
                      {mode.icon}
                    </span>
                    <span className={`chip ${mode.available ? 'border-lime/30 text-lime' : 'text-ink-faint'}`}>
                      {mode.available ? 'Open' : 'Limited'}
                    </span>
                  </div>
                  <h2 className="mt-5 font-display text-lg font-semibold tracking-tight">{mode.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mute text-pretty">{mode.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-(--spacing-margin)">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">
              <span className="text-flame">02</span>
              <span className="text-ink-faint">/</span>
              Skills
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 max-w-3xl font-display text-section font-bold text-balance">
              Grouped by depth, not by <span className="text-gradient">percentage.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-prose text-lead font-light text-ink-dim text-pretty">
              A number like “85%” does not mean anything to another engineer. What is useful is knowing
              where something sits in practice — so that is how this is grouped.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {proficiency.map((group, gi) => (
              <RevealCard key={group.key} delay={gi * 0.08} className="h-full">
                <div className="panel h-full p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-flame" aria-hidden="true">
                      {group.icon}
                    </span>
                    <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">{group.label}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-mute text-pretty">{group.note}</p>
                  <ul className="mt-6 flex flex-wrap items-center gap-2.5">
                    {group.items.map((key) => (
                      <li key={key} title={TECH[key]?.label}>
                        <TechBadge name={key} size="md" showLabel={false} />
                        <span className="sr-only">{TECH[key]?.label || key}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-(--spacing-margin)">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">
              <span className="text-flame">03</span>
              <span className="text-ink-faint">/</span>
              Currently exploring
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exploring.map((item, i) => (
              <RevealCard key={item.title} delay={i * 0.06} className="h-full">
                <div className="panel h-full p-6">
                  <span className="material-symbols-outlined text-2xl text-plasma" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mute text-pretty">{item.detail}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

