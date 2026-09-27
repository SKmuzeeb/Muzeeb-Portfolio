import { TECH } from '../../data/categories.js'
import { logoFor } from '../../lib/logos.js'

/**
 * Technology badge.
 *
 * Draws the tool's real brand mark from `lib/logos.js` — the actual React atom,
 * the actual Node.js hexagon, the actual PostgreSQL elephant. Only tools with
 * no vendor artwork of their own (REST, Knex, Helcim) fall back to the
 * monogram in `TECH[key].mark`, so nothing on the site is ever a logo I drew.
 *
 * The disc is round and carries no border: a framed square on top of an
 * already-framed chip was reading as two boxes, and the official logos bring
 * their own padding, so an extra outline only made them look smaller and
 * squashed. The mark sits at 62% of the disc for that reason.
 */
const SIZES = {
  sm: { box: 'h-8 w-8 text-[0.8rem]', label: 'text-[0.7rem]' },
  md: { box: 'h-10 w-10 text-base', label: 'text-xs' },
  lg: { box: 'h-12 w-12 text-lg', label: 'text-sm' },
  xl: { box: 'h-16 w-16 text-2xl', label: 'text-base' },
}

export default function TechBadge({ name, tech, size = 'md', showLabel = true, className = '' }) {
  // `tech` is the clearer name; `name` is kept because existing call sites
  // (and the filename) already use it.
  const key = tech || name
  const app = TECH[key]
  if (!app) return null
  const s = SIZES[size] || SIZES.md
  const logo = logoFor(key)

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`grid shrink-0 place-items-center rounded-full font-mono font-semibold leading-none transition-transform duration-400 ${s.box}`}
        style={{ color: app.color, background: `${app.color}1c` }}
        title={app.label}
        aria-hidden="true"
      >
        {logo ? (
          <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="currentColor" focusable="false">
            <path d={logo} />
          </svg>
        ) : (
          app.mark
        )}
      </span>
      {showLabel ? (
        <span className={`font-mono tracking-[0.1em] text-ink-dim uppercase ${s.label}`}>
          {app.label}
        </span>
      ) : (
        <span className="sr-only">{app.label}</span>
      )}
    </span>
  )
}

/** Bare badge with no visible label — for dense rows like the marquee. */
export function TechMark({ name, tech, size = 'md', className = '' }) {
  return <TechBadge name={name} tech={tech} size={size} showLabel={false} className={className} />
}
