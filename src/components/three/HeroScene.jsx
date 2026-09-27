import { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  NODE_VERT, NODE_FRAG, EDGE_VERT, EDGE_FRAG, SPARK_VERT, SPARK_FRAG,
} from './shaders.js'
import { createRng } from '../../lib/prng.js'
import { pointerX, pointerY, pointerVY } from '../../lib/pointer.js'
import { currentTheme, onThemeChange } from '../../lib/theme.js'

/**
 * Subdivisions of the base icosahedron. 1 gives the classic 42-vertex,
 * 120-edge geodesic — the structure with the most distinct silhouette, which is
 * what makes it read as a made object rather than a ball of dots. Raise to 2
 * for a denser dome; the lattice stays uniform either way.
 */
const SUBDIVISIONS = 1
const SPARK_COUNT = 14
const RADIUS = 2.35

/**
 * Per-theme appearance.
 *
 * The lattice cannot look the same in both themes, and the reason is
 * arithmetic rather than taste.
 *
 * Additive blending only ever *adds* light. On black, adding orange to a black
 * background produces orange, which is the whole glow effect. On cream it
 * produces... cream: the sum of cream and a little orange is still cream, so
 * an additively blended lattice measures about 1.05:1 against the page and is
 * invisible. That is why the light theme lost the entire 3D object, and no
 * amount of brightening the colour fixes it — the blending mode itself has to
 * change.
 *
 * So the light theme uses normal blending with much deeper colours, which is
 * also the right look: dark ink lines on cream, matching the "ink on paper"
 * language the rest of the light theme already uses.
 *
 * The resting levels are measured, not guessed. Against the real backgrounds:
 *
 *   dark,  rest #ff7a2f at 0.45  -> 4.2:1     lit #7ff0ff at 1.0 -> 15.8:1
 *   light, rest #7c2d12 at 0.85  -> 3.8:1     lit #164e63 at 1.0 -> 7.2:1
 *
 * A line on cream needs nearly twice the opacity of the same line on black to
 * clear the same contrast, which is why these two sets of numbers differ so
 * much. `npm run check:contrast` re-derives them.
 */
const SCHEMES = {
  dark: {
    accent: '#ff7a2f',
    hot: '#7ff0ff',
    spark: '#fff2e6',
    edgeRest: 0.45,
    nodeRest: 0.3,
    nodeAlpha: 1,
    sparkAlpha: 1,
    additive: true,
  },
  light: {
    accent: '#7c2d12',
    hot: '#164e63',
    spark: '#9a3412',
    edgeRest: 0.85,
    nodeRest: 0.62,
    nodeAlpha: 0.95,
    sparkAlpha: 1,
    additive: false,
  },
}

/** Seconds for the wavefront to travel one full revolution. */
const FLOW_PERIOD = 14
/** Half-width of the wavefront, as a fraction of a turn. */
const FLOW_WIDTH = 0.055
/** Idle spin, radians per second. */
const SPIN = 0.05

/**
 * Frame-rate independent smoothing factor.
 *
 * A raw `lerp(current, target, 0.05)` runs ~3x faster on a 144Hz display than
 * on a 60Hz one, which is exactly the "animation gets stuck / speeds up"
 * inconsistency. This form gives the same feel at any refresh rate.
 */
const smooth = (delta, rate = 0.001) => 1 - Math.pow(rate, delta)

/**
 * Base scale for a viewport: roughly 56% of the narrow edge.
 *
 * R3F's `viewport` is in world units, and the camera sees 4.76 of height at
 * z=0. The lattice is 4.7 across in its own local space, so `narrow * 0.17`
 * made it fill 80% of the narrow edge — on a phone as much as a desktop. That
 * is why it read as one enormous mass behind the name instead of an object in
 * the scene, and why the near side of the sphere was the only part ever
 * visible.
 *
 * At 0.12 it fills 56% of the narrow edge on every screen. Sizing off the
 * smaller dimension is what keeps it inside the frame on a narrow phone rather
 * than spilling off both sides.
 */
const scaleFor = (vp) => Math.min(vp.width, vp.height) * 0.12

/**
 * Horizontal offset, proportional for the same reason: a fixed world-space
 * shift would be a nudge on a desktop and most of the way off a phone.
 */
const shiftFor = (vp) => vp.width * 0.25

/** Project a triple onto the sphere at RADIUS. */
const onSphere = ([x, y, z]) => {
  const len = Math.hypot(x, y, z) || 1
  return new THREE.Vector3(x / len, y / len, z / len).multiplyScalar(RADIUS)
}

/** The 12 vertices and 20 faces of a regular icosahedron. */
function icosahedron() {
  const t = (1 + Math.sqrt(5)) / 2
  const verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ]
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]
  return { verts, faces }
}

