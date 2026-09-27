import { useState } from 'react'
import SentNotice from './SentNotice.jsx'
import { profile, contact } from '../../data/site.js'
import { categories } from '../../data/categories.js'

const BUDGETS = ['Under €2k', '€2k – €6k', '€6k – €15k', '€15k +', 'Not sure yet']
const TIMELINES = ['ASAP', 'Within a month', '2–3 months', 'Just exploring']

const FIELD =
  'w-full rounded-lg border border-line bg-panel-2 px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-flame focus:outline-none'

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block font-mono text-label tracking-[0.18em] text-ink-mute uppercase">
      {children}
    </label>
  )
}

/**
 * Enquiry form.
 *
 * With an address configured this composes a mailto and hands it to the
 * visitor's mail client. Without one, it shows the composed brief with a copy
 * button rather than navigating nowhere.
 */
export default function EnquiryForm() {
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    focus: 'full-stack',
    budget: BUDGETS[1],
    timeline: TIMELINES[2],
    message: '',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const brief = () => {
    const focus = categories.find((c) => c.key === form.focus)?.label || form.focus
    return [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Company: ${form.company || '—'}`,
      `Focus: ${focus}`,
      `Budget: ${form.budget}`,
      `Timeline: ${form.timeline}`,
      '',
      form.message,
    ].join('\n')
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (profile.email) {
      const focus = categories.find((c) => c.key === form.focus)?.label || form.focus
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
        `Project enquiry — ${focus}`,
      )}&body=${encodeURIComponent(brief())}`
      setSent(true)
      return
    }
    setSent(true)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief())
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  if (sent) return <SentNotice copied={copied} onCopy={copy} onReset={() => setSent(false)} />

  return (
    <form onSubmit={onSubmit} className="panel p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <input id="name" required value={form.name} onChange={update('name')} className={FIELD} placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" required value={form.email} onChange={update('email')} className={FIELD} placeholder="you@company.com" />
        </div>
        <div>
          <Label htmlFor="company">Company (optional)</Label>
          <input id="company" value={form.company} onChange={update('company')} className={FIELD} placeholder="Company or team" />
        </div>
        <div>
          <Label htmlFor="focus">What do you need?</Label>
          <select id="focus" value={form.focus} onChange={update('focus')} className={FIELD}>
            {categories
              .filter((c) => c.key !== 'all')
              .map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            <option value="other">Something else</option>
          </select>
        </div>
        <div>
          <Label htmlFor="budget">Budget</Label>
          <select id="budget" value={form.budget} onChange={update('budget')} className={FIELD}>
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="timeline">Timeline</Label>
          <select id="timeline" value={form.timeline} onChange={update('timeline')} className={FIELD}>
            {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <Label htmlFor="message">Tell me about the project</Label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={update('message')}
          className={`${FIELD} resize-y`}
          placeholder="Scope, deliverables, deadline, and any constraints worth knowing about up front."
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary">
          {profile.email ? 'Send enquiry' : 'Review enquiry'}
          <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
        </button>
        <p className="font-mono text-mono text-ink-faint">{contact.availability}</p>
      </div>
    </form>
  )
}
