export const employee = {
  slug: 'employee-club-management',
  title: 'Employee & Club Management',
  subtitle: 'Access control and operations',
  category: ['backend', 'saas'],
  kind: 'Backend',
  format: 'Employee operations, access control, attendance and time-off',
  tagline:
    'Backend systems supporting employee operations, access control, club management, time-off workflows and attendance functionality.',
  overview: [
    'Staff operations are mostly access-control problems wearing a UI. An employee record, the clubs they can act on, the shifts they worked and the time off they requested are separate data sets that have to agree with each other.',
    'This system handles that agreement: employee records, clock-in and clock-out, time-off requests, and role-based access that is scoped per club rather than applied globally.',
  ],
  purpose:
    'Give club administration one place to manage staff, their access and their attendance, with rules that hold regardless of which club or role the request comes from.',
  challenge:
    'Access rules that are enforced only in the interface are not enforced. Every endpoint has to apply the same club and role checks, and every list has to be filtered by them.',
  approach:
    'Treat role and club as part of the query rather than as a pre-check. Shared query helpers apply the scope consistently, so a new endpoint is scoped by default instead of by remembering to add a filter.',
  /** Decisions and what each one cost. See the note in migratron.js. */
  decisions: [
    {
      title: 'Scope applied as part of the query',
      choice: 'Access is a property of the query, not a gate in front of it.',
      because:
        'Access rules enforced only in the interface are not enforced. Anything that does not come from a screen — a report, an export, a scheduled job — walks straight past a UI check, and the people who write those are not thinking about screens at the time.',
      cost:
        'A shared helper in front of every request, which becomes a bottleneck and a single point of failure. It also means the interesting filtering has to be expressible inside that helper, not bolted on after it.',
    },
    {
      title: 'Club and role resolved once, into a single principal',
      choice: 'The pair is resolved at the edge of the request and carried through the rest of the work.',
      because:
        'Asking "who is this and where can they act" repeatedly, in slightly different ways, is how two endpoints end up disagreeing about the same person. Resolving it once removes the opportunity to phrase the question two ways.',
      cost:
        'The resolution step has to be correct, and everything downstream trusts it. A bug there is a bug everywhere, rather than in one endpoint.',
    },
    {
      title: 'Clock-in and clock-out stored as append-only events',
      choice: 'Attendance is a sequence of events, not a current state that gets overwritten.',
      because:
        'An attendance record gets corrected — a forgotten clock-out, a late arrival someone disputes. If the only record is "currently in", the original entry is gone and there is nothing to argue about.',
      cost:
        '"Is this person in?" becomes a query over recent events rather than a column read, and that query has to be correct because it gates what staff can see and do.',
    },
    {
      title: 'Time off modelled as a request with states',
      choice: 'A request is created, reviewed, and resolved either way; refusals are recorded too.',
      because:
        'A refused request is still a fact about the period — someone asked, someone decided. If refusals are simply not stored, the record shows a gap where an answer should be.',
      cost:
        'More states to test than a boolean, and the states have to behave sensibly when a request is edited after it was already decided.',
    },
  ],
  boundaries: [
    'No payroll. Attendance is recorded and stops there; nothing here calculates or submits pay.',
    'No hardware or badge integration. Clock events come from the application, not from a reader.',
    'No document or contract storage for employees. The system tracks records and their access, not what is attached to them.',
  ],
  areas: [
    'Employee management',
    'Clock in / clock out',
    'Time-off requests',
    'Role-based access',
    'Multi-club access',
    'Club-level filtering',
    'Administrative workflows',
  ],
  roles: ['Backend Development', 'Database Design', 'API Design'],
  tech: ['node', 'postgres', 'knex', 'rest'],
  tags: ['Backend', 'Access control', 'PostgreSQL', 'Attendance'],
  // Drop a real screenshot at public/media/employee-club-management.png and point this at it
  // ('/media/employee-club-management.png') to replace the generated cover.
  cover: null,
  visual: { schema: 'dataflow', accent: 'plasma' },
  hasBreakdown: false,
  links: { demo: null, source: null },
}
