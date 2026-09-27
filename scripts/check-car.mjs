// Verifies the car geometry outside a browser, where three.js still runs on a
// null renderer. Run: node scripts/check-car.mjs
import * as THREE from 'three'
import { buildCar, CAR_DIMS } from '../src/components/three/car/buildCar.js'

const { car, wheels } = buildCar()

const box = new THREE.Box3().setFromObject(car)
const size = new THREE.Vector3()
box.getSize(size)

console.log('meshes       :', (() => { let n = 0; car.traverse((o) => { if (o.isMesh) n += 1 }); return n })())
console.log('wheels       :', wheels.length, wheels.length === 4 ? 'OK' : 'FAIL (expected 4)')
console.log('overall size :', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2))

// A real sports car is roughly 4.5 long, 1.9 wide, 1.2 tall. The car is built
// along X (length) and extruded along Z (width), so X should be the long axis.
const L = Math.max(size.x, size.z)
const W = Math.min(size.x, size.z)
console.log(`long axis    : ${L.toFixed(2)}  ${L > 4.0 && L < 5.6 ? 'OK' : 'FAIL (want 4.0-5.6)'}`)
console.log(`width        : ${W.toFixed(2)}  ${W > 1.5 && W < 2.2 ? 'OK' : 'FAIL (want 1.5-2.2)'}`)
console.log(`height       : ${size.y.toFixed(2)}  ${size.y > 0.9 && size.y < 1.4 ? 'OK' : 'FAIL (want 0.9-1.4)'}`)
console.log(`length:height: ${(L / size.y).toFixed(1)}:1  ${L / size.y > 3.2 ? 'OK (low and long)' : 'FAIL (too tall)'}`)

// Wheels must touch the ground: the lowest point of a wheel has to be at y = 0,
// or the car is floating or sunk.
const wheelBox = new THREE.Box3()
let minY = Infinity
let maxWheelY = -Infinity
for (const w of wheels) {
  wheelBox.setFromObject(w)
  minY = Math.min(minY, wheelBox.min.y)
  maxWheelY = Math.max(maxWheelY, wheelBox.max.y)
}
console.log(`wheel bottom : ${minY.toFixed(4)}  ${Math.abs(minY) < 0.005 ? 'OK (on the ground)' : 'FAIL (floating or sunk)'}`)
console.log(`wheel top    : ${maxWheelY.toFixed(3)}  (wheel diameter ${(CAR_DIMS.WHEEL_R * 2).toFixed(2)})`)

// Body must not intersect the ground.
console.log(`body bottom  : ${box.min.y.toFixed(4)}  ${box.min.y >= -0.001 ? 'OK (not through the floor)' : 'FAIL'}`)

// Front and rear wheels must not be on the same axle.
const xs = wheels.map((w) => w.position.x)
const uniqueX = [...new Set(xs.map((v) => v.toFixed(2)))]
console.log(`axle x values: [${uniqueX}]  ${uniqueX.length === 2 ? 'OK (front and rear)' : 'FAIL'}`)

// The nose must taper. A constant cross-section would mean the car is a slab.
const lower = car.children.find((c) => c.isMesh)
const pos = lower.geometry.attributes.position
let noseWide = 0
let tailWide = 0
for (let i = 0; i < pos.count; i += 1) {
  if (pos.getX(i) > 2.2) noseWide = Math.max(noseWide, Math.abs(pos.getZ(i)))
  if (pos.getX(i) < -2.1) tailWide = Math.max(tailWide, Math.abs(pos.getZ(i)))
}
console.log(`nose half-width: ${noseWide.toFixed(3)}`)
console.log(`tail half-width: ${tailWide.toFixed(3)}`)
console.log(`max half-width : ${(CAR_DIMS.HALF_WIDTH + 0.11).toFixed(3)} (extrude + bevel)`)
console.log(noseWide < CAR_DIMS.HALF_WIDTH * 0.75 ? 'OK (nose tapers)' : 'FAIL (slab)')
console.log(tailWide < CAR_DIMS.HALF_WIDTH * 0.95 ? 'OK (tail tucks)' : 'FAIL (slab)')

// Glasshouse must be narrower than the body below the beltline.
const canopy = car.children.filter((c) => c.isMesh)[1]
const cpos = canopy.geometry.attributes.position
let canopyWide = 0
for (let i = 0; i < cpos.count; i += 1) canopyWide = Math.max(canopyWide, Math.abs(cpos.getZ(i)))
console.log(`canopy half-width: ${canopyWide.toFixed(3)}  ${canopyWide < CAR_DIMS.HALF_WIDTH * 0.8 ? 'OK (narrower than body)' : 'FAIL'}`)

// Every mesh needs a material, or it renders as flat white.
let noMat = 0
car.traverse((o) => { if (o.isMesh && !o.material) noMat += 1 })
console.log(`meshes with no material: ${noMat} ${noMat === 0 ? 'OK' : 'FAIL'}`)

// Shadows have to be enabled or the car looks pasted onto the road.
let noShadow = 0
car.traverse((o) => { if (o.isMesh && !o.castShadow) noShadow += 1 })
console.log(`meshes not casting shadow: ${noShadow} ${noShadow === 0 ? 'OK' : 'FAIL'}`)

