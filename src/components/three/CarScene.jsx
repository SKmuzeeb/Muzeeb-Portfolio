/**
 * Drive-by: the car comes in from the distance, sweeps past close, takes a turn
 * and recedes.
 *
 * The shot is a locked-off camera with a lagging follow-focus, which is the
 * version of this that reads as filmed rather than as a game camera. The camera
 * does not move; the *focus* drifts toward the car with a small lerp, so the car
 * stays roughly framed the whole way without the camera whipping after it.
 *
 * The path is a CatmullRom curve through seven control points. Straight lines
 * would make the car snap between headings; a spline gives it continuous
 * heading, which is what lets the body roll continuously into the corner
 * instead of teleporting sideways.
 *
 * Loop seam: the car is at its smallest and most distant at both ends, so it
 * is scaled to nothing over the first and last few percent rather than faded.
 * Fading would mean transparent PBR materials, which cost the clearcoat — the
 * scaling is invisible at that distance and costs nothing.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildCar, CAR_DIMS } from './car/buildCar.js'
import { LoadedCar } from './car/LoadedCar.jsx'
import { currentTheme, onThemeChange } from '../../lib/theme.js'

/**
 * Set to a URL to swap the in-code car for a real model, e.g. '/models/car.glb'.
 * Left null the procedural car is used. Drop a .glb into public/models/ and flip
 * this one string — nothing else changes.
 */
const MODEL_URL = null

/** Seconds for one full lap of the path. */
const LAP = 12

/**
 * The drive: in from the far left, past close on the right, arc back across,
 * out to the left again.
 *
 * Every number in here is set by the camera, and getting them wrong is why the
 * car was invisible on the first attempt. Two things went wrong:
 *
 * 1. The path was 400 units long (z = -196 to +188). At that distance a 5-unit
 *    car is about 3% of the frame height — a three-pixel speck for most of every
 *    lap, and only 25% of frame at its closest.
 * 2. Worse, the far end ran to z = +188, which is *behind* the camera at
 *    z = +24. The car spent nearly half the lap driving out of shot entirely,
 *    with the locked-off camera pointed at empty road.
 *
 * The path below is shorter and, critically, stays in front of the camera the
 * whole way: the closest it comes to the lens is about 9 units, at which the car
 * fills roughly two thirds of the frame height, and the furthest point is still
 * in shot. `npm run check:car` asserts all of that — largest apparent size,
 * time spent under 3% of frame, and time spent more than 70 degrees off the
 * view axis — so a future tweak that reintroduces this fails the check instead
 * of quietly going invisible again.
 */
const PATH = new THREE.CatmullRomCurve3(
  [
    [-72, 0, -116],
    [-46, 0, -84],
    [-20, 0, -56],
    [4, 0, -34],
    [26, 0, -12],
    [32, 0, 10],
    [14, 0, 16],
    [-20, 0, 2],
    [-62, 0, -46],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5,
)

/** Where the car starts, and therefore where the camera must begin looking. */
const START = PATH.getPointAt(0)

/** How strongly the body leans into a corner, in radians per unit of curvature. */
const ROLL = 0.055
/**
 * How far the focus lags the car, per frame at 60fps, frame-rate corrected.
 *
 * Slow on purpose. The camera itself is locked off and only the *focus* drifts,
 * so a fast follow pins the car dead centre the whole way and the shot loses
 * its sense of the car moving through a space. At 0.02 the time constant is
 * about 0.8s — the car pulls ahead of frame centre and the camera takes its
 * time catching up.
 */
const FOLLOW = 0.02

function Drive({ carRef, wheelsRef }) {
  const camera = useThree((s) => s.camera)
  // Starts on the car, not on some arbitrary point in front of the camera.
  // Starting anywhere else means the opening seconds are spent aimed at empty
  // road while the car is still arriving.
  const focus = useRef(START.clone().setY(0.8))
  const lastHeading = useRef(0)
  const travelled = useRef(0)
  const lastPos = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const car = carRef.current
    if (!car) return
    const t = state.clock.elapsedTime

    // Loop the path. euclideanModulo, because a plain % on a value that
    // accumulates upward goes negative at some point and the car vanishes.
    const u = THREE.MathUtils.euclideanModulo(t / LAP, 1)
    const pos = PATH.getPointAt(u)
    const ahead = PATH.getPointAt(Math.min(0.9999, u + 0.004))
    const behind = PATH.getPointAt(Math.max(0.0001, u - 0.004))

    const heading = Math.atan2(ahead.x - behind.x, ahead.z - behind.z)
    car.position.copy(pos)

    // Yaw to the tangent. Built by hand rather than with lookAt, which would
    // aim the object's -Z at the target and tip its up vector — the car would
    // pitch into the road at every change of heading.
    car.rotation.set(0, heading, 0)

    // Roll into the corner: the change in heading between frames, damped.
    let dh = heading - lastHeading.current
    if (dh > Math.PI) dh -= Math.PI * 2
    if (dh < -Math.PI) dh += Math.PI * 2
    lastHeading.current = heading
    const targetRoll = THREE.MathUtils.clamp(-dh * ROLL * 60 * delta, -0.13, 0.13)
    car.rotation.z += (targetRoll - car.rotation.z) * 0.15
    // Weight transfer: squat under braking, dive under power.
    car.rotation.x = Math.sin(t * 0.9) * 0.006

    // Distance actually covered, so the wheels spin at the right rate and
    // reverse correctly if the car ever does.
    travelled.current += pos.distanceTo(lastPos.current)
    lastPos.current.copy(pos)
    const spin = -travelled.current / CAR_DIMS.WHEEL_R
    wheelsRef.current.forEach((w) => {
      w.rotation.x = spin
    })

    // Loop seam. At the extremes the car is ~200 units out and a few pixels
    // tall, so scaling it out is invisible where a fade would have cost the
    // clearcoat on every material in the scene.
    const edge = Math.min(u, 1 - u) / 0.045
    car.scale.setScalar(THREE.MathUtils.clamp(edge, 0, 1))

    // Lagging follow-focus. The camera itself never moves.
    const k = 1 - Math.pow(1 - FOLLOW, delta * 60)
    focus.current.lerp(pos, k)
    camera.lookAt(focus.current)
  })

  return null
}

