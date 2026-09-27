import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Scroll-triggered reveal. `y` is the travel distance in px.
 * Disabled entirely when the user prefers reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  duration = 0.9,
  once = true,
  className = '',
  as = 'div',
  amount = 0.25,
  ...rest
}) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  if (reduced) {
    const Tag = as
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Stagger container — pair with <RevealChild>. */
export function RevealGroup({ children, className = '', stagger = 0.08, delay = 0, amount = 0.2 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevealChild({ children, className = '', y = 24, as = 'div' }) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: 'blur(5px)' },
        show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: EASE } },
      }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * A card that visibly *opens* as it scrolls into view.
 *
 * The plain Reveal just fades and drifts, which on a grid of cards reads as
 * the page loading rather than as anything happening. This adds scale and a
 * small rotateX on a perspective, so the card looks like it unfolds toward
 * the viewer, and it springs into place rather than easing — that overshoot
 * is what makes it feel open.
 *
 * A spring is used instead of a duration because the settle time then adapts
 * to how far the card has to travel, so a card near the viewport edge and one
 * dead centre do not feel different.
 */
export function RevealCard({ children, delay = 0, className = '', as = 'div', amount = 0.2 }) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  if (reduced) {
    const Tag = as
    return (
      <Tag className={className}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionTag
      className={className}
      style={{ transformPerspective: 1400, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 48, scale: 0.92, rotateX: 12 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, amount }}
      transition={{ type: 'spring', stiffness: 85, damping: 17, mass: 0.9, delay }}
    >
      {children}
    </MotionTag>
  )
}
