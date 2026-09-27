import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import DiagramImage from './ui/DiagramImage.jsx'
import TechBadge from './ui/TechIcon.jsx'
import { TECH } from '../data/categories.js'
import { useParallax } from '../hooks/index.js'

const EASE = [0.16, 1, 0.3, 1]
const STEP_MS = 2000

/**
 * The request path, drawn as a diagram rather than a list of boxes.
 *
 * The flowchart used to be five hand-built cards with a monogram, a label and
 * a hardcoded 36px connector between them. The site already generates proper
 * layered system diagrams, so this now renders that image instead: the boxes
 * in the flow are part of the artwork, they can never disagree with the rest
 * of the site's diagrams, and the flow animates itself — packets in transit
 * plus a focus light that walks the stack — with no JavaScript and no image
 * swapping, so it never flickers.
 *
 * The text underneath is a plain index, not a second row of boxes. It exists
 * only to name the hop currently in flight, so the image is never the sole
 * thing carrying the meaning.
 *
 * Sizing note: the diagram is authored at 1400x860 on purpose. At the full
 * shell width the 15px SVG labels land at a readable size; squeezed into a
 * half-width column they would scale down to roughly 5px.
 */
export default function ArchitectureFlow({ nodes }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const drift = useParallax({ depth: 0.35, max: 14, feel: 'tight' })

  const config = useMemo(
    () => ({
      schema: 'layered',
      seed: 'request-path',
      accent: 'flame',
      title: 'How I build',
      tag: 'REQUEST PATH',
      sub: 'Client to database and back',
      w: 1400,
      h: 860,
      layers: nodes.map((n) => ({
        tag: TECH[n.tech].label.toUpperCase(),
        label: n.label,
        sub: n.sub,
        side: n.side,
      })),
    }),
    [nodes],
  )

  useEffect(() => {
    if (reduced || nodes.length < 2) return undefined
    const id = setInterval(() => setActive((i) => (i + 1) % nodes.length), STEP_MS)
    return () => clearInterval(id)
  }, [reduced, nodes.length])

  if (!nodes.length) return null

  return (
    <div className="relative">
      {/* Status row — says what the image is doing, in words. */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <span className="flex items-center gap-2 font-mono text-label tracking-[0.2em] text-ink-mute uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-flame" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flame" />
          </span>
          Request in flight
        </span>
        <span className="font-mono text-mono tabular-nums text-ink-faint">
          <span className="text-flame">{String(active + 1).padStart(2, '0')}</span>
          <span className="mx-1.5">/</span>
          {String(nodes.length).padStart(2, '0')}
        </span>
      </div>

      {/* The flow itself.

          Hidden on phones on purpose. The diagram is authored at 1400px wide
          with 15px labels, so in a ~340px viewport those labels land at about
          3.6px — technically an image, functionally unreadable. The text index
          below carries the same information at a size a phone can actually
          read, so the phone gets that instead of a picture of text. */}
      <motion.div
        className="panel hidden overflow-hidden p-2 md:block"
        initial={reduced ? false : { opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: EASE }}
        style={reduced ? undefined : { x: drift.x, y: drift.y }}
      >
        <DiagramImage
          config={config}
          alt="Animated request path from the React.js client through the REST API, service layer, Knex.js query layer and PostgreSQL"
          ratio="1400 / 860"
          eager
        />
      </motion.div>

      {/* Text index. This is what a phone shows instead of the diagram, so it is
          a genuine vertical flow on small screens — spine and node dots — and
          turns into the horizontal rules-and-type row once there is room. */}
      <motion.ol
        className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-5"
        style={reduced ? undefined : { x: drift.x }}
      >
        {nodes.map((node, i) => {
          const tech = TECH[node.tech]
          const isActive = i === active
          return (
            <li
              key={node.id}
              className="relative border-line pl-6 sm:pl-0 lg:border-t lg:pt-3"
              style={{
                borderColor: isActive ? tech.color : 'var(--color-line)',
                transition: 'border-color 600ms var(--ease-out-expo)',
              }}
            >
              {/* Node dot, small screens only. */}
              <span
                className="absolute top-1.5 -left-[3px] h-1.5 w-1.5 rounded-full sm:hidden"
                style={{ background: tech.color }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-3 sm:block">
                <TechBadge name={node.tech} size="sm" showLabel={false} />
                <span
                  className="font-mono text-label tabular-nums tracking-[0.16em]"
                  style={{
                    color: isActive ? tech.color : 'var(--color-ink-faint)',
                    transition: 'color 600ms var(--ease-out-expo)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <p
                className="mt-1.5 font-display text-sm font-semibold tracking-tight"
                style={{
                  color: isActive ? 'var(--color-ink)' : 'var(--color-ink-dim)',
                  transition: 'color 600ms var(--ease-out-expo)',
                }}
              >
                {node.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-mute">{tech.label}</p>
            </li>
          )
        })}
      </motion.ol>
    </div>
  )
}
