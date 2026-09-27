/**
 * Diagram schemas.
 *
 * Each generator receives a spec object (labels come from project data, not
 * from here) and returns SVG markup. Keeping labels in the data layer means
 * the diagrams always match the written case study.
 */
import { r2 } from '../prng.js'
import { node, arrowDown, arrowRight, groupLabel, esc, PAD } from './primitives.js'

const CONTENT_TOP = PAD + 96
const CONTENT_BOTTOM = 1180

/* ── Layered architecture: request path top to bottom ─────── */
function layered({ W, H, accent, layers }) {
  const out = []
  const n = layers.length
  const gap = 28
  const footY = H - 26
  // Usable band between the header rule and the footer caption. The previous
  // version used a hardcoded 1028px band regardless of H, so the last layer
  // and the footer text ran straight off a 1000px-tall canvas.
  const band = footY - 44 - CONTENT_TOP
  const boxH = Math.max(52, Math.min(104, (band - gap * (n - 1)) / n))
  const blockH = boxH * n + gap * (n - 1)
  const y0 = CONTENT_TOP + Math.max(0, (band - blockH) / 2)
  const boxW = W - PAD * 2 - 260
  const x = PAD
  // One full pass of the focus light, in seconds.
  const cycle = Math.max(6, n * 1.9)

  layers.forEach((layer, i) => {
    const y = y0 + i * (boxH + gap)
    out.push(groupLabel(x, y - 12, layer.tag, accent))
    // A focus light that walks the stack one layer at a time. Because it is a
    // plain CSS animation with a per-layer delay, the whole flowchart
    // animates itself inside a static, cacheable data URI — no JS, no image
    // swapping, so it never flickers.
    out.push(
      `<rect class="flow-focus" x="${r2(x - 5)}" y="${r2(y - 5)}" width="${r2(boxW + 10)}" height="${r2(boxH + 10)}" rx="8" fill="none" stroke="${accent}" style="animation-duration:${cycle.toFixed(2)}s;animation-delay:${((i * cycle) / n).toFixed(2)}s"/>`,
    )
    out.push(node({ x, y, w: boxW, h: boxH, label: layer.label, sub: layer.sub, accent, tone: i === 0 ? 'active' : 'idle' }))
    if (layer.side) out.push(node({ x: x + boxW + 28, y, w: 232, h: boxH, label: layer.side[0], sub: layer.side[1], accent, tone: 'idle' }))
    if (i < n - 1) out.push(arrowDown(x + boxW / 2, y + boxH, y + boxH + gap, accent, { dashed: layer.dashed !== false }))
  })

  out.push(`<text x="${PAD}" y="${footY}" font-family="monospace" font-size="12" letter-spacing="2" fill="#67718a">REQUEST PATH — TOP TO BOTTOM</text>`)
  return out.join('')
}

/* ── Linear pipeline: step by step ───────────────────────── */
function pipeline({ W, accent, steps }) {
  const out = []
  const n = steps.length
  const cols = Math.min(n, 4)
  const rows = Math.ceil(n / cols)
  const gapX = 46
  const gapY = 78
  const boxW = (W - PAD * 2 - gapX * (cols - 1)) / cols
  const boxH = 104
  const blockH = boxH * rows + gapY * (rows - 1)
  const y0 = CONTENT_TOP + Math.max(0, (CONTENT_BOTTOM - CONTENT_TOP - blockH) / 2)

  steps.forEach((step, i) => {
    const c = i % cols
    const r = Math.floor(i / cols)
    const x = PAD + c * (boxW + gapX)
    const y = y0 + r * (boxH + gapY)
    const active = i === 0 || i === n - 1
    out.push(node({ x, y, w: boxW, h: boxH, label: step.label, sub: step.sub, accent, tone: active ? 'active' : 'idle' }))
    out.push(`<text x="${r2(x + 12)}" y="${r2(y - 12)}" font-family="monospace" font-size="11" letter-spacing="2" fill="${accent}" fill-opacity=".55">${String(i + 1).padStart(2, '0')}</text>`)
    if (c < cols - 1 && i < n - 1) out.push(arrowRight(x + boxW, x + boxW + gapX, y + boxH / 2, accent))
    if (c === cols - 1 && r < rows - 1) out.push(arrowDown(x + boxW / 2, y + boxH, y + boxH + gapY, accent))
  })
  return out.join('')
}

