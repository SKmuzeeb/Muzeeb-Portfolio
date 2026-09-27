import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLockBodyScroll, useEscape } from '../hooks/index.js'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Fullscreen image viewer with arrow-key / swipe navigation.
 * `items` is an array of { src, alt, caption }.
 */
export default function Lightbox({ items, index, onClose, onNavigate }) {
  const open = index !== null && index >= 0
  const closeRef = useRef(null)
  const panelRef = useRef(null)

  useLockBodyScroll(open)
  useEscape(open, onClose)

  const go = useCallback(
    (delta) => {
      if (!items.length) return
      onNavigate((index + delta + items.length) % items.length)
    },
    [index, items.length, onNavigate],
  )

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, go])

  if (!open) return null
  const item = items[index]

  return (
    <AnimatePresence>
      <motion.div
        className="overlay z-lightbox flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        role="dialog"
        aria-modal="true"
        aria-label={item.caption || 'Image viewer'}
      >
        <button
          type="button"
          aria-label="Close viewer"
          onClick={onClose}
          className="overlay-scrim bg-void/96 backdrop-blur-lg"
        />

        <div className="overlay-panel flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="font-mono text-mono text-ink-mute">
              <span className="text-flame">{String(index + 1).padStart(2, '0')}</span>
              <span className="mx-2 text-ink-faint">/</span>
              {String(items.length).padStart(2, '0')}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-ink-dim transition-colors hover:border-flame hover:text-flame"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              <span className="sr-only">Close</span>
            </button>
          </div>

          <motion.div
            key={index}
            className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center px-5 sm:px-8"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            ref={panelRef}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="max-h-full w-full rounded-lg border border-line object-contain shadow-soft"
            />
          </motion.div>

          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <p className="truncate font-mono text-mono text-ink-dim">{item.caption}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-ink-dim transition-colors hover:border-flame hover:text-flame"
                aria-label="Previous image"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-ink-dim transition-colors hover:border-flame hover:text-flame"
                aria-label="Next image"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