/**
 * A real environment map.
 *
 * Without one, metalness has nothing to reflect and the car renders as flat grey
 * no matter how the lights are set up — metallic surfaces are almost entirely
 * reflection, and with nothing to reflect they render as their base colour.
 * RoomEnvironment gives a plausible indoor studio in one line.
 *
 * Attached declaratively via R3F's `attach` prop rather than by assigning
 * `gl.scene.environment` in an effect. The hand-assignment works, and is what
 * most examples show, but it mutates a value owned by the renderer hook, which
 * the compiler lint correctly rejects and which is genuinely fragile across a
 * re-render.
 */
function EnvRig() {
  const gl = useThree((s) => s.renderer)

  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04)
    // The generator can go once the render target exists; the texture it
    // produced stays valid.
    pmrem.dispose()
    return rt.texture
  }, [gl])

  useEffect(() => () => env.dispose(), [env])

  return <primitive object={env} attach="environment" />
}

/**
 * Lighting.
 *
 * A car is mostly a reflection, so the lights are arranged to put a long
 * highlight down the flank and a rim along the top edge. A single overhead
 * light makes it look like a tabletop model.
 */
function Lights({ theme }) {
  const light = theme === 'light' ? 0x3a3428 : 0xffffff
  const key = theme === 'light' ? 2.6 : 3.4
  return (
    <>
      <hemisphereLight args={[theme === 'light' ? 0xffffff : 0x8899bb, theme === 'light' ? 0xd8cbb0 : 0x0a0a12, theme === 'light' ? 1.1 : 0.5]} />
      {/* Key, high and to the side, for the flank highlight. */}
      <directionalLight position={[26, 34, 18]} intensity={key} color={light} castShadow />
      {/* Rim from behind, to separate the roofline from the background. */}
      <directionalLight position={[-30, 16, -40]} intensity={key * 0.5} color={theme === 'light' ? 0x6b5c44 : 0xbcd4ff} />
      {/* Low fill, so the sills and the underside of the nose are not black. */}
      <directionalLight position={[0, 4, 30]} intensity={0.5} color={light} />
    </>
  )
}

/** The road. A large plane with a low-roughness dark surface, so it catches a
 *  sheen and gives the car something to sit on rather than floating in a void. */
function Ground({ theme }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
      <planeGeometry args={[900, 900]} />
      <meshStandardMaterial
        color={theme === 'light' ? 0xe2d9c6 : 0x08080c}
        metalness={theme === 'light' ? 0.1 : 0.55}
        roughness={theme === 'light' ? 0.7 : 0.42}
        envMapIntensity={0.5}
      />
    </mesh>
  )
}

/** The car itself, procedural or loaded, wired to the drive rig. */
function Car() {
  const carRef = useRef()
  const wheelsRef = useRef([])

  // Rebuilt once. The geometry work is not free and none of it depends on
  // anything that changes.
  const { car, wheels } = useMemo(() => buildCar(), [])

  useEffect(() => {
    wheelsRef.current = wheels
    return () => car.userData.dispose?.()
  }, [car, wheels])

  return (
    <>
      <group ref={carRef}>
        <primitive object={car} />
      </group>
      <Drive carRef={carRef} wheelsRef={wheelsRef} />
    </>
  )
}

/** Same rig, real asset. Separate component because useGLTF cannot be
 *  conditional, and hooks cannot sit behind an `if`. */
function CarLoaded({ url }) {
  const carRef = useRef()
  const wheelsRef = useRef([])
  return (
    <>
      <group ref={carRef}>
        <LoadedCar url={url} wheelsRef={wheelsRef} />
      </group>
      <Drive carRef={carRef} wheelsRef={wheelsRef} />
    </>
  )
}

function hasWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function CarScene({ className = '' }) {
  const [supported] = useState(() => hasWebGL())
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const [visible, setVisible] = useState(true)
  const [theme, setTheme] = useState(currentTheme)
  const hostRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    const offTheme = onThemeChange(setTheme)
    return () => {
      mq.removeEventListener('change', onChange)
      offTheme()
    }
  }, [])

  // Suspend the loop when the hero is off screen or the tab is hidden. The
  // car is the most expensive thing on the site; burning frames on it while
  // nobody can see it is the stutter problem again in a new place.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    let inView = true
    const sync = () => setVisible(inView && !document.hidden)
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      sync()
    }, { threshold: 0 })
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
        shadows
        frameloop={visible && !reduced ? 'always' : 'never'}
        camera={{ position: [10, 2.2, 24], fov: 42, near: 0.5, far: 400 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <EnvRig />
        <Lights theme={theme} />
        <Ground theme={theme} />
        {MODEL_URL ? <CarLoaded url={MODEL_URL} /> : <Car />}
      </Canvas>
    </div>
  )
}
