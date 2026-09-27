import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DiagramImage from '../components/ui/DiagramImage.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { projects } from '../data/projects/index.js'
import { projectDiagrams } from '../data/projects/index.js'
import { profile } from '../data/site.js'

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden pt-(--nav-h)">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div className="grid-field absolute inset-0 opacity-25" />
        <div className="absolute top-1/4 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-flame/10 blur-[150px]" />
        <div className="vignette" />
      </div>

      <div className="shell w-full py-20 text-center">
        <motion.div
          className="mx-auto w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <DiagramImage
            config={{
              ...projectDiagrams(projects[0]).hero,
              seed: 'route-404',
              title: 'Route not found',
              tag: 'ERROR 404',
              sub: 'The requested path returned no handler',
            }}
            alt=""
            ratio="16 / 9"
            eager
          />
        </motion.div>

        <p className="mt-10 font-mono text-label tracking-[0.3em] text-flame uppercase">Error 404</p>
        <h1 className="mt-5 font-display text-hero font-extrabold text-balance">
          This route returns <span className="outline-text">nothing.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lead font-light text-ink-dim text-pretty">
          No handler is registered for this path. It may have been renamed, or it may never have
          existed.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link to="/projects" className="btn btn-ghost">
            Browse the work
          </Link>
          <Link to="/contact" className="btn btn-quiet text-label">
            Contact {profile.shortName}
          </Link>
        </div>
      </div>

      <section className="shell w-full pb-(--spacing-margin)">
        <div className="hairline mb-(--spacing-margin)" />
        <SectionHeading align="center" kicker="Meanwhile" title="Try one of" accent="these." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </section>
    </section>
  )
}
