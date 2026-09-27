/**
 * Project cover art.
 *
 * A project used to lead with one of its own blueprint diagrams, which made
 * every card look like the same technical drawing — the diagram says how the
 * system is wired, not what the system *is*.
 *
 * Each cover is now one of three kinds:
 *   'logos' — real vendor marks wired together with a flow, for a system whose
 *             identity IS its integrations (Migratron moves data between
 *             Google, a tenant and Microsoft 365).
 *   'word'   — a white uppercase wordmark, for a product with a name.
 *   'glyph'  — a domain mark that belongs to nobody's trademark, for a system
 *             defined by what it does rather than who it talks to.
 *
 * Vendor marks come from `lib/logos.js` and are never drawn here. Output is a
 * deterministic, cacheable data URI and all motion is declarative CSS, so it
 * animates inside an `<img>` with no JavaScript and no repaint.
 *
 * To use a real screenshot instead, set `cover: '/media/slug.png'` on the
 * project record — see `coverFor`.
 */
import { createRng } from './prng.js'
import { resolveAccent } from './palettes.js'
import { logoFor } from './logos.js'
import { TECH } from '../data/categories.js'

/** Cover definitions, keyed by project slug. */
const COVERS = {
  /**
   * Migratron moves users, mail, files and permissions between tenants and
   * between Google and a tenant. Those are real integrations, so the cover
   * shows the real Google and Microsoft marks either side of a tenant, with
   * packets travelling both ways.
   */
  migratron: {
    kind: 'logos',
    caption: 'GOOGLE · TENANT · MICROSOFT',
    nodes: [
      { logo: 'google', label: 'Google' },
      { tenant: 'Tenant' },
      { logo: 'microsoft', label: 'Microsoft 365' },
    ],
  },

  /** SITE2GYM is a product with a name — show the name. */
  site2gym: { kind: 'word', word: 'S2G', caption: 'FITNESS & CLUB PLATFORM' },

  /** Payment workflows — the same wordmark treatment. */
  'payment-workflows': { kind: 'word', word: 'PAYMENTS', caption: 'TRANSACTION WORKFLOWS' },

  /** Employee & club management — access control and operations. */
  'employee-club-management': {
    kind: 'word',
    word: 'ACCESS',
    caption: 'EMPLOYEE & CLUB OPERATIONS',
  },

  /** Personal training — trainers, availability and bookings. */
  'personal-training': {
    kind: 'word',
    word: 'TRAINING',
    caption: 'SCHEDULING & BOOKINGS',
  },
}

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

/** Faint blueprint grid, matching the diagram language. */
function grid(W, H, step = 48) {
  const out = []
  for (let x = 0; x <= W; x += step) out.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`)
  for (let y = 0; y <= H; y += step) out.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`)
  return `<g stroke="#ffffff" stroke-opacity=".03" stroke-width="1">${out.join('')}</g>`
}

/** A vendor mark, drawn 1:1 from its official path in its own brand colour. */
function vendorMark(key, x, y, size) {
  const d = logoFor(key)
  if (!d) return ''
  const colour = TECH[key]?.color || '#f5f7fb'
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(size / 24).toFixed(4)})" fill="${colour}"><path d="${d}"/></g>`
}

/* ── Kind: logos ─────────────────────────────────────────────
   Vendor marks either side of the domain's own concept, with packets
   travelling both ways so the migration reads as a flow, not logo soup. */
