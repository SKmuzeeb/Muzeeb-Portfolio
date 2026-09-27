export const personalTraining = {
  slug: 'personal-training',
  title: 'Personal Training Platform',
  subtitle: 'Trainers, availability and bookings',
  category: ['full-stack', 'backend', 'saas'],
  kind: 'Full Stack',
  format: 'Trainer profiles, availability, packages, bookings and sessions',
  tagline:
    'Features supporting trainers, trainer availability, personal training packages, bookings and member training workflows.',
  overview: [
    'Personal training is a scheduling problem with a commercial edge. A member buys a package of sessions, a trainer has their own availability, and the two have to be reconciled into bookable slots without either side double-booking.',
    'The feature set covers trainer profiles, availability, packages and bundles, bookings, sessions, ratings and the trainer schedule â€” with the scheduling rules enforced on the backend so two simultaneous bookings cannot be created.',
  ],
  purpose:
    'Let members book training against a package while keeping trainer availability, session counts and double-booking consistent.',
  challenge:
    'Availability, package balances and bookings are three things that can contradict each other. A slot has to be checked and held as part of the same operation that creates the booking.',
  approach:
    'Model availability as data, and validate the slot at booking time inside the transaction that writes the booking. Package balance is decremented from the same place, so a booking and its cost cannot diverge.',
  areas: [
    'Trainer Profiles',
    'Trainer Availability',
    'Packages / Bundles',
    'Bookings',
    'Sessions',
    'Ratings',
    'Trainer Schedule',
  ],
  modules: [
    { tag: 'TRAINERS', label: 'Trainer domain', items: ['Profile', 'Specialties', 'Availability', 'Schedule'] },
    { tag: 'COMMERCIAL', label: 'Packages', items: ['Bundles', 'Session balance', 'Pricing rules', 'Purchase'] },
    { tag: 'BOOKING', label: 'Scheduling', items: ['Slot search', 'Booking', 'Cancellation', 'Reschedule'] },
    { tag: 'HISTORY', label: 'Sessions', items: ['Completed', 'Attended', 'No-show', 'Ratings'] },
  ],
  roles: ['Full Stack Development', 'Backend Development', 'Database Design'],
  tech: ['react', 'node', 'postgres', 'rest'],
  tags: ['Full Stack', 'Scheduling', 'PostgreSQL', 'REST'],
  // Drop a real screenshot at public/media/personal-training.png and point this at it
  // ('/media/personal-training.png') to replace the generated cover.
  cover: null,
  visual: { schema: 'modules', accent: 'lime' },
  hasBreakdown: true,
  links: { demo: null, source: null },
}
