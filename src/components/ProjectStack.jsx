import TechBadge from './ui/TechIcon.jsx'
import { TECH_GROUPS } from '../data/categories.js'

/**
 * The project's stack, grouped by the layer each technology sits in.
 *
 * A flat list of chips answers "what" but not "where". Grouping by layer
 * makes the shape of the system readable at a glance — a React front end over
 * a Node service over PostgreSQL, with the external providers listed
 * separately from the things the team owns.
 *
 * `tools` is deliberately dropped: git and Postman are how the work gets done,
 * not what the system is made of, and they only add noise here.
 */
const HIDDEN_GROUPS = new Set(['tools'])

export default function ProjectStack({ project, size = 'md', className = '' }) {
  const used = new Set(project.tech)

  const groups = TECH_GROUPS
    .filter((g) => !HIDDEN_GROUPS.has(g.key))
    .map((g) => ({ ...g, present: g.items.filter((k) => used.has(k)) }))
    .filter((g) => g.present.length > 0)

  if (!groups.length) return null

  return (
    <div className={className}>
      <p className="eyebrow">
        <span className="text-flame">◈</span>
        <span className="text-ink-faint">/</span>
        What this is built on
      </p>

      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.key} className="border-t border-line pt-3.5">
            <dt className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">
              {group.label}
            </dt>
            <dd className="mt-3 flex flex-wrap gap-x-4 gap-y-2.5">
              {group.present.map((key) => (
                <TechBadge key={key} name={key} size={size} />
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * Compact row of badges — card footers and dense headers.
 *
 * With `animate`, the badges lift and scale on the parent's hover, staggered
 * left to right. The stagger is a per-item `transition-delay` rather than
 * JavaScript so it runs entirely on the compositor and cannot stutter.
 */
export function StackRow({ keys, size = 'sm', animate = false, className = '' }) {
  if (!keys?.length) return null
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {keys.map((key, i) => (
        <li
          key={key}
          className={animate ? 'stack-mark' : undefined}
          style={animate ? { transitionDelay: `${i * 45}ms` } : undefined}
        >
          <TechBadge name={key} size={size} showLabel={false} />
        </li>
      ))}
    </ul>
  )
}