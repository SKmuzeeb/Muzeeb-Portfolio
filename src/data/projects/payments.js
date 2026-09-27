export const payments = {
  slug: 'payment-workflows',
  title: 'Payment & Transaction Systems',
  subtitle: 'Backend payment workflows',
  category: ['payments', 'backend', 'api-integrations'],
  kind: 'Backend',
  format: 'Payment processing, transactions and stock reconciliation',
  tagline:
    'Backend payment workflows integrating payment processing, transaction management, stock validation and post-payment operations.',
  overview: [
    'The payment side of the platform is a sequence, not a single call. A purchase has to check availability, take the money, record the transaction, produce something the customer can act on, and update stock â€” and every one of those steps has to behave sensibly when the one before it did.',
    'This work lives mostly on the backend: validating the request before anything is charged, processing the payment through the provider, and then running the follow-up operations that make the purchase real for the customer and for stock.',
  ],
  purpose:
    'Make payment handling a reliable, observable sequence with defined states, rather than a single provider call wrapped in a try/catch.',
  challenge:
    'External payment providers fail in ways that are not exceptions â€” a decline, a timeout, a webhook that arrives twice. Treating those as one failure mode means the order and the stock can disagree with reality.',
  approach:
    'Define the state transitions explicitly and make each step re-runnable. Provider responses are recorded against the order, the transaction row is written before downstream operations run, and post-payment steps (confirmation, stock update, notification) are triggered from that state rather than from the request handler.',
  /** Decisions and what each one cost. See the note in migratron.js. */
  decisions: [
    {
      title: 'Record the provider response before anything downstream runs',
      choice: 'The outcome is written against the order first; stock, notification and confirmation follow from that record.',
      because:
        'A decline, a timeout and a duplicate webhook are three different situations. A single try/catch around the provider call collapses them into one, and then the order and the stock can quietly disagree with reality.',
      cost:
        'An extra write on the happy path, and a state where the order exists but nothing has happened to it yet. That intermediate state has to be understood by every reader of the order.',
    },
    {
      title: 'Post-payment work triggered from recorded state, not the request',
      choice: 'Stock update, confirmation and notification run off the recorded outcome, so they survive the request returning.',
      because:
        'Providers confirm asynchronously and retry webhooks. If the follow-up work is only triggered on the way out of the request handler, a webhook that arrives late leaves a paid order with no stock movement and no customer email.',
      cost:
        'Eventual consistency, and an interface that has to render intermediate states honestly instead of showing a single definitive result.',
    },
    {
      title: 'Webhook deduplication by provider event id',
      choice: 'A provider event is processed at most once, recorded against its own id.',
      because:
        'Duplicate delivery is normal provider behaviour, not a provider bug. Without deduplication, retrying is harmless for a decline and corrupting for a success.',
      cost:
        'A dedupe table, and the retention policy that comes with it — it is data that is useful for a while and then is not.',
    },
    {
      title: 'Pickup code generated server-side at confirmation',
      choice: 'The customer reference is created when the payment is confirmed and does not depend on the email arriving.',
      because:
        'If the only reference exists in an email, then a failed email leaves a paid customer holding nothing they can present. The code has to be recoverable from the order itself.',
      cost:
        'Very little technically. The real cost is admitting that the notification is not guaranteed and designing the pickup flow around that.',
    },
  ],
  boundaries: [
    'Refunds are recorded and handled manually rather than orchestrated automatically, including the stock decision on the way back.',
    'No split payments, partial captures or multi-currency. Each adds a second money path that has to reconcile with the first.',
    'Stock is decremented on purchase rather than reserved across a cart session, so an abandoned cart does not hold inventory.',
  ],
  areas: ['Cart', 'Stock validation', 'Payment processing', 'Payment confirmation', 'Transaction creation', 'Pickup code generation', 'Stock update', 'Email notification'],
  flow: [
    { label: 'Cart', sub: 'requested items' },
    { label: 'Stock validation', sub: 'availability check' },
    { label: 'Payment processing', sub: 'provider call' },
    { label: 'Payment confirmation', sub: 'provider response' },
    { label: 'Transaction creation', sub: 'record written' },
    { label: 'Pickup code', sub: 'customer reference' },
    { label: 'Stock update', sub: 'inventory decremented' },
    { label: 'Email notification', sub: 'customer notified' },
  ],
  roles: ['Backend Development', 'Database Design', 'Third-party Integrations'],
  tech: ['node', 'postgres', 'stripe', 'helcim', 'rest'],
  tags: ['Payments', 'Transactions', 'Stock', 'Backend'],
  // Drop a real screenshot at public/media/payments.png and point this at it
  // ('/media/payments.png') to replace the generated cover.
  cover: null,
  visual: { schema: 'pipeline', accent: 'flame' },
  hasBreakdown: true,
  links: { demo: null, source: null },
}