function logosBody(spec, { W, H, accent, accent2 }) {
  const cy = H / 2 - H * 0.02
  const mark = Math.min(W, H) * 0.13
  const tile = Math.min(W, H) * 0.2
  const nodes = spec.nodes
  const gap = (W * 0.78) / (nodes.length - 1)
  const x0 = W / 2 - (gap * (nodes.length - 1)) / 2

  const out = []
  nodes.forEach((node, i) => {
    const cx = x0 + i * gap

    if (i > 0) {
      const from = x0 + (i - 1) * gap
      const a = from + mark * 0.78
      const b = cx - mark * 0.78
      // Two lanes, so the flow reads as data moving in both directions.
      ;[-1, 1].forEach((dir, li) => {
        const y = cy + dir * Math.min(W, H) * 0.105
        const col = li === 0 ? accent : accent2
        out.push(
          `<line x1="${a.toFixed(1)}" y1="${y.toFixed(1)}" x2="${b.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${col}" stroke-opacity=".45" stroke-width="2" class="flow"/>`,
        )
        out.push(
          `<g><circle r="9" fill="${col}" fill-opacity=".16" class="pk-halo"/>` +
            `<circle r="3.4" fill="${col}"/>` +
            `<animateMotion dur="${(2.2 + li * 0.5).toFixed(2)}s" begin="${(li * 1.1).toFixed(2)}s" repeatCount="indefinite" ` +
            `path="M ${a.toFixed(1)} ${y.toFixed(1)} L ${b.toFixed(1)} ${y.toFixed(1)}"/></g>`,
        )
      })
    }

    if (node.tenant) {
      // A tenant is our own concept, so it gets a neutral card, not a logo.
      const x = cx - tile / 2
      const y = cy - tile / 2
      out.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${tile.toFixed(1)}" height="${tile.toFixed(1)}" rx="18" fill="${accent}" fill-opacity=".07" stroke="${accent}" stroke-opacity=".55" stroke-width="2"/>`,
        `<text x="${cx.toFixed(1)}" y="${(cy + 7).toFixed(1)}" font-family="monospace" font-size="26" letter-spacing="2" text-anchor="middle" fill="#f5f7fb">${esc(node.tenant.toUpperCase())}</text>`,
      )
    } else if (node.logo) {
      out.push(vendorMark(node.logo, cx - mark / 2, cy - mark / 2, mark))
    }

    out.push(
      `<text x="${cx.toFixed(1)}" y="${(cy + Math.min(W, H) * 0.2).toFixed(1)}" font-family="monospace" font-size="19" letter-spacing="3" text-anchor="middle" fill="#a4adbd">${esc(node.label || '')}</text>`,
    )
  })

  return out.join('')
}

/* ── Kind: word ───────────────────────────────────────────────
   A white uppercase wordmark, sized to the canvas.

   The fit is deliberately conservative. An earlier version used
   `(W * 1.5) / word.length`, which put "PAYMENTS" at roughly 1,190px inside a
   1,200px canvas — technically inside the frame, but with no margin, so any
   letter-spacing or a slightly wider fallback face pushed it out and the
   wordmark clipped. Measuring at 1.05 leaves a real margin either side. */
function wordBody(spec, { W, H, accent }) {
  const word = String(spec.word || '').toUpperCase()
  const size = Math.min(H * 0.3, (W * 1.05) / Math.max(word.length, 1))
  return (
    `<text x="${W / 2}" y="${(H / 2 + size * 0.34).toFixed(1)}" font-family="Sora, Inter, system-ui, sans-serif" ` +
    `font-size="${size.toFixed(1)}" font-weight="800" letter-spacing="${(size * 0.03).toFixed(2)}" ` +
    `text-anchor="middle" fill="#ffffff" class="cv-word">${esc(word)}</text>` +
    `<rect x="${((W - size * 0.45) / 2).toFixed(1)}" y="${(H / 2 + size * 0.6).toFixed(1)}" width="${(size * 0.45).toFixed(1)}" height="3" rx="1.5" fill="${accent}" fill-opacity=".7"/>`
  )
}

/* ── Kind: glyph ──────────────────────────────────────────────
   A domain mark on a 100x100 grid, scaled up. Not a trademark. */
function glyphBody(spec, { W, H }) {
  const s = (Math.min(W, H) * 0.4) / 100
  const gx = W / 2 - 50 * s
  const gy = H / 2 - 50 * s - H * 0.02
  const sw = (5 / s).toFixed(2)
  const paths = spec.paths
    .map(
      (d, i) =>
        `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${i === 0 ? 1 : 0.82}"/>`,
    )
    .join('')
  return `<g class="cv-core" color="#f5f7fb" transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)}) scale(${s.toFixed(4)})">${paths}</g>`
}

