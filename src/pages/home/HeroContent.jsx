import { Link } from 'react-router-dom'
import { ProfileButton } from '../../components/NavBar.jsx'
import ContactButton from '../../components/ui/ContactButton.jsx'
import Reveal from '../../components/ui/Reveal.jsx'
import { profile, resume } from '../../data/site.js'
import { projects } from '../../data/projects/index.js'
import { categories } from '../../data/categories.js'
import { experience } from '../../data/about.js'

/** Hero copy block. Split out so the parallax wrapper stays readable. */
export default function HeroContent() {
  const [firstName, ...restName] = profile.name.split(' ')
  const stats = [
    { k: 'Systems shipped', v: String(projects.length).padStart(2, '0') },
    { k: 'Employers', v: String(experience.length).padStart(2, '0') },
    { k: 'Disciplines', v: String(categories.length - 1).padStart(2, '0') },
    { k: 'Core stack', v: 'React · Node' },
  ]

  return (
    <>
      <Reveal>
        <p className="eyebrow">
          <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-lime" />
          {profile.role} · {profile.location}
        </p>
      </Reveal>

      <h1 id="hero-title" className="mt-7 font-display text-hero font-extrabold">
        <Reveal y={40} delay={0.05}>
          <span className="block">{firstName}</span>
        </Reveal>
        <Reveal y={40} delay={0.14}>
          <span className="block text-gradient">{restName.join(' ')}</span>
        </Reveal>
      </h1>

      <Reveal delay={0.22}>
        <p className="mt-6 font-mono text-label tracking-[0.2em] text-flame uppercase sm:text-sm">
          {profile.role}
        </p>
      </Reveal>

      <Reveal delay={0.28}>
        <p className="mt-6 max-w-xl text-lead font-light text-ink text-pretty">
          {profile.tagline}
        </p>
      </Reveal>

      <Reveal delay={0.34}>
        <p className="mt-4 font-mono text-mono text-ink-mute">{profile.stackLine}</p>
      </Reveal>

      <Reveal delay={0.42}>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link to="/projects" className="btn btn-primary">
            View my work
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_outward</span>
          </Link>
          <Link to={resume.fallbackRoute} className="btn btn-ghost">
            Download resume
            <span className="material-symbols-outlined text-base" aria-hidden="true">download</span>
          </Link>
          <ContactButton className="btn btn-quiet text-label" icon="arrow_forward">
            Let&apos;s connect
          </ContactButton>
          <ProfileButton size="lg" className="sm:hidden" />
        </div>
      </Reveal>

      <Reveal delay={0.5}>
        <dl className="mt-14 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
          {stats.map((item) => (
            <div key={item.k}>
              <dt className="font-mono text-label tracking-[0.18em] text-ink-faint uppercase">{item.k}</dt>
              <dd className="mt-2 font-display text-lg font-bold tracking-tight">{item.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </>
  )
}