/* ── Module map: feature groups ───────────────────────────── */
function modules({ W, accent, groups }) {
  const out = []
  const cols = groups.length
  const gap = 22
  const boxW = (W - PAD * 2 - gap * (cols - 1)) / cols
  const y0 = CONTENT_TOP + 24
  const boxH = CONTENT_BOTTOM - y0

  groups.forEach((group, i) => {
    const x = PAD + i * (boxW + gap)
    out.push(`<rect x="${r2(x)}" y="${r2(y0)}" width="${r2(boxW)}" height="${r2(boxH)}" rx="4" fill="rgba(255,255,255,0.02)" stroke="#2a3142"/>`)
    out.push(groupLabel(x + 18, y0 + 32, group.tag, accent))
    out.push(`<text x="${r2(x + 18)}" y="${r2(y0 + 58)}" font-family="monospace" font-size="15" letter-spacing="1.4" fill="#f5f7fb">${esc(group.label)}</text>`)
    out.push(`<line x1="${r2(x + 18)}" y1="${r2(y0 + 76)}" x2="${r2(x + boxW - 18)}" y2="${r2(y0 + 76)}" stroke="${accent}" stroke-opacity=".18"/>`)
    group.items.forEach((item, j) => {
      const iy = y0 + 112 + j * 54
      out.push(`<rect x="${r2(x + 14)}" y="${r2(iy)}" width="${r2(boxW - 28)}" height="42" rx="3" fill="rgba(255,255,255,0.028)" stroke="#333c4f"/>`)
      out.push(`<circle cx="${r2(x + 32)}" cy="${r2(iy + 21)}" r="3" fill="${accent}" class="pulse"/>`)
      out.push(`<text x="${r2(x + 48)}" y="${r2(iy + 26)}" font-family="monospace" font-size="13" fill="#a4adbd">${esc(item)}</text>`)
    })
  })
  return out.join('')
}

/* ── Hub and spoke: application against external services ── */
function integration({ W, accent, hub, spokes }) {
  const out = []
  const cx = W / 2
  const cy = (CONTENT_TOP + CONTENT_BOTTOM) / 2
  const hubR = 132

  out.push(`<circle cx="${cx}" cy="${cy}" r="${hubR}" fill="rgba(255,255,255,0.04)" stroke="${accent}" stroke-width="1.4"/>`)
  out.push(`<circle cx="${cx}" cy="${cy}" r="${hubR + 22}" fill="none" stroke="${accent}" stroke-opacity=".22" class="pulse"/>`)
  out.push(`<text x="${cx}" y="${cy - 4}" font-family="monospace" font-size="17" letter-spacing="1.8" text-anchor="middle" fill="#f5f7fb">${esc(hub.label)}</text>`)
  out.push(`<text x="${cx}" y="${cy + 20}" font-family="monospace" font-size="12" letter-spacing="1.4" text-anchor="middle" fill="#67718a">${esc(hub.sub)}</text>`)

  const n = spokes.length
  const rx = W / 2 - 230
  const ry = (CONTENT_BOTTOM - CONTENT_TOP) / 2 - 40
  spokes.forEach((spoke, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const sx = cx + Math.cos(a) * rx
    const sy = cy + Math.sin(a) * ry
    out.push(`<line x1="${r2(cx + Math.cos(a) * (hubR + 4))}" y1="${r2(cy + Math.sin(a) * (hubR + 4))}" x2="${r2(sx - Math.cos(a) * 96)}" y2="${r2(sy - Math.sin(a) * 34)}" stroke="${accent}" stroke-opacity=".5" stroke-width="1.3" class="flow"/>`)
    out.push(node({ x: sx - 96, y: sy - 34, w: 192, h: 68, label: spoke.label, sub: spoke.sub, accent, tone: 'idle' }))
  })
  return out.join('')
}

/* ── Data flow: two columns joined by read/write links ────── */
function dataflow({ W, accent, left, right, leftTag, rightTag, linkLabel, footnote }) {
  const out = []
  const gap = 120
  const colW = (W - PAD * 2 - gap) / 2
  const y0 = CONTENT_TOP + 34

  const column = (items, x, tag) => {
    const arr = [
      `<text x="${r2(x)}" y="${r2(y0 - 16)}" font-family="monospace" font-size="12" letter-spacing="2.6" fill="${accent}" fill-opacity=".65">${esc(tag)}</text>`,
      `<text x="${r2(x)}" y="${r2(y0 + 10)}" font-family="monospace" font-size="16" letter-spacing="1.4" fill="#f5f7fb">${esc(tag)}</text>`,
    ]
    items.forEach((item, i) => {
      arr.push(node({ x, y: y0 + 46 + i * 78, w: colW, h: 58, label: item.label, sub: item.sub, accent, tone: 'idle' }))
    })
    return arr.join('')
  }

  out.push(column(left, PAD, leftTag))
  out.push(column(right, PAD + colW + gap, rightTag))

  const links = Math.min(left.length, right.length)
  for (let i = 0; i < links; i += 1) {
    const y = y0 + 46 + i * 78 + 29
    out.push(arrowRight(PAD + colW, PAD + colW + gap, y, accent, i === 0 ? linkLabel : ''))
  }
  if (footnote) {
    out.push(`<text x="${PAD}" y="${CONTENT_BOTTOM}" font-family="monospace" font-size="12" letter-spacing="2" fill="#67718a">${esc(footnote)}</text>`)
  }
  return out.join('')
}

