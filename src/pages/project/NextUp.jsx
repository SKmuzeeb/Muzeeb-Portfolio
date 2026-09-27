import { Link } from 'react-router-dom'
import DiagramImage from '../../components/ui/DiagramImage.jsx'
import Reveal from '../../components/ui/Reveal.jsx'
import { projectDiagrams } from '../../data/projects/index.js'

/** Previous / next project navigation, rendered as two large panels. */
export default function NextUp({ prev, next }) {
  if (!prev || !next) return null

  const panels = [
    { project: prev, dir: 'Previous', align: 'items-start text-left' },
    { project: next, dir: 'Next', align: 'items-end text-right' },
  ]

  return (
    <section className="border-y border-line" aria-label="Project navigation">
      <div className="shell grid gap-px sm:grid-cols-2">
        {panels.map(({ project, dir, align }, i) => (
          <Reveal key={project.slug} delay={i * 0.08}>
            <Link
              to={`/projects/${project.slug}`}
              className={`group flex h-full flex-col gap-5 p-6 transition-colors hover:bg-white/2 sm:p-10 ${align}`}
            >
              <span className="font-mono text-label tracking-[0.2em] text-ink-faint uppercase">{dir}</span>
              <div className="image-zoom w-full overflow-hidden rounded-lg">
                <DiagramImage config={projectDiagrams(project).hero} alt="" ratio="16 / 9" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-flame">
                {project.title}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
