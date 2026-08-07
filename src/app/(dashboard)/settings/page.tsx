import SectionPage from '@components/crm/SectionPage'

import { requireTenantAccess } from '@/lib/app-context'

const SettingsPage = async () => {
  const context = await requireTenantAccess()
  const activeWorkspace = context.tenant ?? context.memberships[0]?.tenant ?? null

  const workspaceBullet = activeWorkspace
    ? `Workspace activo: ${activeWorkspace.name}. Slug interno para WhatsApp: ${activeWorkspace.slug}.`
    : 'Aun no encontramos un workspace asociado a tu usuario.'

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
        workspaceBullet,
        'Email/password access is active and Google sign-in will appear once the final client credentials are configured.',
        'Por ahora todos los workspaces operan desde el dominio principal del CRM; no se crean subdominios por empresa.',
        'Tenant branding and white-label controls are intentionally deferred for now.',
        'Embedded Signup metadata and WhatsApp token wiring will land here later.',
        'Users can now manage account deletion from the internal route /settings/data-deletion.'
      ]}
    />
  )
}

export default SettingsPage
