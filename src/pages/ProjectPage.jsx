import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ProjectHero from './project/ProjectHero.jsx'
import ProjectMeta from './project/ProjectMeta.jsx'
import ProjectOverview from './project/ProjectOverview.jsx'
import ProjectBody from './project/ProjectBody.jsx'
import NextUp from './project/NextUp.jsx'
import SystemWalkthrough from '../components/SystemWalkthrough.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { getProject, projectDiagrams, siblings, relatedProjects } from '../data/projects/index.js'
import { profile } from '../data/site.js'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)

  const diagrams = useMemo(() => (project ? projectDiagrams(project) : null), [project])

  useEffect(() => {
    if (project) document.title = `${project.title} — ${profile.name}`
    return () => { document.title = `${profile.name} | ${profile.role}` }
  }, [project])

  if (!project) return <Navigate to="/projects" replace />

  const { prev, next } = siblings(project.slug)
  const related = relatedProjects(project.slug, 3)

  return (
    <article>
      <ProjectHero project={project} />

      <div className="shell pt-(--spacing-margin)">
        <ProjectMeta project={project} />
      </div>

      <ProjectOverview project={project} />
      <ProjectBody project={project} diagrams={diagrams} />

      <section className="py-(--spacing-margin)">
        <div className="shell">
          <SectionHeading
            index="06"
            kicker="System walkthrough"
            title="Follow a request"
            accent="through the system."
            lede="Step through the layers a request passes through, as they are actually arranged in this system."
          />
          <div className="mt-12">
            <SystemWalkthrough project={project} diagrams={diagrams} layers={diagrams.architecture.layers} />
          </div>

          {project.hasBreakdown && (
            <Reveal>
              <div className="panel mt-6 flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
                <div className="min-w-0">
                  <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">
                    Architecture / technical breakdown
                  </h3>
                  <p className="mt-2 max-w-prose text-sm text-ink-mute text-pretty">
                    A written breakdown of the decisions behind this system lives in the sections above.
                    Diagrams are generated from the project record, so they cannot drift from the write-up.
                  </p>
                </div>
                <Link to="/case-studies" className="btn btn-ghost shrink-0">
                  All case studies
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <NextUp prev={prev} next={next} />

      {related.length > 0 && (
        <section className="shell py-(--spacing-margin)">
          <SectionHeading kicker="Keep looking" title="Related" accent="systems." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item, i) => (
              <ProjectCard key={item.slug} project={item} index={i} />
            ))}
          </div>
          <div className="mt-10">
            <Link to="/projects" className="btn btn-ghost">
              All work
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>
      )}
    </article>
  )
}
