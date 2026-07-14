import SectionPage from '@components/crm/SectionPage'

const BillingPage = () => {
  return (
    <SectionPage
      eyebrow='Usage billing'
      title='Make WhatsApp costs transparent before invoicing anything'
      description='Billing will track delivered-message cost, pricing category, and reconciliation against Meta pricing data.'
      status='Goal 7 billing foundation'
      actions={[
        { label: 'Open settings', href: '/settings', variant: 'outlined' },
        { label: 'Review leads', href: '/leads' }
      ]}
      bullets={[
        'Record delivered events as the billing source of truth rather than message attempts.',
        'Snapshot pricing rules so future Meta changes do not rewrite old invoices.',
        'Show an estimate versus reconciled value when pricing analytics arrive.',
        'Separate platform fee from pass-through Meta cost from day one.'
      ]}
    />
  )
}

export default BillingPage
