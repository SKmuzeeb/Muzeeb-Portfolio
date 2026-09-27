import { Link } from 'react-router-dom'
import { profile } from '../../data/site.js'

/**
 * Primary contact action.
 *
 * Renders a real `mailto:` only when an address is configured; otherwise it
 * routes to the contact form, so the CTA is never a dead link.
 */
export default function ContactButton({
  to = '/contact',
  children = 'Email me',
  className = 'btn btn-primary',
  icon = 'mail',
  ...rest
}) {
  const label = (
    <>
      {children}
      {icon && (
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  )

  if (profile.email) {
    return (
      <a
        href={`mailto:${profile.email}`}
        className={className}
        aria-label={`Email ${profile.name} at ${profile.email}`}
        {...rest}
      >
        {label}
      </a>
    )
  }

  return (
    <Link to={to} className={className} {...rest}>
      {label}
    </Link>
  )
}
