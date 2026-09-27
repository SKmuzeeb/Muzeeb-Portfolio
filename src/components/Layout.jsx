import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './NavBar.jsx'
import Footer from './Footer.jsx'
import ScrollProgress from './ScrollProgress.jsx'
import { usePointerTracking } from '../hooks/index.js'

/** Reset scroll on navigation, but honour in-page hash links. */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

export default function Layout() {
  usePointerTracking()

  return (
    <div className="relative flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-skip focus:rounded-sm focus:border focus:border-flame focus:bg-void focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
      >
        Skip to content
      </a>

      <ScrollProgress />
      <ScrollManager />
      <NavBar />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
