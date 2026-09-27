import { useMemo, useState } from 'react'
import { render } from '../../lib/diagram.js'

/**
 * A single system diagram.
 *
 * Output is vector SVG, so it stays sharp at any resolution and costs a few
 * kilobytes — this is what lets the site publish "4K" diagrams with no bitmap
 * payload. `w`/`h` only set the intrinsic aspect; layout comes from the
 * container via `ratio`.
 */
export default function DiagramImage({
  config,
  alt,
  ratio = '16 / 10',
  eager = false,
  className = '',
  imgClassName = '',
  onClick,
}) {
  const [loaded, setLoaded] = useState(false)

  const src = useMemo(() => render(config), [config])
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative block w-full overflow-hidden bg-panel ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <img
        src={src}
        alt={alt || ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[opacity,filter] duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0 blur-md'
        } ${imgClassName}`}
      />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-white/6 ring-inset" aria-hidden="true" />
    </Tag>
  )
}
