import { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  SHELL_VERT, SHELL_FRAG, NODE_VERT, NODE_FRAG, PULSE_VERT, PULSE_FRAG, PALETTE,
} from './shaders.js'
import { createRng } from '../../lib/prng.js'
import { pointerX, pointerY, pointerVX, pointerVY } from '../../lib/pointer.js'

const NODE_COUNT = 130
const NEIGHBOURS = 3
const PULSE_COUNT = 18
const RADIUS = 2.35

/**
 * Frame-rate independent smoothing factor.
 *
 * A raw `lerp(current, target, 0.05)` runs ~3x faster on a 144Hz display than
 * on a 60Hz one, which is exactly the "animation gets stuck / speeds up"
 * inconsistency. This form gives the same feel at any refresh rate.
 */
const smooth = (delta, rate = 0.001) => 1 - Math.pow(rate, delta)

/**
 * Even node distribution over a sphere (Fibonacci placement) plus edges
 * between near neighbours. Deterministic, so the mesh is identical on every
 * load and stays stable across React re-renders.
 */
function buildMesh() {
  const rng = createRng('hero-mesh')
  const points = []

  for (let i = 0; i < NODE_COUNT; i += 1) {
    // Golden-angle spiral — uniform coverage without clumping at the poles.
    const y = 1 - (i / (NODE_COUNT - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = Math.PI * (3 - Math.sqrt(5)) * i
    const jitter = 0.94 + rng() * 0.12
    points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(RADIUS * jitter))
  }

  // Connect each node to its nearest few neighbours, de-duplicating pairs.
  const seen = new Set()
  const edges = []
  for (let i = 0; i < points.length; i += 1) {
    const order = points
      .map((p, j) => ({ j, d: p.distanceTo(points[i]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, NEIGHBOURS)

    for (const { j } of order) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) continue
      seen.add(key)
      edges.push([i, j])
    }
  }

  // A handful of edges get a travelling pulse.
  const pulsed = edges.filter(() => rng() > 0.82).slice(0, PULSE_COUNT)

  return { points, edges, pulsed }
}

function useGeometries(points, edges) {
  return useMemo(() => {
    const node = new THREE.BufferGeometry()
    const nPos = new Float32Array(points.length * 3)
    const nSize = new Float32Array(points.length)
    const nPhase = new Float32Array(points.length)
    points.forEach((p, i) => {
      nPos[i * 3] = p.x
      nPos[i * 3 + 1] = p.y
      nPos[i * 3 + 2] = p.z
      nSize[i] = 0.6 + ((i * 37) % 11) / 11
      nPhase[i] = ((i * 53) % 97) / 97
    })
    node.setAttribute('position', new THREE.BufferAttribute(nPos, 3))
    node.setAttribute('aSize', new THREE.BufferAttribute(nSize, 1))
    node.setAttribute('aPhase', new THREE.BufferAttribute(nPhase, 1))

    const edge = new THREE.BufferGeometry()
    const ePos = new Float32Array(edges.length * 6)
    const eCol = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      const pa = points[a]
      const pb = points[b]
      ePos.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], i * 6)
      eCol.set([0.34, 0.19, 0.07, 0.34, 0.19, 0.07], i * 6)
    })
    edge.setAttribute('position', new THREE.BufferAttribute(ePos, 3))
    edge.setAttribute('color', new THREE.BufferAttribute(eCol, 3))

    const pulse = new THREE.BufferGeometry()
    pulse.setAttribute('position', new THREE.BufferAttribute(new Float32Array(Math.max(PULSE_COUNT, 1) * 3), 3))

    return { node, edge, pulse }
  }, [points, edges])
}

