import { useContext, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle.jsx'
import { navItems, profile, resume } from '../data/site.js'
import { ProfileModalContext } from '../lib/profile-context.js'
import { useLockBodyScroll, useEscape } from '../hooks/index.js'

const EASE = [0.16, 1, 0.3, 1]

/** Circular button that opens the quick technical profile sheet. */
export function ProfileButton({ size = 'md', className = '' }) {
  const { open } = useContext(ProfileModalContext)
  const dims = size === 'lg' ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-11 w-11'
  const iconSize = size === 'lg' ? '2.1rem' : '1.25rem'

  return (
    <button
      type="button"
      onClick={open}
      className={`group relative grid shrink-0 place-items-center ${dims} ${className}`}
      aria-label="Open technical profile"
    >
      <span className="absolute inset-0 animate-pulse-ring rounded-full border border-flame/50" aria-hidden="true" />
      <span
        className="absolute inset-0 animate-pulse-ring rounded-full border border-flame/30 [animation-delay:1.1s]"
        aria-hidden="true"
      />
      <span className="absolute inset-0 rounded-full border border-line-strong bg-void/60 backdrop-blur-md transition-all duration-500 group-hover:border-flame group-hover:bg-flame/10" />
      <span
        className="material-symbols-outlined relative z-10 text-flame transition-transform duration-500 group-hover:scale-110"
        style={{ fontSize: iconSize }}
        aria-hidden="true"
      >
        terminal
      </span>
      {size === 'lg' && (
        <span className="absolute top-[calc(100%+0.9rem)] left-1/2 -translate-x-1/2 font-mono text-label tracking-[0.22em] whitespace-nowrap text-ink-mute uppercase">
          Quick profile
        </span>
      )}
    </button>
  )
}

function MobileMenu({ open, onClose }) {
  useLockBodyScroll(open)
  useEscape(open, onClose)

  const links = [{ label: 'Home', to: '/' }, ...navItems]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay z-drawer lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="overlay-scrim bg-void/95 backdrop-blur-xl"
          />
          <motion.nav
            className="overlay-panel flex h-full flex-col justify-between px-(--spacing-edge) pt-24 pb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            aria-label="Mobile navigation"
          >
            <ul className="hide-scrollbar -mx-(--spacing-edge) flex-1 space-y-1 overflow-y-auto px-(--spacing-edge)">
              {links.map((item, i) => (
                <motion.li
                  key={item.to}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1, duration: 0.5, ease: EASE }}
                >
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className="flex items-baseline gap-4 border-b border-line py-3.5 font-display text-2xl font-bold tracking-tight transition-colors hover:text-flame sm:text-3xl"
                  >
                    <span className="font-mono text-mono text-ink-faint">0{i + 1}</span>
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-6 space-y-4">
              <Link to="/contact" onClick={onClose} className="btn btn-primary w-full">
                Let&apos;s connect
              </Link>
              <p className="font-mono text-mono text-ink-mute">{profile.location}</p>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function NavBar() {
  const { pathname } = useLocation()

  // Menu state carries the route it was opened on, so navigating closes it
  // without a setState-in-effect cascade.
  const [menu, setMenu] = useState({ open: false, path: pathname })
  const [scrolled, setScrolled] = useState(false)
  const menuOpen = menu.path === pathname && menu.open

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleMenu = () => setMenu((m) => ({ open: !m.open, path: pathname }))
  const closeMenu = () => setMenu((m) => ({ ...m, open: false }))

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-header transition-all duration-500 ${
          scrolled || menuOpen
            ? 'border-b border-line bg-void/78 backdrop-blur-xl'
            : 'border-b border-transparent'
        }`}
      >
        <div className="shell flex h-(--nav-h) items-center justify-between gap-4">
          <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label={`${profile.name} — home`}>
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-sm border border-line-strong font-mono text-xs font-bold tracking-tight text-ink">
              <span className="absolute inset-0 bg-linear-135 from-flame/0 to-plasma/0 transition-all duration-500 group-hover:from-flame/30 group-hover:to-plasma/30" />
              <span className="relative">{profile.initials}</span>
            </span>
            <span className="hidden flex-col leading-none lg:flex">
              <span className="font-display text-sm font-semibold tracking-tight">{profile.name}</span>
              <span className="mt-1 font-mono text-[0.6rem] tracking-[0.18em] text-ink-mute uppercase">
                {profile.role}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 font-mono text-[0.7rem] tracking-[0.08em] uppercase transition-colors ${
                    isActive ? 'text-ink' : 'text-ink-mute hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full border border-line bg-white/4"
                        transition={{ duration: 0.45, ease: EASE }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <ProfileButton className="hidden sm:grid" />
            <Link to={resume.fallbackRoute} className="btn btn-ghost hidden lg:inline-flex">
              Resume
            </Link>
            <Link to="/contact" className="btn btn-primary hidden sm:inline-flex">
              Let&apos;s connect
            </Link>
            <button
              type="button"
              onClick={toggleMenu}
              className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-flame hover:text-flame xl:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}