// Nothing should be a NaN, which is what a degenerate taper produces.
let nan = 0
car.traverse((o) => {
  if (o.isMesh) {
    const p = o.geometry.attributes.position
    for (let i = 0; i < p.array.length; i += 1) if (!Number.isFinite(p.array[i])) nan += 1
  }
})
console.log(`non-finite vertex coords: ${nan} ${nan === 0 ? 'OK' : 'FAIL'}`)

car.userData.dispose()

// ── Framing ────────────────────────────────────────────────
// The car was geometrically perfect and completely invisible, because nothing
// had checked whether the camera could actually see it. These assertions are
// the reason that cannot happen again.

const CAM = { pos: [10, 2.2, 24], fov: 42, far: 400 }
const PATH_PTS = [
  [-72, 0, -116], [-46, 0, -84], [-20, 0, -56], [4, 0, -34],
  [26, 0, -12], [32, 0, 10], [14, 0, 16], [-20, 0, 2], [-62, 0, -46],
]
const curve = new THREE.CatmullRomCurve3(
  PATH_PTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5,
)

const camPos = new THREE.Vector3(...CAM.pos)
const halfFov = (CAM.fov * Math.PI) / 180 / 2
// The camera's forward axis. It is locked off and its focus drifts, but it
// always looks roughly this way, and a point more than about 70 degrees off
// this axis is out of shot whatever the focus is doing.
const FORWARD = new THREE.Vector3(-0.28, -0.06, -1).normalize()

console.log('\n--- framing: what fraction of frame height is the car? ---')
const samples = 60
let tooSmall = 0
let biggest = 0
let offAxis = 0
let worstAngle = 0
for (let i = 0; i <= samples; i += 1) {
  const u = i / samples
  const p = curve.getPointAt(u)
  const toPoint = p.clone().sub(camPos)
  const dist = toPoint.length()
  // The real test for "can the camera see it" is the angle off the view axis,
  // not the z coordinate. A crude z test flags perfectly good points and misses
  // genuinely invisible ones, which is how the first path passed a naive check
  // while the car spent half its lap behind the camera.
  const angle = (toPoint.normalize().angleTo(FORWARD) * 180) / Math.PI
  worstAngle = Math.max(worstAngle, angle)
  if (angle > 70) offAxis += 1

  const frameHeight = 2 * dist * Math.tan(halfFov)
  const pct = (CAR_DIMS.LENGTH / frameHeight) * 100
  biggest = Math.max(biggest, pct)
  // Under 3% of frame height the car is a handful of pixels and reads as a
  // speck rather than a car.
  if (pct < 3) tooSmall += 1
}
const tooSmallPct = (tooSmall / (samples + 1)) * 100
const offAxisPct = (offAxis / (samples + 1)) * 100
console.log(`  largest apparent size : ${biggest.toFixed(1)}% of frame height  ${biggest > 30 ? 'OK (close pass fills the frame)' : 'FAIL (never gets close)'}`)
console.log(`  time under 3% of frame: ${tooSmallPct.toFixed(0)}% of the lap  ${tooSmallPct < 35 ? 'OK' : 'FAIL (mostly a speck)'}`)
console.log(`  time out of shot      : ${offAxisPct.toFixed(0)}% of the lap (worst ${worstAngle.toFixed(0)} deg off axis)  ${offAxisPct < 20 ? 'OK' : 'FAIL (drives out of frame)'}`)

// Every point must be inside the far plane, or the car is simply clipped away.
const maxDist = Math.max(...Array.from({ length: samples + 1 }, (_, i) => camPos.distanceTo(curve.getPointAt(i / samples))))
console.log(`  furthest point        : ${maxDist.toFixed(0)} vs far plane ${CAM.far}  ${maxDist < CAM.far ? 'OK (not clipped)' : 'FAIL (beyond far plane)'}`)

// The car has to stay on the ground plane, or it flies off into the void.
let pathMinY = Infinity
let pathMaxY = -Infinity
for (let i = 0; i <= samples; i += 1) {
  const y = curve.getPointAt(i / samples).y
  pathMinY = Math.min(pathMinY, y)
  pathMaxY = Math.max(pathMaxY, y)
}
console.log(`  height off the ground : ${pathMinY.toFixed(2)} to ${pathMaxY.toFixed(2)}  ${Math.abs(pathMaxY) < 0.01 ? 'OK (stays on the road)' : 'FAIL (leaves the ground)'}`)

// The close pass must not put the car inside the camera's near plane.
const closest = Math.min(...Array.from({ length: samples + 1 }, (_, i) => camPos.distanceTo(curve.getPointAt(i / samples))))
console.log(`  closest approach      : ${closest.toFixed(1)} vs near plane 0.5  ${closest > 0.5 ? 'OK (not clipped by near)' : 'FAIL'}`)

const framingFails =
  biggest <= 30 || tooSmallPct >= 35 || offAxisPct >= 20 || maxDist >= CAM.far || Math.abs(pathMaxY) >= 0.01 || closest <= 0.5
console.log(framingFails ? '\nFRAMING: FAIL' : '\nFRAMING: PASS')

process.exit(framingFails ? 1 : 0)

