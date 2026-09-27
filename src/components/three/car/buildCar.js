/**
 * Procedural sports car.
 *
 * Built from an extruded side profile rather than from boxes. A car assembled
 * out of primitives reads as a blocky toy no matter how many primitives it has;
 * what makes it read as a car is a *silhouette*, and a silhouette is exactly
 * what a 2D profile gives you. The profile is extruded across the car's width
 * and bevelled, which produces the soft shoulders a real body has.
 *
 * Three things do most of the work:
 *
 *   1. The body is split at the beltline. A car's lower body is wide and the
 *      greenhouse above it is much narrower. Extruding one profile for the
 *      whole height gives a slab, so the glasshouse is a second, narrower piece
 *      sitting on top of the lower body.
 *   2. The extrusion is tapered per-vertex afterwards — nose narrows, tail
 *      tucks in, and everything above the beltline pulls in more.
 *      ExtrudeGeometry gives a constant cross-section, and almost all of a
 *      car's character comes from it not being constant.
 *   3. Wheels sit under the arches, darker and rougher than the body, which is
 *      what stops the whole thing reading as one solid lump.
 *
 * Everything is monochrome on purpose. The site is a black-and-cream portfolio;
 * a red car on it would look pasted on. The body is graphite with a clearcoat,
 * so what you see is reflected light and the environment rather than a colour.
 */
import * as THREE from 'three'

/**
 * Lower body, up to the beltline. X is length, Y is height.
 *
 * The floor sits at y = 0.14 rather than at the wheels' contact patch because
 * the bevel expands the outline outward by roughly `bevelSize` in every
 * direction, including downward. A profile authored on the ground plane gets
 * bevelled straight through it and the car ends up sunk into the road.
 */
const LOWER = [
  [-2.2, 0.21], [-2.34, 0.44], [-2.24, 0.62], [-1.58, 0.69],
  [-1.05, 0.71], [1.1, 0.69], [1.88, 0.51], [2.32, 0.37],
  [2.44, 0.23], [2.0, 0.15], [0.7, 0.14], [-1.1, 0.14],
]

/** The glasshouse: a quad from the beltline up over the roof. */
const CANOPY = [
  [-1.02, 0.695], [-0.3, 0.965], [0.58, 0.975], [1.08, 0.685],
]

const HALF_WIDTH = 0.86
const BEVEL = 0.11
const WHEEL_R = 0.34
const WHEEL_W = 0.26
const AXLE_F = 1.44
const AXLE_R = -1.46
/**
 * Half track. This is the *wheel centre*, and it looks like it should just be
 * the body half-width — it is not. A wheel is a disc standing in the YZ plane,
 * so its outer edge is TRACK + WHEEL_R, which at a 0.8 track put the outside
 * of the front wheels 1.14 from centreline against a body only 0.97 wide. The
 * car came out 2.28 across, wider than a real sports car and visibly
 * wheel-out-of-the-arches. 0.6 tucks them just inside the body.
 */
const TRACK = 0.6

const shapeFrom = (pts) => {
  const s = new THREE.Shape()
  s.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i += 1) s.lineTo(pts[i][0], pts[i][1])
  s.closePath()
  return s
}

const smoothstep = (a, b, t) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

/**
 * Extrude a profile across the car's width, then taper it.
 *
 * `taper` gets the world-space x and y of each vertex and returns a factor to
 * scale that vertex's z by. This is the step that turns a constant-section
 * extrusion into a body that narrows at the nose and tucks in above the belt.
 */
function extrudeTapered(points, depth, bevel, taper) {
  const geo = new THREE.ExtrudeGeometry(shapeFrom(points), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.82,
    bevelOffset: 0,
    bevelSegments: 4,
    curveSegments: 2,
  })
  geo.translate(0, 0, -depth / 2)

  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i += 1) {
    pos.setZ(i, pos.getZ(i) * taper(pos.getX(i), pos.getY(i)))
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/** Shared body taper: narrow nose, tucked tail, tucked roof. */
const bodyTaper =
  (noseStart, noseEnd, tailStart, tailEnd, roofStart, roofTop) => (x, y) => {
    let f = 1
    if (x > noseStart) f *= 1 - 0.46 * smoothstep(noseStart, noseEnd, x)
    if (x < tailStart) f *= 1 - 0.2 * smoothstep(tailStart, tailEnd, x)
    if (y > roofStart) f *= 1 - 0.3 * smoothstep(roofStart, roofTop, y)
    return f
  }

/** Monochrome palette. Graphite body, near-black glass, bright rims. */
function materials() {
  const body = new THREE.MeshPhysicalMaterial({
    color: 0x1b1b20,
    metalness: 0.72,
    roughness: 0.26,
    // A clearcoat is what gives car paint its depth: a second, sharper
    // reflection layer over the metallic base. Without it the body reads as
    // grey plastic no matter how roughness is tuned.
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.35,
  })

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x07070b,
    metalness: 0.1,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.9,
  })

  const tyre = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0, roughness: 0.92 })
  const rim = new THREE.MeshStandardMaterial({
    color: 0xb9bcc4,
    metalness: 0.95,
    roughness: 0.22,
    envMapIntensity: 1.5,
  })
  const trim = new THREE.MeshStandardMaterial({ color: 0x050506, metalness: 0.4, roughness: 0.55 })

  // Emissive white rather than red. A red taillight would be the only
  // non-monochrome thing on a monochrome site.
  const lamp = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 2.4,
    metalness: 0,
    roughness: 0.4,
  })

  return { body, glass, tyre, rim, trim, lamp }
}

