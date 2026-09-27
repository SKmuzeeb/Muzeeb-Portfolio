/**
 * The same drive rig, driven by a real .glb instead of the in-code car.
 *
 * This exists so a photoreal car is a drop-in rather than a rewrite. Put a CC0
 * model in public/models/, point MODEL_URL at it in CarScene.jsx, and the rest
 * of the scene — path, timing, wheel spin, body roll, focus — is identical.
 *
 * Deliberately uses `useLoader` from fiber plus GLTFLoader from three's own
 * examples rather than drei's `useGLTF`. Drei is not otherwise used anywhere on
 * this site, and importing it to serve a code path that is switched off would
 * put the whole library in the bundle for nothing. The loader is identical; the
 * only thing given up is drei's cache bookkeeping, which `useLoader` does too.
 *
 * A downloaded model is not authored for this rig, so three things have to be
 * normalised or the car will arrive sideways, underground, or at the wrong
 * size. Every one of them is a single constant at the top of this file.
 */
import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/** Correct for however the asset happens to be authored. */
const MODEL_YAW = 0
const MODEL_SCALE = 1
/** Negative lifts the model so its wheels sit on y = 0. */
const MODEL_DROP_Y = 0

const WHEEL_RE = /(wheel|tyre|tire|rim)/i

function collectWheels(root) {
  const found = []
  root.traverse((o) => {
    if (o.isMesh && WHEEL_RE.test(o.name)) found.push(o)
  })
  return found
}

/**
 * The asset, mounted and oriented. Wheels are handed to the drive rig through
 * a ref rather than through state: the rig spins them every frame, and routing
 * that through React state would re-render the scene 60 times a second.
 */
export function LoadedCar({ url, wheelsRef }) {
  const gltf = useLoader(GLTFLoader, url)

  const clone = useMemo(() => {
    // A glTF scene is shared by reference from the loader cache, so it has to
    // be cloned before it is rotated. Rotating the cached scene would rotate it
    // for every other user of the same asset as well.
    const c = gltf.scene.clone(true)
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return c
  }, [gltf.scene])

  useEffect(() => {
    if (wheelsRef) wheelsRef.current = collectWheels(clone)
  }, [clone, wheelsRef])

  return (
    <group rotation={[0, MODEL_YAW, 0]} scale={MODEL_SCALE} position={[0, MODEL_DROP_Y, 0]}>
      <primitive object={clone} />
    </group>
  )
}
