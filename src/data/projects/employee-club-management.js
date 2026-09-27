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
