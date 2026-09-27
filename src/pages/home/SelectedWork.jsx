import { Link } from 'react-router-dom'
import SectionHeading from '../../components/SectionHeading.jsx'
import ProjectCard from '../../components/ProjectCard.jsx'
import Reveal from '../../components/ui/Reveal.jsx'
import { TechMark } from '../../components/ui/TechIcon.jsx'
import { projects } from '../../data/projects/index.js'
import { categories, TECH } from '../../data/categories.js'

/**
 * Real vendor marks for each discipline.
 *
 * A discipline tile previously used a faint architecture diagram as its
 * background, which said nothing about what the discipline *is*. These are the
 * actual technologies that define it, at full brand colour, so the row reads
 * at a glance: React + Node for full stack, the AWS mark for cloud, Stripe
 * for payments, and so on.
 *
 * Keep these to two per tile — three badges stop reading as an identity and
 * start reading as a list.
 */
const DISCIPLINE_LOGOS = {
  'full-stack': ['react', 'node'],
  backend: ['node', 'postgres'],
  'aws-cloud': ['aws', 'lambda'],
  'api-integrations': ['graph', 'google'],
  payments: ['stripe', 'postgres'],
  saas: ['react', 'aws'],
}

/** Category tiles — each opens the Projects page pre-filtered. */
function CategoryTiles() {
  return (
    <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories
        .filter((c) => c.key !== 'all')
        .map((cat, i) => {
          const sample = projects.find((p) => p.category.includes(cat.key))
          const keys = DISCIPLINE_LOGOS[cat.key] || []
          return (
            <Reveal key={cat.key} y={26} delay={i * 0.05}>
              <Link
                to={`/projects?category=${cat.key}`}
                className="group lift panel relative flex h-full flex-col p-(--spacing-card)"
              >
                <div className="relative">
                  {/* Real vendor marks for the discipline, with a fallback to
                      the category icon for groups with no single brand. */}
                  {keys.length > 0 ? (
                    <div className="flex items-center gap-2.5">
                      {keys.map((key) => (
                        <TechMark key={key} name={key} size="lg" />
                      ))}
                      <span className="sr-only">{keys.map((k) => TECH[k]?.label).filter(Boolean).join(', ')}</span>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-flame" aria-hidden="true">
                      {cat.icon}
                    </span>
                  )}

                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight transition-colors group-hover:text-flame">
                    {cat.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mute text-pretty">{cat.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-mono text-label tracking-[0.18em] text-ink-faint uppercase transition-colors group-hover:text-flame">
                    Browse
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                  </span>
                </div>
                <span className="sr-only">{sample ? sample.title : ''}</span>
              </Link>
            </Reveal>
          )
        })}
    </div>
  )
}

export default function SelectedWork() {
  return (
    <section id="selected" className="relative scroll-mt-24 py-(--spacing-margin)">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            index="01"
            kicker="Selected work"
            title="Systems, products and"
            accent="engineering work."
            lede="Every entry opens into a full case study — problem, architecture, API surface, data flow, implementation and the modules that make it up."
          />
          <Reveal delay={0.2}>
            <Link to="/projects" className="btn btn-ghost">
              All {projects.length} systems
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} eager={i < 3} />
          ))}
        </div>

        <div className="hairline my-(--spacing-margin)" />

        <Reveal>
          <p className="eyebrow">
            <span className="text-flame">02</span>
            <span className="text-ink-faint">/</span>
            Browse by discipline
          </p>
        </Reveal>
        <CategoryTiles />
      </div>
    </section>
  )
}
