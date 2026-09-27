import { useCallback, useMemo, useState } from 'react'
import { render } from '../../lib/diagram.js'
import Reveal from '../../components/ui/Reveal.jsx'
import Lightbox from '../../components/Lightbox.jsx'
import DiagramImage from '../../components/ui/DiagramImage.jsx'
import Parallax from '../../components/ui/Parallax.jsx'

/** Section wrapper with a numbered kicker. */
function Section({ index, kicker, title, accent, lede, children, className = '' }) {
  return (
    <section className={`py-(--spacing-margin) ${className}`}>
      <div className="shell">
        <Reveal>
          <p className="eyebrow">
            <span className="text-flame">{index}</span>
            <span className="text-ink-faint">/</span>
            {kicker}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display text-section font-bold text-balance">
            {title} {accent && <span className="text-gradient">{accent}</span>}
          </h2>
        </Reveal>
        {lede && (
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-prose text-lead font-light text-ink-dim text-pretty">{lede}</p>
          </Reveal>
        )}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}

/** Clickable frame that opens the lightbox. */
function Frame({ item, index, onOpen, ratio = '16 / 10' }) {
  return (
    <Reveal y={26} delay={(index % 2) * 0.07} amount={0.1}>
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="group lift panel block w-full overflow-hidden text-left"
        aria-label={`Open ${item.caption} fullscreen`}
      >
        <div className="image-zoom relative">
          <DiagramImage config={item.config} alt={item.alt} ratio={ratio} />
          <span className="pointer-events-none absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-void/70 text-ink-dim opacity-0 backdrop-blur-sm transition-all duration-400 group-hover:border-flame group-hover:text-flame group-hover:opacity-100">
            <span className="material-symbols-outlined text-base" aria-hidden="true">open_in_full</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="truncate font-mono text-mono text-ink-dim">{item.caption}</span>
          <span className="shrink-0 font-mono text-label tracking-[0.16em] text-ink-faint uppercase">
            {item.tag}
          </span>
        </div>
      </button>
    </Reveal>
  )
}

/**
 * Case-study body. Every section is a diagram derived from the project's own
 * data — no placeholder or fabricated screenshots.
 */
export default function ProjectBody({ project, diagrams }) {
  const [lightbox, setLightbox] = useState(null)

  const toItem = useCallback(
    (config, caption, tag) => ({
      config,
      caption,
      tag,
      alt: `${project.title} — ${caption}`,
      src: render(config),
    }),
    [project.title],
  )

  const design = useMemo(
    () => [
      toItem(diagrams.architecture, 'Architecture', 'System'),
      toItem(diagrams.api, 'API surface', 'Backend'),
      toItem(diagrams.data, 'Data flow', 'Database'),
    ],
    [diagrams, toItem],
  )

  const build = useMemo(
    () => [
      toItem(diagrams.implementation, 'Implementation', 'Code'),
      toItem(diagrams.integration, 'Integrations', 'Boundary'),
      toItem(diagrams.flow, 'System flow', 'Sequence'),
    ],
    [diagrams, toItem],
  )

  const modules = useMemo(() => toItem(diagrams.modules, 'Application modules', 'Map'), [diagrams, toItem])
  const process = useMemo(() => toItem(diagrams.process, 'Development process', 'Phases'), [diagrams, toItem])
  const gallery = useMemo(() => [...design, ...build, modules, process], [design, build, modules, process])

  return (
    <>
      <Section
        index="01"
        kicker="Problem & requirements"
        title="What the system"
        accent="had to do."
        lede={project.purpose}
      >
        <Parallax distance={-28} shift={-40}>
          <Reveal>
            <DiagramImage config={diagrams.problem} alt={`${project.title} — requirements and scope`} ratio="16 / 9" />
          </Reveal>
        </Parallax>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Problem', body: project.challenge, icon: 'report_problem' },
            { label: 'Approach', body: project.approach, icon: 'route' },
          ].map((block, i) => (
            <Reveal key={block.label} delay={i * 0.08}>
              <div className="panel h-full p-6">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-flame" aria-hidden="true">
                    {block.icon}
                  </span>
                  <h3 className="font-mono text-label tracking-[0.2em] text-ink uppercase">{block.label}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-dim text-pretty">{block.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        index="02"
        kicker="Architecture, API & data design"
        title="How it is"
        accent="put together."
        lede="Request path, the resource surface the API exposes, and how entities map onto backend modules. Click any diagram to open it fullscreen."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {design.map((item, i) => (
            <Frame key={item.caption} item={item} index={i} onOpen={(n) => setLightbox(n)} />
          ))}
        </div>
      </Section>

      <Section
        index="03"
        kicker="Implementation"
        title="From design to"
        accent="working code."
        lede="Separation of concerns across the backend, the external boundaries, and the order operations actually run in."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {build.map((item, i) => (
            <Frame key={item.caption} item={item} index={i} onOpen={(n) => setLightbox(design.length + n)} />
          ))}
        </div>
      </Section>

      <Section
        index="04"
        kicker="Application modules"
        title="What the application"
        accent="is made of."
        lede="The functional areas of the system. No screenshots are published here — this is the honest view of what exists."
      >
        <Frame item={modules} index={0} onOpen={() => setLightbox(gallery.indexOf(modules))} ratio="16 / 9" />
      </Section>

      <Section
        index="05"
        kicker="Development process"
        title="How the work was"
        accent="approached."
        lede="The same six phases across every project, whether the work was a small fix or a long-lived platform."
      >
        <Frame item={process} index={0} onOpen={() => setLightbox(gallery.indexOf(process))} ratio="16 / 9" />
      </Section>

      <Lightbox items={gallery} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />
    </>
  )
}

