import { motion } from 'framer-motion'
import { categories } from '../data/categories.js'
import { countsByCategory } from '../data/projects/index.js'

const EASE = [0.16, 1, 0.3, 1]
const counts = countsByCategory()

/**
 * Category filter. Horizontal scroll on small screens, `role="tablist"`
 * semantics, and the active pill is a shared layout element so it slides.
 */
export default function CategoryFilter({ active, onChange, className = '' }) {
  return (
    <div
      className={`hide-scrollbar -mx-(--spacing-edge) flex gap-2 overflow-x-auto px-(--spacing-edge) pb-1 ${className}`}
      role="tablist"
      aria-label="Filter work by category"
    >
      {categories.map((cat) => {
        const isActive = active === cat.key
        return (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.key)}
            className={`relative shrink-0 rounded-full border px-4 py-2.5 font-mono text-label tracking-[0.16em] uppercase transition-colors duration-300 ${
              isActive ? 'text-void' : 'border-line text-ink-dim hover:border-line-strong hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 -z-10 rounded-full bg-flame"
                transition={{ duration: 0.45, ease: EASE }}
              />
            )}
            <span className="flex items-center gap-2">
              {cat.label}
              <span className={isActive ? 'text-void/60' : 'text-ink-faint'}>
                {String(counts[cat.key]).padStart(2, '0')}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
