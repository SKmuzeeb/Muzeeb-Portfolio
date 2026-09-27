import { useEffect, useState } from 'react'
import { currentTheme, toggleTheme, onThemeChange, initTheme } from '../lib/theme.js'

/**
 * Light / dark switch.
 *
 * The two states are rendered side by side and cross-faded with opacity and
 * scale, because a rotating sun/moon glyph reads as a loading state and you
 * cannot tell which theme you are about to get.
 */
export default function ThemeToggle({ className = '' }) {
  const [theme, setLocalTheme] = useState(() => currentTheme())

  useEffect(() => {
    initTheme()
    return onThemeChange(setLocalTheme)
  }, [])

  const isLight = theme === 'light'
  const label = isLight ? 'Switch to dark theme' : 'Switch to light theme'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong text-ink-dim transition-colors duration-400 hover:border-line-accent hover:text-ink ${className}`}
      aria-label={label}
      title={label}
      aria-pressed={isLight}
    >
      <span className="relative grid h-5 w-5 place-items-center">
        {/* Sun — light theme. */}
        <span
          className="absolute inset-0 grid place-items-center transition-all duration-500"
          style={{
            opacity: isLight ? 1 : 0,
            transform: isLight ? 'rotate(0deg) scale(1)' : 'rotate(-70deg) scale(0.6)',
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
          </svg>
        </span>
        {/* Moon — dark theme. */}
        <span
          className="absolute inset-0 grid place-items-center transition-all duration-500"
          style={{
            opacity: isLight ? 0 : 1,
            transform: isLight ? 'rotate(70deg) scale(0.6)' : 'rotate(0deg) scale(1)',
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z" />
          </svg>
        </span>
      </span>
    </button>
  )
}