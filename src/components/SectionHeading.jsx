import Reveal from './ui/Reveal.jsx'

/** Consistent section header: numbered kicker, title, optional lede. */
export default function SectionHeading({ index, kicker, title, accent, lede, align = 'left', className = '' }) {
  const centred = align === 'center'

  return (
    <div className={`${centred ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'} ${className}`}>
      <Reveal>
        <p className="eyebrow">
          {index && <span className="text-flame">{index}</span>}
          {index && <span className="text-ink-faint">/</span>}
          {kicker}
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 font-display text-section font-bold text-balance">
          {title} {accent && <span className="text-gradient">{accent}</span>}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.16}>
          <p className="mt-5 max-w-prose text-lead font-light text-ink-dim text-pretty">
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  )
}
