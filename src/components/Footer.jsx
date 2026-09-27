import { Link } from 'react-router-dom'
import { profile, footerNav, socials, availability, liveLinks } from '../data/site.js'
import { TECH } from '../data/categories.js'
import { ProfileButton } from './NavBar.jsx'

const SOCIAL_ICONS = {
  linkedin: 'work',
  github: 'code',
  x: 'close',
  instagram: 'photo_camera',
  discord: 'forum',
  behance: 'grade',
}

const HIGHLIGHT = ['react', 'node', 'lambda', 'postgres', 'graph', 'stripe']

/** Social link, or a neutral label when no real URL has been configured. */
function SocialRow({ social }) {
  const Icon = (
    <span className="material-symbols-outlined text-base text-ink-faint" aria-hidden="true">
      {SOCIAL_ICONS[social.icon] || 'link'}
    </span>
  )

  if (!social.href) {
    return (
      <li className="flex items-center gap-2.5 text-sm text-ink-mute">
        {Icon}
        <span>{social.label}</span>
      </li>
    )
  }

  return (
    <li>
      <a
        href={social.href}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex items-center gap-2.5 text-sm text-ink-dim transition-colors hover:text-ink"
      >
        <span className="transition-colors group-hover:text-flame">{Icon}</span>
        <span className="link-underline">{social.label}</span>
      </a>
    </li>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-(--spacing-margin) border-t border-line bg-void-raised">
      <div className="hairline" />

      <div className="shell py-(--spacing-margin)">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="eyebrow">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime" />
              {availability.headline}
            </p>
            <p className="mt-5 font-display text-2xl leading-snug font-extrabold tracking-tight text-balance">
              {profile.name}
            </p>
            <p className="mt-2 font-mono text-mono text-flame">{profile.role}</p>
            <p className="mt-4 font-mono text-mono text-ink-mute">{profile.stackLine}</p>

            <div className="mt-7 flex flex-wrap gap-1.5">
              {HIGHLIGHT.map((key) => (
                <span
                  key={key}
                  className="rounded-sm border px-2 py-1 font-mono text-label"
                  style={{ color: TECH[key].color, borderColor: `${TECH[key].color}3a`, background: `${TECH[key].color}10` }}
                >
                  {TECH[key].label}
                </span>
              ))}
            </div>

            <div className="mt-7">
              <ProfileButton />
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="font-mono text-label tracking-[0.22em] text-ink-faint uppercase">Navigate</h2>
            <ul className="mt-5 space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="link-underline text-sm text-ink-dim transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-label tracking-[0.22em] text-ink-faint uppercase">Connect</h2>
            <ul className="mt-5 space-y-2.5">
              {socials.map((s) => (
                <SocialRow key={s.label} social={s} />
              ))}
              <li>
                <Link to="/contact" className="group flex items-center gap-2.5 text-sm text-ink-dim transition-colors hover:text-ink">
                  <span className="material-symbols-outlined text-base text-ink-faint transition-colors group-hover:text-flame" aria-hidden="true">
                    mail
                  </span>
                  <span className="link-underline">Email</span>
                </Link>
              </li>
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-ink-mute text-pretty">{profile.location}</p>

            {/* Shipped work that is live and public. */}
            {liveLinks.length > 0 && (
              <div className="mt-8 border-t border-line pt-6">
                <h3 className="font-mono text-label tracking-[0.22em] text-ink-faint uppercase">
                  Live work
                </h3>
                <ul className="mt-4 space-y-3">
                  {liveLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group block"
                      >
                        <span className="flex items-center gap-2 text-sm text-ink-dim transition-colors group-hover:text-ink">
                          <span className="material-symbols-outlined text-base text-ink-faint transition-colors group-hover:text-flame" aria-hidden="true">
                            {link.icon}
                          </span>
                          <span className="link-underline">{link.label}</span>
                          <span
                            className="material-symbols-outlined text-xs text-ink-faint transition-transform duration-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          >
                            open_in_new
                          </span>
                        </span>
                        <span className="mt-1 block pl-6 text-xs leading-relaxed text-ink-mute">
                          {link.note}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-(--spacing-margin) flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-mono text-ink-faint">
            © {year} {profile.name}. All rights reserved.
          </p>
          <p className="font-mono text-mono text-ink-faint">{profile.stackLine}</p>
        </div>
      </div>
    </footer>
  )
}
