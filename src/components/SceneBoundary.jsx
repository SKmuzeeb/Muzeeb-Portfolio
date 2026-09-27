import { Component } from 'react'

/**
 * Keeps a failure inside a decorative subtree from taking the page with it.
 *
 * A WebGL hero is the single most likely thing on this site to throw at runtime:
 * a driver refuses a context, a shader fails to compile on an old GPU, a
 * texture upload blows past a limit, the machine is out of memory, a browser
 * blocks WebGL entirely. Every one of those is survivable — the page is
 * perfectly readable without the moving part — but an uncaught error in render
 * unmounts the *whole* React tree, so the visitor gets a white screen instead
 * of a page with a missing decoration.
 *
 * This is not speculative defensiveness. It is the difference between "the 3D
 * did not load" and "the site is down".
 *
 * Rendered as a plain div that fills the parent, so the surrounding layout does
 * not shift when the fallback replaces the scene.
 */
export default class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    // Logged rather than swallowed: a silently missing hero is much harder to
    // diagnose than a console error nobody sees.
    console.warn(`[SceneBoundary] ${this.props.label ?? 'scene'} failed, hiding it.`, error, info)
  }

  render() {
    const { children, className, label } = this.props
    if (this.state.failed) {
      return <div className={className} data-scene-failed={label ?? 'true'} />
    }
    return children
  }
}

