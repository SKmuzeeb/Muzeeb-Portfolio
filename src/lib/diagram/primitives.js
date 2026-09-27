/**
 * Diagram primitives.
 *
 * The portfolio's imagery is schematic rather than illustrative: layered
 * blueprints on a near-black field, drawn in thin strokes and mono labels.
 * Every generator in ./schemas.js composes these, so the visual language stays
 * consistent across architecture, flow, data and module diagrams.
 */
import { r2 } from '../prng.js'

export const PAD = 56

/** Faint 40px grid. */
export function grid(W, H) {
  const out = []
  for (let x = 0; x <= W; x += 40) out.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`)
  for (let y = 0; y <= H; y += 40) out.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`)
  return `<g stroke="#ffffff" stroke-opacity=".035" stroke-width="1">${out.join('')}</g>`
}

/** Blueprint field: grid, header rule, corner ticks, legend. */
export function frame({ W, H, title, sub, tag, accent, uid }) {
  const sweepId = `vf-sw-${uid}`
  const sweepW = Math.round(W * 0.3)
  return [
    `<rect width="${W}" height="${H}" fill="#06080d"/>`,
    `<g>${grid(W, H)}</g>`,
    `<defs><linearGradient id="${sweepId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${accent}" stop-opacity="0.07"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient></defs>`,
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="${accent}" stroke-opacity=".18"/>`,
    `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${accent}" stroke-opacity=".1"/>`,
    // A light band that crosses the whole frame every 7s — the cheapest
    // possible way to stop a large flat panel from reading as a dead image.
    `<rect class="vf-sweep" x="${Math.round(W / 2 - sweepW / 2)}" y="0" width="${sweepW}" height="${H}" fill="url(#${sweepId})"/>`,
    `<g font-family="monospace" letter-spacing="3">`,
    `<text x="${PAD}" y="${PAD + 2}" font-size="19" fill="${accent}" fill-opacity=".95">${esc(title)}</text>`,
    sub ? `<text x="${PAD}" y="${PAD + 30}" font-size="13" fill="#8a93a6" fill-opacity=".7">${esc(sub)}</text>` : '',
    `<text x="${W - PAD}" y="${PAD + 2}" font-size="13" text-anchor="end" fill="#8a93a6" fill-opacity=".5">${esc(tag)}</text>`,
    `<line x1="${PAD}" y1="${PAD + 52}" x2="${W - PAD}" y2="${PAD + 52}" stroke="${accent}" stroke-opacity=".22"/>`,
    `<text x="${W - PAD}" y="${H - 26}" font-size="12" text-anchor="end" fill="#8a93a6" fill-opacity=".4">DIAGRAM ${uid}</text>`,
    `</g>`,
  ].join('')
}

/** Node box with corner ticks — the core building block. */
export function node({ x, y, w, h, label, sub, accent, tone = 'idle', r = 4 }) {
  const stroke = tone === 'active' ? accent : '#3d465a'
  const fill = tone === 'active' ? hexA(accent, 0.1) : 'rgba(255,255,255,0.022)'
  const text = tone === 'active' ? '#f5f7fb' : '#a4adbd'
  const t = 9
  return [
    // Active nodes get a breathing halo, so the "current" hop in a request
    // path is obvious at a glance.
    tone === 'active'
      ? `<rect x="${r2(x - 4)}" y="${r2(y - 4)}" width="${r2(w + 8)}" height="${r2(h + 8)}" rx="${r + 4}" fill="none" stroke="${accent}" stroke-opacity=".3" class="pulse"/>`
      : '',
    `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`,
    `<g stroke="${stroke}" stroke-width="1.6" fill="none">`,
    `<path d="M ${r2(x)} ${r2(y + t)} L ${r2(x)} ${r2(y)} L ${r2(x + t)} ${r2(y)}"/>`,
    `<path d="M ${r2(x + w - t)} ${r2(y)} L ${r2(x + w)} ${r2(y)} L ${r2(x + w)} ${r2(y + t)}"/>`,
    `<path d="M ${r2(x + w)} ${r2(y + h - t)} L ${r2(x + w)} ${r2(y + h)} L ${r2(x + w - t)} ${r2(y + h)}"/>`,
    `<path d="M ${r2(x + t)} ${r2(y + h)} L ${r2(x)} ${r2(y + h)} L ${r2(x)} ${r2(y + h - t)}"/>`,
    `</g>`,
    `<text x="${r2(x + w / 2)}" y="${r2(y + h / 2 + (sub ? -4 : 5))}" font-family="monospace" font-size="15" letter-spacing="1.6" text-anchor="middle" fill="${text}">${esc(label)}</text>`,
    sub ? `<text x="${r2(x + w / 2)}" y="${r2(y + h / 2 + 17)}" font-family="monospace" font-size="11" letter-spacing="1.4" text-anchor="middle" fill="#67718a">${esc(sub)}</text>` : '',
  ].join('')
}

