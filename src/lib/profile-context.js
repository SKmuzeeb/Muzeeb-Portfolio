import { createContext, useContext } from 'react'

/**
 * Context for the quick-profile modal.
 *
 * Kept in its own module so the provider file only exports a component, which
 * is what React Fast Refresh needs.
 */
export const ProfileModalContext = createContext(null)

/** Any component can open the profile sheet: `const { open } = useProfileModal()`. */
export function useProfileModal() {
  const ctx = useContext(ProfileModalContext)
  if (!ctx) throw new Error('useProfileModal must be used inside <ProfileModalProvider>')
  return ctx
}
