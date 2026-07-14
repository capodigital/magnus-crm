import SectionPage from '@components/crm/SectionPage'

const SettingsPage = () => {
  return (
    <SectionPage
      eyebrow='Workspace settings'
      title='Prepare the tenant, auth, and integration controls'
      description='This is where tenant-level settings, auth providers, and integration keys will be managed once the backend is wired.'
      status='Goal 4 and Goal 5 foundation'
      actions={[
        { label: 'Open home', href: '/home', variant: 'outlined' },
        { label: 'Open inbox', href: '/inbox' }
      ]}
      bullets={[
        'NextAuth configuration will need provider keys and an app URL before it can be turned on.',
        'Tenant branding and white-label controls are intentionally deferred for now.',
        'Embedded Signup metadata and WhatsApp token wiring will land here later.',
        'Keep environment secret handling simple and explicit when the auth layer begins.'
      ]}
    />
  )
}

export default SettingsPage