/** Vertical connector with a marching dash and a packet in transit. */
export function arrowDown(x, y1, y2, accent, { dashed = true } = {}) {
  const top = r2(y1)
  const bottom = r2(y2 - 8)
  return [
    `<line x1="${r2(x)}" y1="${top}" x2="${r2(x)}" y2="${bottom}" stroke="${accent}" stroke-opacity=".55" stroke-width="1.4"${dashed ? ' class="flow"' : ''}/>`,
    `<path d="M ${r2(x - 5)} ${r2(y2 - 9)} L ${r2(x)} ${r2(y2)} L ${r2(x + 5)} ${r2(y2 - 9)}" fill="none" stroke="${accent}" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    packet(x, y1, `M ${r2(x)} ${top} L ${r2(x)} ${bottom}`, accent),
  ].join('')
}

/** Horizontal connector with optional label. */
export function arrowRight(x1, x2, y, accent, label) {
  const from = r2(x1)
  const to = r2(x2 - 8)
  return [
    `<line x1="${from}" y1="${r2(y)}" x2="${to}" y2="${r2(y)}" stroke="${accent}" stroke-opacity=".55" stroke-width="1.4" class="flow"/>`,
    `<path d="M ${r2(x2 - 9)} ${r2(y - 5)} L ${r2(x2)} ${r2(y)} L ${r2(x2 - 9)} ${r2(y + 5)}" fill="none" stroke="${accent}" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    label ? `<text x="${r2((x1 + x2) / 2)}" y="${r2(y - 10)}" font-family="monospace" font-size="11" letter-spacing="1.4" text-anchor="middle" fill="#67718a">${esc(label)}</text>` : '',
    packet(y, x1, `M ${from} ${r2(y)} L ${to} ${r2(y)}`, accent),
  ].join('')
}

/** Upward connector. */
export function arrowUp(x, y1, y2, accent) {
  const from = r2(y2 + 8)
  const to = r2(y1)
  return [
    `<line x1="${r2(x)}" y1="${from}" x2="${r2(x)}" y2="${to}" stroke="${accent}" stroke-opacity=".55" stroke-width="1.4" class="flow"/>`,
    `<path d="M ${r2(x - 5)} ${r2(y2 + 9)} L ${r2(x)} ${r2(y2)} L ${r2(x + 5)} ${r2(y2 + 9)}" fill="none" stroke="${accent}" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    packet(x, y1, `M ${r2(x)} ${from} L ${r2(x)} ${to}`, accent),
  ].join('')
}

/**
 * A packet travelling the connector.
 *
 * Uses declarative SMIL `animateMotion` with an inline path, so it needs no
 * generated element id and keeps the diagram byte-for-byte deterministic —
 * which matters because diagrams are memoised and cached as data URIs.
 * SMIL animations do run inside an `<img>`-referenced SVG in every current
 * browser, so this animates without a single line of JavaScript.
 *
 * The start offset is derived from the geometry so neighbouring connectors
 * hand off in sequence instead of pulsing in lockstep.
 */
function packet(seedA, seedB, path, accent) {
  const begin = (Math.abs(seedA * 0.37 + seedB * 0.11) % 1.8).toFixed(2)
  const dur = (1.7 + (Math.abs(seedA + seedB) % 7) * 0.12).toFixed(2)
  return (
    `<g>` +
    `<circle r="7" fill="${accent}" fill-opacity=".16" class="pk-halo"/>` +
    `<circle r="2.6" fill="${accent}" fill-opacity=".95"/>` +
    `<animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${path}"/>` +
    `</g>`
  )
}

/** Caption for a band of nodes. */
export function groupLabel(x, y, text, accent) {
  return `<text x="${r2(x)}" y="${r2(y)}" font-family="monospace" font-size="12" letter-spacing="2.6" fill="${accent}" fill-opacity=".65">${esc(text)}</text>`
}

/** Small key/value panel, for legends and spec tables. */
export function spec({ x, y, w, rows, accent }) {
  return [
    `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(rows.length * 30 + 24)}" rx="4" fill="rgba(255,255,255,0.02)" stroke="#2a3142"/>`,
    rows.map((row, i) => `<g font-family="monospace" font-size="13"><text x="${r2(x + 18)}" y="${r2(y + 32 + i * 30)}" fill="#67718a" letter-spacing="1.4">${esc(row[0])}</text><text x="${r2(x + w - 18)}" y="${r2(y + 32 + i * 30)}" text-anchor="end" fill="${row[2] ? accent : '#a4adbd'}">${esc(row[1])}</text></g>`).join(''),
  ].join('')
}

/**
 * CSS injected once per diagram: marching dashes, a travelling packet halo,
 * a slow node pulse and a light sweep across the frame.
 *
 * All of it is declarative, so it animates inside an `<img>`-referenced SVG
 * with no JavaScript — which is what lets the diagrams stay cacheable,
 * deterministic data URIs and still move.
 */
export function motion() {
  return `<style>
    .flow{stroke-dasharray:5 9;animation:vf-flow 1.9s linear infinite}
    .pulse{animation:vf-pulse 3.4s ease-in-out infinite}
    .pk-halo{animation:vf-pk 1.9s ease-in-out infinite}
    .vf-sweep{animation:vf-sweep 7s ease-in-out infinite}
    .flow-focus{opacity:0;animation-name:vf-focus;animation-timing-function:linear;animation-iteration-count:infinite}
    @keyframes vf-flow{to{stroke-dashoffset:-28}}
    @keyframes vf-pulse{0%,100%{opacity:.35}50%{opacity:1}}
    @keyframes vf-pk{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:.85;transform:scale(1.25)}}
    @keyframes vf-sweep{0%,100%{transform:translateX(-120%)}50%{transform:translateX(120%)}}
    /* The focus light walks the stack: bright, then a short afterglow, then out. */
    @keyframes vf-focus{0%{opacity:0;stroke-width:1}3%{opacity:.95;stroke-width:2.4}13%{opacity:.22;stroke-width:1.4}20%,100%{opacity:0;stroke-width:1}}
    @media (prefers-reduced-motion: reduce){
      .flow,.pulse,.pk-halo,.vf-sweep,.flow-focus{animation:none}
      .flow-focus{opacity:.18}
    }
  </style>`
}

const HEX = /^#([0-9a-f]{6})$/i

/** #rrggbb + alpha → rgba() */
export function hexA(hex, a) {
  const m = HEX.exec(hex)
  if (!m) return `rgba(255,255,255,${a})`
  const n = Number.parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Escape text for XML. */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

