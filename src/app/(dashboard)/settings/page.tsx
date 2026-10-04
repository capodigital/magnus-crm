import Stack from '@mui/material/Stack'

import SectionPage from '@components/crm/SectionPage'
import WhatsappEmbeddedSignupPanel from '@components/crm/WhatsappEmbeddedSignupPanel'
import WhatsappPhoneNumberPanel from '@components/crm/WhatsappPhoneNumberPanel'
import WhatsappTemplatesPanel from '@components/crm/WhatsappTemplatesPanel'

import { requireTenantAccess } from '@/lib/app-context'
import prisma from '@/lib/prisma'
import { getTenantWhatsappTemplates } from '@/lib/whatsapp/template-service'
import { hasValidMetaEncryptionKey } from '@/lib/whatsapp/token-vault'

const SettingsPage = async () => {
  const context = await requireTenantAccess()
  const activeWorkspace = context.tenant ?? context.memberships[0]?.tenant ?? null

  const whatsappPhoneNumber = activeWorkspace
    ? await prisma.whatsappPhoneNumber.findFirst({
        where: {
          tenantId: activeWorkspace.id
        },
        select: {
          wabaId: true,
          phoneNumberId: true,
          displayPhoneNumber: true,
          verifiedName: true,
          connectionSource: true,
          registrationStatus: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    : null

  const whatsappTemplates = activeWorkspace ? await getTenantWhatsappTemplates(activeWorkspace.id) : []

  const workspaceBullet = activeWorkspace
    ? `Workspace activo: ${activeWorkspace.name}. Slug interno para WhatsApp: ${activeWorkspace.slug}.`
    : 'Aun no encontramos un workspace asociado a tu usuario.'

  return (
    <Stack spacing={4}>
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
          'Embedded Signup conecta el WABA y el número de cada workspace sin copiar IDs ni tokens en variables de entorno por cliente.',
          'Users can now manage account deletion from the internal route /settings/data-deletion.'
        ]}
      />
      <WhatsappEmbeddedSignupPanel
        workspaceName={activeWorkspace?.name ?? null}
        isConfigured={Boolean(
          process.env.META_APP_ID?.trim() &&
          process.env.NEXT_PUBLIC_META_APP_ID?.trim() &&
            process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() &&
            process.env.META_APP_SECRET?.trim() &&
            hasValidMetaEncryptionKey()
        )}
        initialPhoneNumber={whatsappPhoneNumber}
      />
      <WhatsappPhoneNumberPanel
        workspaceName={activeWorkspace?.name ?? null}
        initialPhoneNumber={whatsappPhoneNumber}
      />
      <WhatsappTemplatesPanel workspaceName={activeWorkspace?.name ?? null} initialTemplates={whatsappTemplates} />
    </Stack>
  )
}

export default SettingsPage
