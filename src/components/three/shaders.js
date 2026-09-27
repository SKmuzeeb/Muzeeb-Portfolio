/**
 * GLSL for the hero WebGL object.
 *
 * The object is a geodesic lattice — a subdivided icosahedron — rather than the
 * points-plus-arbitrary-edges sphere this replaced. Two reasons, both about how
 * it reads:
 *
 * 1. TECHNICAL. An icosphere is what CAD, 3D printing and space telemetry are
 *    built from. Every vertex has identical valence and the triangles are
 *    uniform, so the eye sees a *made* structure. Connecting near neighbours on
 *    a Fibonacci sphere produces edges of wildly uneven length pointing in
 *    arbitrary directions, which is the visual signature of a hairball.
 * 2. CLEAN. There is no fresnel shell any more. It was a soft violet haze
 *    sitting over the whole object, and haze is the opposite of clean.
 *
 * The motion is a single coherent wavefront sweeping around the lattice in
 * longitude. The previous version had 18 sparks crawling along random edges at
 * unrelated phases — sparkle, not flow. One band travelling through a regular
 * structure reads as signal propagating through a network.
 *
 * The band is computed from angular distance with explicit wraparound, so
 * there is no seam where the wave crosses theta 0 — the thing that gives naive
 * implementations a visible crease down one side.
 */

/** Shared by every shader: seamless wraparound band, plus a dim trailing wake. */
const FLOW = `
  // Shortest distance between two angles expressed as a fraction of a turn.
  float angDist(float a, float b) {
    float d = abs(a - b);
    return min(d, 1.0 - d);
  }

  // A smooth band of light centred on \`head\`, with a wider, dimmer wake
  // trailing behind it so the wavefront has a front and a tail rather than
  // being a symmetric blob.
  float flowBand(float theta, float head, float width) {
    float front = angDist(theta, head);
    float wake  = angDist(theta, head + 0.14);
    float b = exp(-(front * front) / (width * width));
    float w = exp(-(wake * wake) / (width * width * 7.0)) * 0.4;
    return clamp(b + w, 0.0, 1.3);
  }
`

/** Lattice nodes. Tight core, small halo — crisp rather than fuzzy. */
export const NODE_VERT = `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uFlow;
  uniform float uFlowWidth;
  attribute float aTheta;
  varying float vBand;
  ${FLOW}
  void main() {
    float band = flowBand(aTheta, uFlow, uFlowWidth);
    // A slow standing shimmer on top of the wave, so the lattice still has a
    // life of its own when the wavefront is on the far side.
    float shimmer = 0.5 + 0.5 * sin(uTime * 0.9 + aTheta * 12.566);
    vBand = band;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Perspective divide by hand rather than relying on a fixed constant, so
    // the point size tracks the real camera distance as the rig dollies.
    float size = uSize * uPixelRatio * (0.78 + 0.5 * band) * (1.0 + 0.16 * shimmer);
    gl_PointSize = size * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

export const NODE_FRAG = `
  uniform vec3 uAccent;
  uniform vec3 uAccentHot;
  uniform float uRest;
  uniform float uAlpha;
  varying float vBand;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float core = smoothstep(0.32, 0.14, r);
    float halo = smoothstep(0.5, 0.22, r) * 0.3;
    float lit = clamp(vBand, 0.0, 1.0);
    vec3 col = mix(uAccent, uAccentHot, lit);
    // Same story as the edges: uRest is the floor, set per theme.
    float a = core * (uRest + (1.0 - uRest) * lit) + halo * (0.2 + 0.45 * vBand);
    gl_FragColor = vec4(col, clamp(a * uAlpha, 0.0, 1.0));
  }
`

/**
 * Lattice edges.
 *
 * \`aTheta\` is per-vertex, and each edge is two vertices, so the band is
 * evaluated at both ends and interpolated along the line. The wave therefore
 * travels *along* the edge rather than the whole edge lighting up at once,
 * which is what sells it as propagation instead of a blinking wireframe.
 */
export const EDGE_VERT = `
  uniform float uFlow;
  uniform float uFlowWidth;
  attribute float aTheta;
  varying float vBand;
  ${FLOW}
  void main() {
    vBand = flowBand(aTheta, uFlow, uFlowWidth);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const EDGE_FRAG = `
  uniform vec3 uAccent;
  uniform vec3 uAccentHot;
  uniform float uRest;
  varying float vBand;
  void main() {
    float lit = clamp(vBand, 0.0, 1.0);
    // \`uRest\` is the resting visibility and is the single most important
    // number here. An earlier version hardcoded a resting level of 0.17 and
    // multiplied by an opacity of 0.62, giving an effective 0.105 — orange
    // lines that were effectively invisible on black while the cyan wavefront
    // blazed, which read as "the orange lines are broken". A thin 1px line
    // needs a high floor, and the floor is set per theme because a line on
    // cream needs far more opacity than the same line on black.
    float a = uRest + lit * (1.0 - uRest);
    vec3 col = mix(uAccent, uAccentHot, lit);
    gl_FragColor = vec4(col, a);
  }
`

/** Sparks riding the wavefront along selected edges. */
export const SPARK_VERT = `
  uniform float uPixelRatio;
  uniform float uFlow;
  uniform float uFlowWidth;
  attribute float aTheta;
  varying float vBand;
  ${FLOW}
  void main() {
    vBand = flowBand(aTheta, uFlow, uFlowWidth);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Only visible inside the wavefront, so sparks never fly around on their
    // own schedule.
    gl_PointSize = (2.0 + 7.0 * clamp(vBand, 0.0, 1.0)) * uPixelRatio * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

export const SPARK_FRAG = `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vBand;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(uColor, core * core * clamp(vBand, 0.0, 1.0) * uAlpha);
  }
`

/**
 * No palette is exported from here any more. Colours are per-theme and live in
 * SCHEMES in HeroScene.jsx, because the same colour is not the same visual
 * weight on black and on cream — see the note there. Anything exported from
 * this file should be shader source only.
 */
