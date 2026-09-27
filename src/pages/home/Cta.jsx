import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useParallax, useDragTilt } from '../../hooks/index.js'
import Reveal from '../../components/ui/Reveal.jsx'
import { profile, availability, resume } from '../../data/site.js'
import { ProfileButton } from '../../components/NavBar.jsx'

/** Closing call-to-action with a pointer-parallax glow field. */
export default function Cta() {
  const glow = useParallax({ depth: 0.6, max: 70 })
  // The panel leans into a drag instead of only reacting to hover.
  const tilt = useDragTilt({ max: 2.6, lift: 0 })

  return (
    <section className="relative overflow-hidden py-(--spacing-margin)" aria-labelledby="cta-title">
      <div className="shell">
        <Reveal>
          <motion.div
            className="panel isolate overflow-hidden p-8 sm:p-12 lg:p-16"
            style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: 1400 }}
          >
            <div className="bleed-decor" aria-hidden="true">
              <motion.div
                className="absolute -top-40 -right-20 h-[34rem] w-[34rem] rounded-full bg-flame/16 blur-[130px]"
                style={{ x: glow.x, y: glow.y }}
              />
              <motion.div
                className="absolute -bottom-40 -left-20 h-[30rem] w-[30rem] rounded-full bg-plasma/16 blur-[130px]"
                style={{ x: glow.x, y: -glow.y }}
              />
              <div className="grid-field absolute inset-0 opacity-20" />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-[1.5fr_auto]">
              <div>
                <p className="eyebrow">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-lime" />
                  {availability.headline}
                </p>
                <h2 id="cta-title" className="mt-6 font-display text-title font-bold text-balance">
                  Let&apos;s build something{' '}
                  <span className="text-gradient">that holds up in production.</span>
                </h2>
                <p className="mt-6 max-w-prose text-lead font-light text-ink-dim text-pretty">
                  {availability.detail}
                </p>
                <p className="mt-4 font-mono text-mono text-ink-faint">{profile.stackLine}</p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link to="/contact" className="btn btn-primary">
                    Contact me
                    <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_outward</span>
                  </Link>
                  <Link to={resume.fallbackRoute} className="btn btn-ghost">
                    Download resume
                  </Link>
                  <Link to="/projects" className="btn btn-quiet text-label">
                    See the work
                  </Link>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 lg:pr-6">
                <ProfileButton size="lg" />
                <p className="max-w-[14rem] text-center font-mono text-mono text-ink-faint">
                  {profile.name} · {profile.role}
                </p>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
