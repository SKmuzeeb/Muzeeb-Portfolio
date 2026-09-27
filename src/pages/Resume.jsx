import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/ui/Reveal.jsx'
import ContactButton from '../components/ui/ContactButton.jsx'
import { ExperienceBlock, SkillsBlock, ProjectsBlock } from './resume/Sections.jsx'
import { profile, resume, socials, contact } from '../data/site.js'

/**
 * Readable, printable resume.
 *
 * This is the honest fallback for "Download resume": every line is generated
 * from the same data as the rest of the site, so it cannot claim anything the
 * site does not. Printing produces a clean A4 document. Dropping a PDF into
 * /public and setting `resume.file` switches the button to a direct download.
 */
export default function Resume() {
  useEffect(() => {
    document.title = `Resume — ${profile.name}`
    return () => { document.title = `${profile.name} | ${profile.role}` }
  }, [])

  return (
    <>
      <section className="relative border-b border-line pt-(--nav-h)">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="grid-field absolute inset-0 opacity-30" />
        </div>

        <div className="shell py-(--spacing-margin)">
          <Reveal>
            <p className="eyebrow">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-lime" />
              Resume
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 max-w-3xl font-display text-title font-extrabold text-balance">
              Want the <span className="text-gradient">complete picture?</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-prose text-lead font-light text-ink-dim text-pretty">
              Download my resume for a detailed overview of my experience, technical skills and projects.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-9 flex flex-wrap gap-4 print:hidden">
              {resume.file ? (
                <a href={resume.file} download className="btn btn-primary">
                  Download PDF
                  <span className="material-symbols-outlined text-base" aria-hidden="true">download</span>
                </a>
              ) : (
                <button type="button" onClick={() => window.print()} className="btn btn-primary">
                  Save as PDF
                  <span className="material-symbols-outlined text-base" aria-hidden="true">print</span>
                </button>
              )}
              <Link to="/contact" className="btn btn-ghost">
                Contact me
              </Link>
            </div>
          </Reveal>

          {!resume.file && (
            <Reveal delay={0.26}>
              <p className="mt-5 max-w-prose font-mono text-mono text-ink-faint print:hidden">
                A PDF can be attached by dropping the file into /public and setting
                {' '}<code className="text-flame">resume.file</code> in the site configuration. Until then this
                page prints to a clean A4 document.
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* The document itself */}
      <article className="shell py-(--spacing-margin)">
        <div className="mx-auto max-w-3xl space-y-12">
          <header className="border-b border-line pb-8">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">{profile.name}</h2>
            <p className="mt-2 font-mono text-mono text-flame">{profile.role}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim text-pretty">{profile.summary}</p>
            <p className="mt-4 font-mono text-mono text-ink-faint">
              {profile.stackLine} · {profile.location}
            </p>
            {profile.email && <p className="mt-1 font-mono text-mono text-ink-faint">{profile.email}</p>}
          </header>

          <ExperienceBlock />
          <SkillsBlock />
          <ProjectsBlock />

          <footer className="border-t border-line pt-8">
            <h2 className="font-mono text-label tracking-[0.22em] text-flame uppercase">Contact</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim text-pretty">{contact.note}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 print:hidden">
              <ContactButton>Get in touch</ContactButton>
              {socials.filter((s) => s.href).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline text-sm text-ink-dim"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </article>
    </>
  )
}
