import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import ProjectStack from '../../components/ProjectStack.jsx'
import { categoryLabel } from '../../data/categories.js'
import { coverFor } from '../../lib/covers.js'

/**
 * Full-bleed case-study hero.
 *
 * Leads with the project's own cover rather than a slice of its architecture
 * diagram, so each case study is recognisable before you read a word. The
 * stack sits directly under the headline and answers "what is this built on"
 * immediately, grouped by layer.
 */
export default function ProjectHero({ project }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const cover = coverFor(project)

  return (
    <section ref={ref} className="bleed overflow-hidden pt-(--nav-h)" aria-labelledby="project-title">
      {/* Cover art at 0, the legibility scrim above it at 10, copy on top. */}
      <motion.div
        className="absolute inset-0"
        style={{ y: imgY, scale: imgScale, zIndex: 0 }}
        aria-hidden="true"
      >
        <img src={cover} alt="" className="h-full w-full object-cover" decoding="async" fetchPriority="high" />
      </motion.div>

      <div className="bleed-decor" style={{ zIndex: 10 }} aria-hidden="true">
        <div className="grid-field absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-void via-void/80 to-void/45" />
        <div className="vignette" />
      </div>

      <div className="shell relative z-20 flex min-h-[82svh] flex-col justify-end pt-20 pb-16">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="max-w-4xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 font-mono text-label tracking-[0.18em] text-ink-faint uppercase"
          >
            <Link to="/projects" className="transition-colors hover:text-flame">Projects</Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/projects?category=${project.category[0]}`}
              className="transition-colors hover:text-flame"
            >
              {categoryLabel(project.category[0])}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-flame">{project.index}</span>
          </nav>

          <h1 id="project-title" className="font-display text-title font-extrabold text-balance sm:text-6xl">
            {project.title}
          </h1>
          <p className="mt-4 font-display text-lg font-light text-ink-dim sm:text-2xl">{project.subtitle}</p>
          <p className="mt-7 max-w-2xl text-lead font-light text-ink-dim text-pretty">{project.tagline}</p>

          {/* What it's built on — badges, grouped by layer. */}
          <div className="mt-10">
            <ProjectStack project={project} size="sm" className="max-w-3xl" />
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li key={tag} className="chip">{tag}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
