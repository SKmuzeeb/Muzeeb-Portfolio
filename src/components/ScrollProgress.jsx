import { motion, useScroll, useSpring } from 'framer-motion'

/** Fixed hairline progress bar driven by document scroll. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-progress h-[2px] origin-left bg-linear-90 from-flame via-flame-soft to-plasma"
      style={{ scaleX }}
      aria-hidden="true"
    />
  )
}
