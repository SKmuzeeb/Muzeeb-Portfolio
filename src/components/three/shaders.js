/**
 * GLSL used by the hero WebGL scene.
 *
 * The hero visual is a service mesh: nodes distributed evenly over a sphere
 * (Fibonacci placement), edges between near neighbours, and pulses travelling
 * along a few edges to read as requests in flight. Shading is deliberately
 * restrained — a faint fresnel shell plus additive points — so it stays a
 * background rather than competing with the type.
 */
import * as THREE from 'three'

/** Faint fresnel shell — gives the mesh volume without hiding the nodes. */
export const SHELL_VERT = `
varying vec3 vNormalW;
varying vec3 vViewDir;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalW = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`

export const SHELL_FRAG = `
uniform vec3 uAccent;
uniform float uOpacity;
varying vec3 vNormalW;
varying vec3 vViewDir;
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0), 3.4);
  gl_FragColor = vec4(uAccent, fres * uOpacity);
}`

/**
 * Node points. Per-point size and a slow travelling pulse, so the mesh
 * breathes instead of sitting perfectly static.
 */
export const NODE_VERT = `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
attribute float aSize;
attribute float aPhase;
varying float vPulse;
void main() {
  vPulse = 0.55 + 0.45 * sin(uTime * 1.1 + aPhase * 6.2831);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * aSize * uPixelRatio * (1.0 + vPulse * 0.35) * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`

export const NODE_FRAG = `
uniform vec3 uAccent;
uniform vec3 uAccentAlt;
varying float vPulse;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  if (r > 0.5) discard;
  float core = smoothstep(0.5, 0.06, r);
  float glow = smoothstep(0.5, 0.0, r);
  vec3 col = mix(uAccent, uAccentAlt, vPulse);
  gl_FragColor = vec4(col, core * 0.9 + glow * 0.25);
}`

/** Request pulses: bright dots interpolated along selected edges each frame. */
export const PULSE_VERT = `
uniform float uPixelRatio;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 9.0 * uPixelRatio * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`

export const PULSE_FRAG = `
uniform vec3 uColor;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  if (r > 0.5) discard;
  float core = smoothstep(0.5, 0.0, r);
  gl_FragColor = vec4(uColor, core * core);
}`

export const PALETTE = {
  accent: new THREE.Color('#ff6a1a'),
  accentAlt: new THREE.Color('#22d3ee'),
  shell: new THREE.Color('#7c5cff'),
}
