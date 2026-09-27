import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

/**
 * Scroll parallax layer.
 *
 * `distance` is the total px travelled across the element's scroll pass;
 * negative values move against the scroll. `scaleFrom`/`scaleTo` add a subtle
 * dolly. `shift` counter-moves horizontally for layered depth.
 */
export default function Parallax({
  children,
  distance = 60,
  scaleFrom,
  scaleTo,
  shift = 0,
  className = '',
  as = 'div',
  ...rest
}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [scaleFrom ?? 1, ((scaleFrom ?? 1) + (scaleTo ?? scaleFrom ?? 1)) / 2, scaleTo ?? scaleFrom ?? 1],
  )
  const x = useTransform(scrollYProgress, [0, 1], [shift, -shift])

  const style = reduced
    ? undefined
    : {
        y,
        ...(scaleFrom !== undefined || scaleTo !== undefined ? { scale } : {}),
        ...(shift !== 0 ? { x } : {}),
      }

  const Tag = as
  if (reduced || !style) {
    return (
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag ref={ref} className={className} style={style} {...rest}>
      {children}
    </MotionTag>
  )
}
