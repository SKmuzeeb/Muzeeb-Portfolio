import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import TechBadge from './ui/TechIcon.jsx'
import { useParallax } from '../hooks/index.js'

const STEP_MS = 2100

/**
 * The default full-stack shape, drawn as the real tools rather than as prose.
 *
 * The About hero used to be a wall of text next to a blueprint diagram, which
 * said "here is a picture of an architecture" instead of "this is what I am".
 * This is the same idea as a stack: React at the top, PostgreSQL at the
 * bottom, with a packet travelling the joins and each layer lighting up as it
 * is reached.
 *
 * It is a DOM component rather than a generated SVG on purpose — the badges are
 * the real brand marks, which stay crisp and pick up their brand colour, and
 * the whole column can lean with the pointer.
 */
const LAYERS = [
  { key: 'react', label: 'Client', sub: 'interface & routing' },
  { key: 'rest', label: 'REST API', sub: 'transport' },
  { key: 'node', label: 'Service layer', sub: 'business logic' },
  { key: 'knex', label: 'Query layer', sub: 'query building' },
  { key: 'postgres', label: 'Database', sub: 'system of record' },
]

export default function StackLayers({ layers = LAYERS, compact = false }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const drift = useParallax({ depth: 0.4, max: compact ? 10 : 18, feel: 'tight' })

  useEffect(() => {
    if (reduced || layers.length < 2) return undefined
    const id = setInterval(() => setActive((i) => (i + 1) % layers.length), STEP_MS)
    return () => clearInterval(id)
  }, [reduced, layers.length])

  const current = layers[active] || layers[0]
  if (!current) return null

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 font-mono text-label tracking-[0.2em] text-ink-mute uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-flame" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flame" />
          </span>
          Stack
        </span>
        <span className="font-mono text-mono tabular-nums text-ink-faint">
          {String(active + 1).padStart(2, '0')} / {String(layers.length).padStart(2, '0')}
        </span>
      </div>

      <motion.ol className="relative" style={reduced ? undefined : { x: drift.x, y: drift.y }}>
        {layers.map((layer, i) => {
          const isActive = i === active
          return (
            <li key={layer.key} className="relative">
              {/* Connector sits in flow, so it can never drift out of alignment
                  no matter how tall the row above it becomes. */}
              {i > 0 && (
                <div className="relative ml-[1.25rem] h-7 w-px" aria-hidden="true">
                  <span className="absolute inset-0 bg-linear-to-b from-flame/25 to-flame/60" />
                  {!reduced && (
                    <span
                      className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-flame"
                      style={{ animation: 'pk 2.1s cubic-bezier(0.45,0,0.55,1) infinite' }}
                    />
                  )}
                </div>
              )}

              <motion.div
                className="flex items-center gap-4 rounded-full py-2 pl-1 pr-5"
                style={{ background: isActive ? 'rgb(255 106 26 / 0.07)' : 'transparent' }}
                animate={reduced ? undefined : { x: isActive ? 4 : 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <TechBadge name={layer.key} size={compact ? 'md' : 'lg'} showLabel={false} />
                <span className="min-w-0">
                  <span
                    className="block font-display text-sm font-semibold tracking-tight"
                    style={{ color: isActive ? '#f5f7fb' : '#a4adbd', transition: 'color 500ms var(--ease-out-expo)' }}
                  >
                    {layer.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-label tracking-[0.08em] text-ink-faint">
                    {layer.sub}
                  </span>
                </span>
              </motion.div>
            </li>
          )
        })}
      </motion.ol>

      <p className="mt-5 ml-1 font-mono text-mono text-ink-faint" aria-live="polite">
        <span className="text-flame">{current.label}</span> — {current.sub}
      </p>
    </div>
  )
}