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
  /** Decisions and what each one cost. See the note in migratron.js. */
  decisions: [
    {
      title: 'Availability as data, not derived from existing bookings',
      choice: 'Trainers maintain their availability as a first-class record; bookable slots are read from it.',
      because:
        'Deriving availability from the bookings that exist means the two can disagree — a trainer whose recurring hours changed still looks like their old schedule. Availability is something the trainer actually owns and edits.',
      cost:
        'A second source of truth that has to be kept consistent with what has already been booked, and a reconciliation concern that a derived approach would not have had.',
    },
    {
      title: 'The slot is validated inside the booking transaction',
      choice: 'Availability is checked and the booking written in the same transaction.',
      because:
        'Two members can reach for the same slot at the same moment, and a check that happens before the write is a check that can be passed twice. This is the one place the database has to be load-bearing for correctness rather than merely for storage.',
      cost:
        'A wider failure path, since a rejected booking rolls back everything it held. It also means the happy path is slower, because the row is not free until the lock clears.',
    },
    {
      title: 'Package balance decremented in the same transaction as the booking',
      choice: 'The session is consumed by the same write that creates the booking.',
      because:
        'A booking and its cost are one fact, not two. If they can be written separately, a member can end up with a confirmed session that was never deducted from their package.',
      cost:
        'No partial success. There is no state in which the slot is held but the balance is not yet spent, which is correct but leaves nothing to fall back on if a booking needs unwinding by hand.',
    },
    {
      title: 'Cancellation is a state, not a deletion',
      choice: 'A cancelled booking keeps its record and is distinguished from never having been booked.',
      because:
        'A cancelled session still consumed a slot and is still part of the trainer\'s history. Deleting it loses the difference between "this was cancelled" and "this never existed", which are different facts for reporting and for the trainer.',
      cost:
        'Every read has to decide what a cancelled booking means, and that decision has to be made deliberately rather than defaulted.',
    },
  ],
  boundaries: [
    'No waitlist and no automatic rebooking. A cancelled slot becomes available and nothing fills it on the member\'s behalf.',
    'No recurring session subscriptions. Packages are bought as a balance of sessions, not as a recurring commitment.',
    'No two-way calendar sync. Availability is entered here rather than reconciled against an external calendar.',
  ],
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
