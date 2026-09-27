import Reveal from './ui/Reveal.jsx'

/**
 * The decisions behind a system, and what each one cost.
 *
 * Every case study already lists its stack, and a stack is a shopping list. What
 * tells a reader whether someone actually built the thing is what they decided
 * *against*, and what that decision cost. So each entry is three parts — the
 * choice, why it was forced, and what was given up — and the cost is a required
 * field rather than an optional closing thought.
 *
 * A decision with nothing given up is usually one that was never examined, so
 * there is no version of this that renders a costless trade-off.
 *
 * The boundaries that follow matter for the same reason. A list of what a system
 * deliberately does not do says more about engineering judgement than a longer
 * list of features would.
 */
export default function ProjectDecisions({ project }) {
  const decisions = project.decisions ?? []
  const boundaries = project.boundaries ?? []
  if (!decisions.length && !boundaries.length) return null

  return (
    <section className="py-(--spacing-margin)">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">
            <span className="text-flame">03</span>
            <span className="text-ink-faint">/</span>
            Design decisions
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-3xl font-display text-section font-bold text-balance">
            What was decided, and{' '}
            <span className="text-gradient">what it cost.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-prose text-lead font-light text-ink-dim text-pretty">
            The stack is the easy part. These are the calls that actually shaped {project.title} —
            including what each one gave up.
          </p>
        </Reveal>

        {/* Numbered, not cards. The order here is the order the decisions were
            made, which is the only order that means anything. */}
        <ol className="mt-14 space-y-px border-t border-line">
          {decisions.map((d, i) => (
            <li key={d.title}>
              <Reveal delay={0.04 + i * 0.05}>
                <article className="grid gap-x-10 gap-y-4 border-b border-line py-8 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.05fr)]">
                  <span
                    className="font-mono text-mono text-ink-faint"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-bold tracking-tight text-balance">
                      {d.title}
                    </h3>
                    {/* The choice, stated plainly, before any reasoning. */}
                    <p className="mt-3 text-sm leading-relaxed text-ink text-pretty">{d.choice}</p>
                  </div>

                  <div className="min-w-0 space-y-4">
                    <div>
                      <p className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
                        Because
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-dim text-pretty">
                        {d.because}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
                        At the cost of
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-mute text-pretty">
                        {d.cost}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        {boundaries.length > 0 && (
          <Reveal delay={0.08}>
            <div className="mt-14 border-t border-line pt-10">
              <h3 className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
                What {project.title} deliberately does not do
              </h3>
              <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {boundaries.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full border border-ink-faint"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-relaxed text-ink-dim text-pretty">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
