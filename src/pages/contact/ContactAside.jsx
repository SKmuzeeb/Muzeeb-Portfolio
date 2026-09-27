import { Link } from 'react-router-dom'
import Reveal from '../../components/ui/Reveal.jsx'
import ContactButton from '../../components/ui/ContactButton.jsx'
import { profile, socials, contact, resume } from '../../data/site.js'

const SOCIAL_ICONS = {
  linkedin: 'work',
  github: 'code',
  x: 'close',
  instagram: 'photo_camera',
  discord: 'forum',
}

/** Email, availability, resume and profile links. */
export default function ContactAside() {
  return (
    <div className="space-y-5">
      <Reveal delay={0.08}>
        <div className="panel p-6">
          <h2 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Let&apos;s build something</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim text-pretty">
            Have a project, opportunity or technical challenge in mind?
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ContactButton>Email me</ContactButton>
            {socials
              .filter((s) => s.href)
              .map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-ghost"
                >
                  {s.label}
                </a>
              ))}
          </div>
          {!profile.email && (
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
              No address is configured yet — the form on the left composes a message you can copy, and
              adding one in the site configuration turns every button on this site into a direct mailto.
            </p>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="panel p-6">
          <h2 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Availability</h2>
          <div className="mt-4 space-y-3">
            {[
              { k: 'Status', v: contact.availability },
              { k: 'Location', v: profile.location },
              { k: 'Timelines', v: contact.leadTime },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0"
              >
                <span className="font-mono text-label tracking-[0.16em] text-ink-faint uppercase">{row.k}</span>
                <span className="text-right text-sm text-ink-dim">{row.v}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ink-mute text-pretty">{contact.note}</p>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <Link to={resume.fallbackRoute} className="group lift panel flex items-center gap-4 p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-line bg-panel-2 text-flame transition-colors group-hover:border-flame/40">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">description</span>
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-semibold tracking-tight">
              Want the complete picture?
            </span>
            <span className="mt-1 block text-sm text-ink-mute">{resume.note}</span>
            <span className="mt-1.5 block font-mono text-label tracking-[0.16em] text-ink-faint uppercase">
              Open resume
            </span>
          </span>
        </Link>
      </Reveal>

      <Reveal delay={0.26}>
        <div className="panel p-6">
          <h2 className="font-mono text-label tracking-[0.2em] text-ink uppercase">Profiles</h2>
          <ul className="mt-4 space-y-1">
            {socials.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/3"
                  >
                    <span className="material-symbols-outlined text-base text-ink-faint transition-colors group-hover:text-flame" aria-hidden="true">
                      {SOCIAL_ICONS[s.icon] || 'link'}
                    </span>
                    <span className="flex-1 text-sm text-ink-dim transition-colors group-hover:text-ink">
                      {s.label}
                    </span>
                    <span className="font-mono text-label tracking-[0.12em] text-ink-faint">{s.handle}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-2.5">
                    <span className="material-symbols-outlined text-base text-ink-faint" aria-hidden="true">
                      {SOCIAL_ICONS[s.icon] || 'link'}
                    </span>
                    <span className="flex-1 text-sm text-ink-mute">{s.label}</span>
                    <span className="font-mono text-label tracking-[0.12em] text-ink-faint">
                      {s.handle}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  )
}

