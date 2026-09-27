import Reveal from '../components/ui/Reveal.jsx'
import EnquiryForm from './contact/EnquiryForm.jsx'
import ContactAside from './contact/ContactAside.jsx'
import { contact } from '../data/site.js'

const NOTES = [
  {
    icon: 'description',
    title: 'Send the brief',
    body: 'Scope, deliverables and deadline. Links to existing code or a product page beat adjectives.',
  },
  {
    icon: 'payments',
    title: 'Be honest about scope',
    body: 'If something is out of scope or would cost more than it is worth, I will say so before starting rather than after.',
  },
  {
    icon: 'forum',
    title: 'Not a fit? Say so',
    body: 'I would rather decline than spend six weeks on the wrong brief. Referrals are always welcome.',
  },
]

export default function Contact() {
  return (
    <>
      <section className="relative border-b border-line pt-(--nav-h)">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="grid-field absolute inset-0 opacity-30" />
          <div className="absolute -top-20 left-1/4 h-[30rem] w-[30rem] rounded-full bg-flame/12 blur-[150px]" />
        </div>

        <div className="shell py-(--spacing-margin)">
          <Reveal>
            <p className="eyebrow">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-lime" />
              {contact.availability}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 max-w-4xl font-display text-title font-extrabold text-balance">
              Let&apos;s build something <span className="text-gradient">worth maintaining.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-prose text-lead font-light text-ink-dim text-pretty">
              Have a project, opportunity or technical challenge in mind? Send the details and I will
              come back with questions, a rough approach, and an honest view on fit.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell py-(--spacing-margin)">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <EnquiryForm />
          </Reveal>
          <ContactAside />
        </div>
      </section>

      <section className="pb-(--spacing-margin)">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">
              <span className="text-flame">✦</span>
              <span className="text-ink-faint">/</span>
              Before you write
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {NOTES.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="panel h-full p-6">
                  <span className="material-symbols-outlined text-2xl text-flame" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h2 className="mt-4 font-display text-base font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mute text-pretty">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