/* ── Scene ────────────────────────────────────────────────── */
function Mesh() {
  const group = useRef()
  const nodeMat = useRef()
  const { viewport } = useThree()

  const { points, edges, pulsed } = useMemo(() => buildMesh(), [])
  const { node, edge, pulse } = useGeometries(points, edges)

  const dpr = () => Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)

  const nodeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 2.8 },
      uPixelRatio: { value: dpr() },
      uAccent: { value: PALETTE.accent.clone() },
      uAccentAlt: { value: PALETTE.accentAlt.clone() },
    }),
    [],
  )

  const pulseUniforms = useMemo(
    () => ({ uPixelRatio: { value: dpr() }, uColor: { value: new THREE.Color('#ffd9b8') } }),
    [],
  )

  const shellUniforms = useMemo(
    () => ({ uAccent: { value: PALETTE.shell.clone() }, uOpacity: { value: 0.3 } }),
    [],
  )

  const edgeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  useEffect(
    () => () => {
      node.dispose()
      edge.dispose()
      pulse.dispose()
      edgeMaterial.dispose()
    },
    [node, edge, pulse, edgeMaterial],
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (nodeMat.current) nodeMat.current.uniforms.uTime.value = t

    // Pointer parallax layered over a slow idle drift. Reads the shared store
    // rather than R3F's own pointer, so dragging anywhere on the page moves
    // the mesh — not just dragging over the canvas.
    if (group.current) {
      group.current.rotation.y = pointerX.get() * 0.5 + t * 0.045
      group.current.rotation.x = -pointerY.get() * 0.34 + Math.sin(t * 0.12) * 0.08
      // A small counter-rotation that lags behind, so the mesh feels like it
      // has mass when you flick the pointer.
      const lag = smooth(delta, 0.0002)
      group.current.rotation.z += (pointerVX.get() * 0.5 - group.current.rotation.z) * lag
    }

    // Move the request pulses along their edges.
    const attr = pulse.getAttribute('position')
    for (let i = 0; i < pulsed.length; i += 1) {
      const [a, b] = pulsed[i]
      const k = (t * 0.22 + i * 0.37) % 1
      const pa = points[a]
      const pb = points[b]
      // Slight arc so pulses read as travelling over the surface, not through it.
      const lift = Math.sin(k * Math.PI) * 0.32
      attr.setXYZ(
        i,
        pa.x + (pb.x - pa.x) * k,
        pa.y + (pb.y - pa.y) * k + lift,
        pa.z + (pb.z - pa.z) * k,
      )
    }
    attr.needsUpdate = true
  })

  /* Size and position, in world units, so the mesh is the same apparent size on
     every screen shape.

     R3F's `viewport` is in world units, and the camera sees 4.76 of height at
     z=0. The mesh is 4.7 across in its own local space, so `narrow * 0.17`
     made it fill 80% of the narrow edge — on a phone as much as a desktop.
     That is why it read as one enormous mass sitting behind the name instead
     of an object in the scene, and why the near side of the sphere was the
     only part ever visible.

     At 0.12 it fills 56% of the narrow edge on every screen. Sizing off the
     smaller dimension is what keeps it inside the frame on a narrow phone
     rather than spilling off both sides. */
  const s = Math.min(viewport.width, viewport.height) * 0.12
  // The offset is proportional for the same reason: a fixed world-space shift
  // would be a nudge on a desktop and most of the way off a phone.
  const shiftX = viewport.width * 0.25
  const shiftY = viewport.height * -0.02

  return (
    /* The visible mesh and the inner shell live in this one group, so they
       scale and shift together and cannot drift apart. */
    <group ref={group} scale={s} position={[shiftX, shiftY, 0]}>
      <points geometry={node}>
        <shaderMaterial
          ref={nodeMat}
          vertexShader={NODE_VERT}
          fragmentShader={NODE_FRAG}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments geometry={edge} material={edgeMaterial} />

      <points geometry={pulse}>
        <shaderMaterial
          vertexShader={PULSE_VERT}
          fragmentShader={PULSE_FRAG}
          uniforms={pulseUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh>
        <icosahedronGeometry args={[RADIUS * 1.06, 4]} />
        <shaderMaterial
          vertexShader={SHELL_VERT}
          fragmentShader={SHELL_FRAG}
          uniforms={shellUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
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

