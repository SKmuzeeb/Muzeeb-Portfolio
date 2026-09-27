// Reproduces the visibility maths of the edge shader. Run: node scripts/check-contrast.mjs
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)

// sRGB -> linear, which is what a blend actually happens in.
const toLin = (c) => c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
const toSrgb = (c) => c.map((v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055))

// WCAG relative luminance is defined on LINEAR values, not sRGB. Computing it
// on sRGB understates contrast on dark backgrounds and overstates it on light
// ones, which is how a near-black line ends up "measuring" as invisible
// against cream when it is obviously not.
const lumLin = (c) => {
  const l = toLin(c)
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]
}

/** WCAG contrast ratio between two sRGB colours. */
const ratio = (a, b) => {
  const la = lumLin(a)
  const lb = lumLin(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Normal blending: src*alpha + dst*(1-alpha), done in linear light. */
function over(src, dst, alpha) {
  const ls = toLin(src)
  const ld = toLin(dst)
  return toSrgb(ls.map((v, i) => v * alpha + ld[i] * (1 - alpha)))
}
/** Additive blending: src*srcAlpha + dst. */
function add(src, dst, alpha) {
  const ls = toLin(src)
  const ld = toLin(dst)
  return toSrgb(ls.map((v, i) => v * alpha + ld[i]))
}

const BG = { dark: '#000000', light: '#ece4d3' }

// accent / hot / spark, per theme. These MUST stay in step with SCHEMES in
// src/components/three/HeroScene.jsx — this file exists to prove those numbers.
const SCHEMES = {
  dark: { accent: '#ff7a2f', hot: '#7ff0ff', spark: '#fff2e6', edgeRest: 0.45, additive: true },
  light: { accent: '#7c2d12', hot: '#164e63', spark: '#9a3412', edgeRest: 0.85, additive: false },
}

const CONTRAST_MIN = 1.5 // perceptual ratio below which a line reads as "missing"

// Thresholds for the resting lattice and the wavefront. A resting line has to
// clear 3:1 or it is not really there; the wavefront should be unmistakably
// brighter than the rest of the structure.
const REST_MIN = 3.0
const REST_MAX = 7.0
const LIT_MIN = 7.0

console.log('edge shader, as previously written: a = 0.17 + lit*0.83, uOpacity = 0.62\n')
for (const [theme, bg] of Object.entries(BG)) {
  const dst = hex(bg)
  const restAlpha = 0.17 * 0.62
  const litAlpha = 1.0 * 0.62
  const accent = hex('#ff7a2f')
  const restCol = over(accent, dst, restAlpha)
  const litCol = over(accent, dst, litAlpha)
  const rl = ratio(restCol, dst)
  const ll = ratio(litCol, dst)
  console.log(`${theme.padEnd(6)} bg ${bg}`)
  console.log(`  rest  alpha ${restAlpha.toFixed(3)}  ->  rgb(${restCol.map((v) => Math.round(v * 255)).join(',')})  contrast ${rl.toFixed(2)}  ${rl < CONTRAST_MIN ? 'INVISIBLE' : 'ok'}`)
  console.log(`  lit   alpha ${litAlpha.toFixed(3)}  ->  rgb(${litCol.map((v) => Math.round(v * 255)).join(',')})  contrast ${ll.toFixed(2)}  ${ll < CONTRAST_MIN ? 'INVISIBLE' : 'ok'}`)
  console.log(`  => the wavefront shows, the resting lattice does not. Exactly the reported symptom.\n`)
}

console.log('--- additive on cream, which is why the light theme lost everything ---')
for (const [theme, bg] of Object.entries(BG)) {
  const dst = hex(bg)
  const s = SCHEMES[theme]
  for (const [name, col] of [['accent', s.accent], ['hot', s.hot]]) {
    const c = add(hex(col), dst, 0.6)
    const r = ratio(c, dst)
    console.log(`  ${theme.padEnd(6)} ${name.padEnd(7)} ${col} additive -> contrast ${r.toFixed(3)} ${r < CONTRAST_MIN ? 'INVISIBLE' : 'ok'}`)
  }
}

console.log('\n--- shipped values: a = uRest + lit*(1-uRest) ---')
let allPass = true
for (const [theme, bg] of Object.entries(BG)) {
  const dst = hex(bg)
  const s = SCHEMES[theme]
  const restA = s.edgeRest
  const litA = 1.0
  for (const [label, col, a, min] of [['rest', s.accent, restA, REST_MIN], ['lit ', s.hot, litA, LIT_MIN]]) {
    const c = over(hex(col), dst, a)
    const r = ratio(c, dst)
    const pass = r >= min
    if (!pass) allPass = false
    console.log(`  ${theme.padEnd(6)} ${label} ${col} alpha ${a.toFixed(2)} -> contrast ${r.toFixed(2).padStart(5)}  need >= ${min}  ${pass ? 'PASS' : 'FAIL'}`)
  }
  // Additive must only be used where it works, i.e. on the dark ground.
  for (const [name, col] of [['accent', s.accent], ['hot', s.hot]]) {
    const r = ratio(add(hex(col), dst, 0.6), dst)
    const usable = s.additive ? r >= CONTRAST_MIN : true
    if (!usable) allPass = false
    console.log(`  ${theme.padEnd(6)} if additive: ${name} -> ${r.toFixed(2)}  ${s.additive ? (usable ? 'PASS' : 'FAIL') : 'not used in this theme'}`)
  }
}
console.log(`\n${allPass ? 'ALL PASS' : 'FAILURES PRESENT'}`)

// The light theme was failing regardless of hue: at 40% alpha a near-black
// line over cream still measures ~1.6, because a thin 1px line on a light
// ground needs far more opacity than the same line on black. So sweep alpha
// too rather than hunting for a darker colour that still will not read.
const ALPHAS = [0.4, 0.55, 0.7, 0.8, 0.9, 1.0]
const CANDIDATES = {
  light: { accent: ['#7c2d12', '#9a3412', '#b4530a', '#1c1917', '#0f766e'], hot: ['#0e7490', '#164e63', '#155e75'] },
  dark: { accent: ['#ff7a2f', '#fb923c', '#f97316', '#fdba74'], hot: ['#7ff0ff', '#22d3ee', '#67e8f9'] },
}

for (const [theme, groups] of Object.entries(CANDIDATES)) {
  const dst = hex(BG[theme])
  const contrast = (col, a) => ratio(over(hex(col), dst, a), dst)
  console.log(`\n  ${theme} (bg ${BG[theme]})`)
  for (const col of groups.accent) {
    const row = ALPHAS.map((a) => `${a.toFixed(2)}:${contrast(col, a).toFixed(2)}`).join('  ')
    const best = Math.max(...ALPHAS.map((a) => contrast(col, a)))
    const firstOk = ALPHAS.find((a) => {
      const r = contrast(col, a)
      return r >= REST_MIN && r <= REST_MAX
    })
    console.log(`    rest ${col}  ${row}   ${firstOk ? `USABLE from alpha ${firstOk}` : best > REST_MAX ? 'always too strong' : 'never in range'}`)
  }
  for (const col of groups.hot) {
    const row = ALPHAS.map((a) => `${a.toFixed(2)}:${contrast(col, a).toFixed(2)}`).join('  ')
    const firstOk = ALPHAS.find((a) => contrast(col, a) >= LIT_MIN)
    console.log(`    lit  ${col}  ${row}   ${firstOk ? `USABLE from alpha ${firstOk}` : 'never clears'}`)
  }
}