/**
 * Split every triangle into four, welding shared edge midpoints back together.
 *
 * The welding is the entire point. Subdivide naively and the two triangles on
 * either side of an edge each get their own midpoint vertex, so the surface
 * tears open along every seam and stops being a closed manifold.
 */
function subdivide({ verts, faces }) {
  const cache = new Map()
  const key = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`)
  const midpoint = (a, b) => {
    const k = key(a, b)
    const hit = cache.get(k)
    if (hit !== undefined) return hit
    const va = verts[a]
    const vb = verts[b]
    verts.push([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2])
    cache.set(k, verts.length - 1)
    return verts.length - 1
  }

  const next = []
  for (const [a, b, c] of faces) {
    const ab = midpoint(a, b)
    const bc = midpoint(b, c)
    const ca = midpoint(c, a)
    next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
  }
  return { verts, faces: next }
}

/**
 * The geodesic lattice.
 *
 * Replaces a Fibonacci sphere with nearest-neighbour edges, which could only
 * ever look like a hairball: the edges came out at wildly uneven lengths
 * pointing in arbitrary directions, and finding them cost an O(n^2) distance
 * sort per node. Here the edges fall straight out of the faces, and there is
 * no search that can get it wrong.
 *
 * The valence pattern is regular rather than uniform — the 12 original
 * icosahedron vertices keep degree 5, the new edge midpoints sit at 6. That
 * repeating 5/6 structure is what reads as engineered. It also means
 * scripts/check-lattice.mjs asserts the 12/30 split rather than expecting
 * every vertex to be 5, which is a class-II geodesic and a different build.
 *
 * Deterministic — the icosahedron has no randomness in it and the spark pick
 * below is seeded — so the object is identical on every load.
 */
function buildLattice() {
  let poly = icosahedron()
  for (let i = 0; i < SUBDIVISIONS; i += 1) poly = subdivide(poly)

  // Project *after* subdividing. A chord midpoint sits inside the sphere, so
  // projecting last is what puts every vertex the same distance from centre.
  const points = poly.verts.map(onSphere)

  const seen = new Set()
  const edges = []
  for (const [a, b, c] of poly.faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]]) {
      const k = i < j ? `${i}_${j}` : `${j}_${i}`
      if (seen.has(k)) continue
      seen.add(k)
      edges.push([i, j])
    }
  }

  // Longitude as a fraction of a turn — the axis the wave travels along. The
  // wrap is handled in the shader, not here.
  const theta = points.map((p) => (Math.atan2(p.z, p.x) + Math.PI) / (Math.PI * 2))

  // Which edges carry sparks. The positions are scattered, but they are only
  // ever visible inside the wavefront, so they read as part of the flow rather
  // than as fourteen dots going their own way.
  const rng = createRng('hero-lattice')
  const sparkEdges = edges
    .map((e) => ({ e, r: rng() }))
    .sort((p, q) => p.r - q.r)
    .slice(0, SPARK_COUNT)
    .map((x) => x.e)

  return { points, edges, theta, sparkEdges }
}

function useGeometries({ points, edges, theta, sparkEdges }) {
  return useMemo(() => {
    const node = new THREE.BufferGeometry()
    const nPos = new Float32Array(points.length * 3)
    const nTheta = new Float32Array(points.length)
    points.forEach((p, i) => {
      nPos[i * 3] = p.x
      nPos[i * 3 + 1] = p.y
      nPos[i * 3 + 2] = p.z
      nTheta[i] = theta[i]
    })
    node.setAttribute('position', new THREE.BufferAttribute(nPos, 3))
    node.setAttribute('aTheta', new THREE.BufferAttribute(nTheta, 1))

    const edge = new THREE.BufferGeometry()
    const ePos = new Float32Array(edges.length * 6)
    const eTheta = new Float32Array(edges.length * 2)
    edges.forEach(([a, b], i) => {
      const pa = points[a]
      const pb = points[b]
      ePos.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], i * 6)
      // Both ends carry their own longitude, so the band is evaluated at each
      // end and interpolated along the line. The wave then travels *along* the
      // edge instead of the whole edge flashing at once.
      eTheta[i * 2] = theta[a]
      eTheta[i * 2 + 1] = theta[b]
    })
    edge.setAttribute('position', new THREE.BufferAttribute(ePos, 3))
    edge.setAttribute('aTheta', new THREE.BufferAttribute(eTheta, 1))

    const n = Math.max(sparkEdges.length, 1)
    const spark = new THREE.BufferGeometry()
    spark.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    spark.setAttribute('aTheta', new THREE.BufferAttribute(new Float32Array(n), 1))

    return { node, edge, spark }
  }, [points, edges, theta, sparkEdges])
}

/* ── Scene ────────────────────────────────────────────────── */
function Mesh() {
  const group = useRef()
  // Material refs, not direct uniform mutation. Writing into the memoised
  // `uniforms` object from the frame loop is a mutation of a render-time value
  // after render has finished, which the compiler lint rightly rejects and
  // which is genuinely unsafe on a re-render. Going through the mounted
  // material is the real three.js object graph, so nothing stale is touched.
  const nodeMat = useRef()
  const edgeMat = useRef()
  const sparkMat = useRef()
  const { viewport } = useThree()

  const lattice = useMemo(() => buildLattice(), [])
  const { node, edge, spark } = useGeometries(lattice)

  const dpr = () => Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)

  // Seeded from the live theme so the very first frame is already correct —
  // reading currentTheme() during render keeps that a pure DOM read rather than
  // state, which the compiler lint would (rightly) complain about otherwise.
  const seed = SCHEMES[currentTheme()] || SCHEMES.dark

  const nodeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 3.2 },
      uPixelRatio: { value: dpr() },
      uFlow: { value: 0 },
      uFlowWidth: { value: FLOW_WIDTH },
      uAccent: { value: new THREE.Color(seed.accent) },
      uAccentHot: { value: new THREE.Color(seed.hot) },
      uRest: { value: seed.nodeRest },
      uAlpha: { value: seed.nodeAlpha },
    }),
    [seed],
  )

  const edgeUniforms = useMemo(
    () => ({
      uFlow: { value: 0 },
      uFlowWidth: { value: FLOW_WIDTH },
      uAccent: { value: new THREE.Color(seed.accent) },
      uAccentHot: { value: new THREE.Color(seed.hot) },
      uRest: { value: seed.edgeRest },
    }),
    [seed],
  )

  const sparkUniforms = useMemo(
    () => ({
      uPixelRatio: { value: dpr() },
      uFlow: { value: 0 },
      uFlowWidth: { value: FLOW_WIDTH },
      uColor: { value: new THREE.Color(seed.spark) },
      uAlpha: { value: seed.sparkAlpha },
    }),
    [seed],
  )

  /**
   * Re-skin the whole object when the theme changes.
   *
   * Blending mode is a material property, not something a fragment shader can
   * decide for itself, so it is set imperatively here. `needsUpdate` is
   * required after changing it — three.js caches the program against the old
   * blend state and will otherwise keep blending additively.
   */
  useEffect(() => {
    const apply = (theme) => {
      const s = SCHEMES[theme] || SCHEMES.dark

      const paint = (mat, keys) => {
        const m = mat.current
        if (!m) return
        for (const [k, v] of Object.entries(keys)) {
          if (m.uniforms[k]?.value?.set) m.uniforms[k].value.set(v)
          else if (m.uniforms[k]) m.uniforms[k].value = v
        }
      }

      paint(nodeMat, { uAccent: s.accent, uAccentHot: s.hot, uRest: s.nodeRest, uAlpha: s.nodeAlpha })
      paint(edgeMat, { uAccent: s.accent, uAccentHot: s.hot, uRest: s.edgeRest })
      paint(sparkMat, { uColor: s.spark, uAlpha: s.sparkAlpha })

      // Nodes and sparks glow additively on black and are painted normally on
      // cream. Edges stay normal in both — they are the structure, and they
      // have to stay legible.
      const blend = (mat, additive) => {
        const m = mat.current
        if (!m) return
        const want = additive ? THREE.AdditiveBlending : THREE.NormalBlending
        if (m.blending !== want) {
          m.blending = want
          m.needsUpdate = true
        }
      }
      blend(nodeMat, s.additive)
      blend(sparkMat, s.additive)
      blend(edgeMat, false)
    }

    apply(currentTheme())
    return onThemeChange(apply)
  }, [])

  useEffect(
    () => () => {
      node.dispose()
      edge.dispose()
      spark.dispose()
    },
    [node, edge, spark],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const flow = (t / FLOW_PERIOD) % 1

    // One value drives the wave in all three materials, so the nodes, the edges
    // and the sparks are always describing the same front.
    if (nodeMat.current) {
      nodeMat.current.uniforms.uTime.value = t
      nodeMat.current.uniforms.uFlow.value = flow
    }
    if (edgeMat.current) edgeMat.current.uniforms.uFlow.value = flow
    if (sparkMat.current) sparkMat.current.uniforms.uFlow.value = flow

    if (group.current) {
      const g = group.current
      // Every term here is a constant rate or a sine, so the motion is
      // continuous and differentiable. The previous version drove rotation.z
      // from the per-frame pointer *delta*, which is a step function — it
      // jumped on a flick and decayed to zero when the mouse was still, and
      // that judder was a real part of the stickiness.
      g.rotation.y = t * SPIN + pointerX.get() * 0.45
      g.rotation.x = Math.sin(t * 0.083) * 0.2 - pointerY.get() * 0.3
      // A slow breath, ±1.5%. Enough to feel alive, far too small to notice
      // as a pulse. The base scale is recomputed from the live viewport rather
      // than cached in a ref: the ref would have to be written during render,
      // which React forbids, and reading the live value means the object
      // re-sizes itself correctly on a resize with no extra plumbing.
      const breathe = 1 + Math.sin(t * 0.36) * 0.015
      g.scale.setScalar(scaleFor(state.viewport) * breathe)
    }

    // Sparks ride the wavefront along their edges. Longitude is recomputed per
    // frame from the live position so a spark is only ever lit while the front
    // is actually passing over it.
    const pos = spark.getAttribute('position')
    const th = spark.getAttribute('aTheta')
    const { points, sparkEdges } = lattice
    for (let i = 0; i < sparkEdges.length; i += 1) {
      const [a, b] = sparkEdges[i]
      // One traverse every half period, so sparks cross the front twice a lap.
      const k = (t * 0.14 + i * 0.19) % 1
      const pa = points[a]
      const pb = points[b]
      const x = pa.x + (pb.x - pa.x) * k
      const y = pa.y + (pb.y - pa.y) * k
      const z = pa.z + (pb.z - pa.z) * k
      pos.setXYZ(i, x, y, z)
      th.setX(i, (Math.atan2(z, x) + Math.PI) / (Math.PI * 2))
    }
    pos.needsUpdate = true
    th.needsUpdate = true
  })

  // Size and offset come from scaleFor/shiftFor, which document the reasoning.
  const s = scaleFor(viewport)
  const shiftX = shiftFor(viewport)
  const shiftY = viewport.height * -0.02

  return (
    /* The lattice, the edges and the sparks all live in this one group, so they
       scale and shift together and cannot drift apart.

       Three draw calls total. The fresnel shell that used to sit behind all of
       this is gone — it was a soft violet haze over the whole object, and haze
       is the opposite of clean. */
    <group ref={group} scale={s} position={[shiftX, shiftY, 0]}>
      <points geometry={node}>
        <shaderMaterial
          ref={nodeMat}
          vertexShader={NODE_VERT}
          fragmentShader={NODE_FRAG}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={seed.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>

      <lineSegments geometry={edge}>
        <shaderMaterial
          ref={edgeMat}
          vertexShader={EDGE_VERT}
          fragmentShader={EDGE_FRAG}
          uniforms={edgeUniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>

      <points geometry={spark}>
        <shaderMaterial
          ref={sparkMat}
          vertexShader={SPARK_VERT}
          fragmentShader={SPARK_FRAG}
          uniforms={sparkUniforms}
          transparent
          depthWrite={false}
          blending={seed.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  )
}

function Rig() {
  useFrame((state, delta) => {
    const { camera } = state
    const k = smooth(delta, 0.0006)
    // Reads the shared pointer store, so the camera tracks a drag that starts
    // anywhere on the page. Smoothing is frame-rate independent.
    const targetX = pointerX.get() * 0.62
    const targetY = -pointerY.get() * 0.42
    camera.position.x += (targetX - camera.position.x) * k
    camera.position.y += (targetY - camera.position.y) * k
    // Pull the camera in slightly while dragging — a subtle dolly that makes
    // the scene feel responsive rather than floating.
    camera.position.z += (6.2 - pointerVY.get() * 0.45 - camera.position.z) * k
    camera.lookAt(0, 0, 0)
  })
  return null
}


/* ── Public component ─────────────────────────────────────── */
function hasWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HeroScene({ className = '' }) {
  // Detected once, lazily. Pure read of the DOM — no state-in-effect needed.
  const [supported] = useState(() => hasWebGL())
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const [visible, setVisible] = useState(true)
  const hostRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* Suspend the render loop when the hero scrolls out of view or the tab is
     hidden. Both observers write state directly, so pausing is immediate —
     the previous 400ms poll left the canvas burning frames for up to half a
     second after it had scrolled away, which read as the page "sticking". */
  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    let inView = true
    const sync = () => setVisible(inView && !document.hidden)

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        sync()
      },
      { threshold: 0 },
    )
    io.observe(host)

    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  if (!supported) return null

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible && !reduced ? 'always' : 'never'}
        camera={{ position: [0, 0, 6.2], fov: 42, near: 0.1, far: 100 }}
        /* Multisampling off. The scene is thin additive lines, and at a dpr of
           1.5 or more those are already well sampled — MSAA was costing a
           resolve on every frame of a full-screen additive pass and buying
           almost nothing. The glow, not the geometry, is what the eye reads. */
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <Mesh />
        <Rig />
      </Canvas>
    </div>
  )
}

