import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading.jsx'
import HeroObject from '../components/HeroObject.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import Cta from './home/Cta.jsx'
import { projectsByCategory, projects } from '../data/projects/index.js'
import { categories, categoryMap } from '../data/categories.js'

const VALID = new Set(categories.map((c) => c.key))

export default function Projects() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('category') || 'all'
  const active = VALID.has(raw) ? raw : 'all'

  const list = useMemo(() => projectsByCategory(active), [active])
  const meta = categoryMap[active]

  const setCategory = (key) => {
    if (key === 'all') params.delete('category')
    else params.set('category', key)
    setParams(params, { replace: true })
  }

  return (
    <>
      <section className="relative border-b border-line pt-(--nav-h)">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="grid-field absolute inset-0 opacity-30" />
          <div className="absolute -top-32 left-1/3 h-[30rem] w-[30rem] rounded-full bg-flame/10 blur-[140px]" />
        </div>

        <div className="shell py-(--spacing-margin)">
          <HeroObject variant="bars" />
          <SectionHeading
            kicker={`${projects.length} systems · ${categories.length - 1} disciplines`}
            title="Selected work — systems I"
            accent="have contributed to."
            lede="Filter by discipline. Every entry opens into a full case study with architecture, API surface, data flow and implementation notes."
          />

          <div className="mt-12">
            <CategoryFilter active={active} onChange={setCategory} />
          </div>

          <p className="mt-8 flex items-baseline gap-3 font-mono text-mono text-ink-faint">
            <span className="text-flame">{String(list.length).padStart(2, '0')}</span>
            <span>{meta.blurb}</span>
          </p>
        </div>
      </section>

      <section className="shell py-(--spacing-margin)">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {list.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} eager={i < 3} />
            ))}
          </motion.div>
        </AnimatePresence>

        {list.length === 0 && (
          <Reveal>
            <p className="py-20 text-center text-ink-mute">No systems in this category yet.</p>
          </Reveal>
        )}
      </section>

      <Cta />
    </>
  )
}