/* ── Request / endpoint table ────────────────────────────── */
function endpoints({ W, accent, groups }) {
  const out = []
  const gap = 26
  const colW = (W - PAD * 2 - gap * (groups.length - 1)) / groups.length
  const y0 = CONTENT_TOP + 30
  const METHOD = { GET: '#22d3ee', POST: '#a3e635', PATCH: '#ff6a1a', PUT: '#ffa457', DELETE: '#f472b6' }

  groups.forEach((group, gi) => {
    const x = PAD + gi * (colW + gap)
    out.push(groupLabel(x, y0, group.tag, accent))
    group.rows.forEach((row, i) => {
      const y = y0 + 24 + i * 62
      out.push(`<rect x="${r2(x)}" y="${r2(y)}" width="${r2(colW)}" height="50" rx="3" fill="rgba(255,255,255,0.025)" stroke="#333c4f"/>`)
      const c = METHOD[row[1]] || accent
      out.push(`<rect x="${r2(x)}" y="${r2(y)}" width="5" height="50" rx="2" fill="${c}"/>`)
      out.push(`<text x="${r2(x + 18)}" y="${r2(y + 24)}" font-family="monospace" font-size="11" letter-spacing="1.6" fill="${c}">${esc(row[1])}</text>`)
      out.push(`<text x="${r2(x + 18)}" y="${r2(y + 41)}" font-family="monospace" font-size="12" fill="#a4adbd">${esc(row[0])}</text>`)
    })
  })
  return out.join('')
}


/* ── Implementation / code panel ──────────────────────────── */
function implementation({ W, accent, fileName, blocks }) {
  const out = []
  const x = PAD
  const w = W - PAD * 2
  out.push(`<rect x="${x}" y="${CONTENT_TOP}" width="${w}" height="${CONTENT_BOTTOM - CONTENT_TOP}" rx="6" fill="#080b11" stroke="#2a3142"/>`)
  out.push(`<rect x="${x}" y="${CONTENT_TOP}" width="${w}" height="44" fill="rgba(255,255,255,0.03)"/>`)
  out.push(`<line x1="${x}" y1="${CONTENT_TOP + 44}" x2="${x + w}" y2="${CONTENT_TOP + 44}" stroke="#2a3142"/>`)
  ;[accent, '#ffa457', '#a3e635'].forEach((c, i) => {
    out.push(`<circle cx="${x + 22 + i * 18}" cy="${CONTENT_TOP + 22}" r="4.5" fill="${c}" fill-opacity=".7"/>`)
  })
  out.push(`<text x="${x + w / 2}" y="${CONTENT_TOP + 27}" font-family="monospace" font-size="12" letter-spacing="2" text-anchor="middle" fill="#67718a">${esc(fileName)}</text>`)

  blocks.forEach((block, bi) => {
    const by = CONTENT_TOP + 74 + bi * 92
    out.push(`<text x="${x + 28}" y="${r2(by)}" font-family="monospace" font-size="11" letter-spacing="2" fill="${accent}" fill-opacity=".8">${esc(block.tag)}</text>`)
    out.push(`<text x="${x + 28}" y="${r2(by + 24)}" font-family="monospace" font-size="14" fill="#a4adbd">${esc(block.line1)}</text>`)
    out.push(`<text x="${x + 28}" y="${r2(by + 48)}" font-family="monospace" font-size="14" fill="#a4adbd">${esc(block.line2)}</text>`)
    if (bi < blocks.length - 1) out.push(`<line x1="${x + 28}" y1="${r2(by + 66)}" x2="${x + w - 28}" y2="${r2(by + 66)}" stroke="#1c2230"/>`)
  })
  return out.join('')
}

/* ── Development phases along a timeline ─────────────────── */
function phases({ W, accent, phases: list }) {
  const out = []
  const y = CONTENT_TOP + 120
  const gap = 26
  const n = list.length
  const boxW = (W - PAD * 2 - gap * (n - 1)) / n

  out.push(`<line x1="${PAD}" y1="${y - 52}" x2="${W - PAD}" y2="${y - 52}" stroke="${accent}" stroke-opacity=".3" stroke-width="1.4"/>`)
  list.forEach((p, i) => {
    const x = PAD + i * (boxW + gap)
    out.push(`<circle cx="${r2(x + boxW / 2)}" cy="${y - 52}" r="6" fill="${accent}"/>`)
    out.push(`<circle cx="${r2(x + boxW / 2)}" cy="${y - 52}" r="14" fill="none" stroke="${accent}" stroke-opacity=".35" class="pulse"/>`)
    out.push(`<text x="${r2(x + boxW / 2)}" y="${y - 78}" font-family="monospace" font-size="12" letter-spacing="2" text-anchor="middle" fill="${accent}" fill-opacity=".8">${esc(p.tag)}</text>`)
    out.push(node({ x, y, w: boxW, h: 250, label: p.label, sub: '', accent, tone: i === 0 ? 'active' : 'idle' }))
    p.lines.forEach((line, li) => {
      out.push(`<text x="${r2(x + 18)}" y="${y + 42 + li * 26}" font-family="monospace" font-size="12" fill="#67718a">${esc(line)}</text>`)
    })
  })
  return out.join('')
}

export const SCHEMAS = {
  layered,
  pipeline,
  modules,
  integration,
  dataflow,
  endpoints,
  implementation,
  phases,
}

export const SCHEMA_KEYS = Object.keys(SCHEMAS)

