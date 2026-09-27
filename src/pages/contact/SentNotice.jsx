import { profile } from '../../data/site.js'

/**
 * Post-submit state. When no address is configured the visitor gets the
 * composed brief with a copy button, so the form is never a dead end.
 */
export default function SentNotice({ copied, onCopy, onReset }) {
  return (
    <div className="panel grid min-h-[28rem] place-items-center p-8 text-center sm:p-10">
      <div className="max-w-md">
        <span className="material-symbols-outlined text-5xl text-lime" aria-hidden="true">
          {profile.email ? 'mark_email_read' : 'content_copy'}
        </span>
        <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">
          {profile.email ? 'Your email client is open' : 'Enquiry ready to send'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim text-pretty">
          {profile.email
            ? 'The enquiry is pre-filled — just hit send.'
            : 'Copy your enquiry below and send it however you like. An email address can be added in the site configuration at any time.'}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {!profile.email && (
            <button type="button" onClick={onCopy} className="btn btn-primary">
              {copied ? 'Copied' : 'Copy enquiry'}
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          )}
          <button type="button" onClick={onReset} className="btn btn-ghost">
            Edit the enquiry
          </button>
        </div>
      </div>
    </div>
  )
}
