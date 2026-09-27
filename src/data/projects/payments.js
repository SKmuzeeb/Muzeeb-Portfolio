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