/** SVG markup for a project's cover. */
export function renderCoverSvg(project, { w = 1200, h = 900 } = {}) {
  const palette = resolveAccent(project.visual?.accent)
  const accent = palette.a1
  const accent2 = palette.a2
  const spec = COVERS[project.slug] || { kind: 'word', word: 'SYSTEM', caption: '' }
  const uid = String(Math.abs(Math.round(createRng(`cover:${project.slug}`)() * 8999)) + 1000)

  const cx = w / 2
  const cy = h / 2
  const body =
    spec.kind === 'logos'
      ? logosBody(spec, { W: w, H: h, accent, accent2 })
      : spec.kind === 'word'
        ? wordBody(spec, { W: w, H: h, accent })
        : glyphBody(spec, { W: w, H: h })

  const orbit = (r, dash) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-opacity=".16" stroke-width="1.5" stroke-dasharray="${dash}"/>`

  // Satellites travelling the orbit, so the cover is alive without any JS.
  const satellite = (r, dur, delay, size) =>
    `<g><circle r="${size * 3}" fill="${accent2}" fill-opacity=".14"/>` +
    `<circle r="${size}" fill="${accent2}" fill-opacity=".9"/>` +
    `<animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite" ` +
    `path="M ${cx - r} ${cy} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0"/>` +
    `</g>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">` +
    `<style>
      .cv-glow{animation:cv-glow 6s ease-in-out infinite}
      .cv-core{animation:cv-core 5s ease-in-out infinite}
      .cv-sweep{animation:cv-sweep 8s ease-in-out infinite}
      .cv-word{animation:cv-word 6s ease-in-out infinite}
      .flow{stroke-dasharray:5 9;animation:cv-dash 1.9s linear infinite}
      .pk-halo{animation:cv-pk 1.9s ease-in-out infinite}
      @keyframes cv-glow{0%,100%{opacity:.5}50%{opacity:.85}}
      @keyframes cv-core{0%,100%{opacity:.85}50%{opacity:1}}
      @keyframes cv-word{0%,100%{opacity:.94}50%{opacity:1}}
      @keyframes cv-sweep{0%,100%{transform:translateX(-130%)}50%{transform:translateX(130%)}}
      @keyframes cv-dash{to{stroke-dashoffset:-28}}
      @keyframes cv-pk{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:.85;transform:scale(1.25)}}
      @media (prefers-reduced-motion: reduce){.cv-glow,.cv-core,.cv-sweep,.cv-word,.flow,.pk-halo{animation:none}}
    </style>` +
    `<defs>
      <radialGradient id="cvg-${uid}" cx="50%" cy="48%" r="62%">
        <stop offset="0" stop-color="${accent}" stop-opacity=".32"/>
        <stop offset="0.55" stop-color="${accent}" stop-opacity=".07"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="cvs-${uid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
        <stop offset="0.5" stop-color="${accent}" stop-opacity=".10"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </linearGradient>
    </defs>` +
    `<rect width="${w}" height="${h}" fill="#06080d"/>` +
    grid(w, h) +
    `<rect width="${w}" height="${h}" fill="url(#cvg-${uid})" class="cv-glow"/>` +
    orbit(Math.min(w, h) * 0.38, '3 9') +
    orbit(Math.min(w, h) * 0.46, '2 14') +
    satellite(Math.min(w, h) * 0.38, 11, 0, 4) +
    satellite(Math.min(w, h) * 0.46, 17, 3.4, 3) +
    body +
    `<rect class="cv-sweep" x="${(w * 0.2).toFixed(1)}" y="0" width="${(w * 0.3).toFixed(1)}" height="${h}" fill="url(#cvs-${uid})"/>` +
    `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${accent}" stroke-opacity=".2"/>` +
    (spec.caption
      ? `<text x="44" y="${h - 44}" font-family="monospace" font-size="26" letter-spacing="5" fill="${accent}" fill-opacity=".75">${esc(spec.caption)}</text>`
      : '') +
    `</svg>`
  )
}

const toDataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg.replace(/>\s+</g, '><').trim())}`

const cache = new Map()

/** Memoised cover data URI — safe to call during render. */
export function renderCover(project, opts) {
  const key = `${project.slug}:${opts?.w ?? 1200}x${opts?.h ?? 900}`
  if (!cache.has(key)) cache.set(key, toDataUri(renderCoverSvg(project, opts)))
  return cache.get(key)
}

/**
 * A real project image always wins over generated art.
 *
 * Set `cover: '/media/migratron.png'` on a project record and that file is
 * used; until then the generated cover stands in. Keeping the decision here
 * means the hero, the card and the related rail can never disagree.
 */
export function coverFor(project) {
  return project.cover || renderCover(project)
}

/** True when the project points at a real image rather than generated art. */
export const hasRealCover = (project) => Boolean(project.cover)

export { COVERS }