/** One wheel: tyre, dished rim, bright ring, and spokes so spin is legible. */
function buildWheel(mat) {
  const g = new THREE.Group()

  // A cylinder's axis is Y; a wheel's is X.
  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, WHEEL_W, 28, 1),
    mat.tyre,
  )
  tyre.rotation.z = Math.PI / 2
  g.add(tyre)

  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(WHEEL_R * 0.66, WHEEL_R * 0.66, WHEEL_W * 0.86, 20, 1),
    mat.rim,
  )
  dish.rotation.z = Math.PI / 2
  g.add(dish)

  const ring = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_R * 0.83, 0.022, 8, 30), mat.rim)
  ring.rotation.y = Math.PI / 2
  g.add(ring)

  // Five spokes. Without something asymmetric the wheel is a featureless disc
  // and you cannot tell it is turning at all.
  for (let i = 0; i < 5; i += 1) {
    const holder = new THREE.Group()
    holder.rotation.x = (i / 5) * Math.PI * 2
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, WHEEL_R * 0.62, 0.055), mat.trim)
    spoke.position.set(WHEEL_W * 0.3, WHEEL_R * 0.36, 0)
    holder.add(spoke)
    g.add(holder)
  }

  return g
}

/**
 * The finished car, facing +Z, wheels on the ground plane at y = 0.
 *
 * `wheels` is returned separately so the caller can spin them from distance
 * travelled without reaching into the geometry.
 */
export function buildCar() {
  const mat = materials()
  const car = new THREE.Group()
  car.name = 'procedural-car'

  const lowerGeo = extrudeTapered(
    LOWER,
    HALF_WIDTH * 2,
    BEVEL,
    bodyTaper(1.15, 2.44, -1.62, -2.34, 0.5, 0.705),
  )
  const body = new THREE.Mesh(lowerGeo, mat.body)
  body.castShadow = true
  car.add(body)

  // The glasshouse is narrower again than the body below the beltline.
  const canopyGeo = extrudeTapered(
    CANOPY,
    HALF_WIDTH * 2 * 0.74,
    BEVEL * 0.64,
    bodyTaper(0.7, 1.08, -0.72, -1.02, 0.78, 0.975),
  )
  const canopy = new THREE.Mesh(canopyGeo, mat.glass)
  canopy.castShadow = true
  car.add(canopy)

  // A body-coloured roof cap, so the cabin is not one sheet of glass.
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.05, HALF_WIDTH * 2 * 0.6), mat.body)
  roof.position.set(0.13, 0.962, 0)
  roof.castShadow = true
  car.add(roof)

  // Front splitter and rear diffuser. Small, but they stop the nose and tail
  // from reading as cut-off extrusions.
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, HALF_WIDTH * 1.5), mat.trim)
  splitter.position.set(2.24, 0.115, 0)
  car.add(splitter)

  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, HALF_WIDTH * 1.5), mat.trim)
  diffuser.position.set(-2.22, 0.2, 0)
  car.add(diffuser)

  for (const side of [-1, 1]) {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.42), mat.lamp)
    head.position.set(2.34, 0.44, side * 0.5)
    car.add(head)

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.34), mat.lamp)
    tail.position.set(-2.33, 0.55, side * 0.52)
    car.add(tail)

    // Mirrors — tiny, and the most effective single cue that this is a car and
    // not a boat.
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), mat.trim)
    arm.position.set(0.86, 0.76, side * 0.62)
    car.add(arm)
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.12), mat.body)
    mirror.position.set(0.92, 0.79, side * 0.66)
    car.add(mirror)
  }

  const wheels = []
  for (const [ax, tag] of [[AXLE_F, 'f'], [AXLE_R, 'r']]) {
    for (const side of [-1, 1]) {
      const w = buildWheel(mat)
      w.position.set(ax, WHEEL_R, side * TRACK)
      w.name = `wheel-${tag}-${side > 0 ? 'l' : 'r'}`
      w.traverse((o) => { o.castShadow = true })
      car.add(w)
      wheels.push(w)
    }
  }

  car.traverse((o) => { if (o.isMesh) o.castShadow = true })

  car.userData.dispose = () => {
    lowerGeo.dispose()
    canopyGeo.dispose()
    Object.values(mat).forEach((m) => m.dispose())
  }

  return { car, wheels }
}

export const CAR_DIMS = { WHEEL_R, HALF_WIDTH, BEVEL, LENGTH: 4.78 }
