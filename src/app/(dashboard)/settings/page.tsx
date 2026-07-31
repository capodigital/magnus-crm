import SectionPage from '@components/crm/SectionPage'

const SettingsPage = () => {
  return (
    <SectionPage
      eyebrow='Configuracion del workspace'
      title='Prepara tenant, autenticacion e integraciones'
      description='Aqui ya viven el estado de acceso, los controles de lanzamiento y la primera superficie de gestion de cuenta mientras terminamos la configuracion completa del tenant.'
      status='Acceso y lanzamiento en progreso'
      actions={[
        { label: 'Abrir home', href: '/home', variant: 'outlined' },
        { label: 'Abrir inbox', href: '/inbox', variant: 'outlined' },
        { label: 'Eliminar mis datos', href: '/settings/data-deletion' }
      ]}
      bullets={[
        'Email/password access is active and Google sign-in will appear once the final client credentials are configured.',
        'Tenant branding and white-label controls are intentionally deferred for now.',
        'Embedded Signup metadata and WhatsApp token wiring will land here later.',
        'Users can now manage account deletion from the internal route /settings/data-deletion.'
      ]}
    />
  )
}

export default SettingsPage
