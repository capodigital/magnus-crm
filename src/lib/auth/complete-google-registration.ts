import 'server-only'

import prisma from '@/lib/prisma'
import { CrmError, objectInput, textInput } from '@/lib/crm/contracts'
import { createCompanyWorkspace } from './create-company-workspace'

export async function completeGoogleRegistration(userId: string, input: unknown) {
  const data = objectInput(input)
  const companyName = textInput(data.companyName, 'Nombre de la empresa', 120)

  if (data.acceptedTerms !== true) throw new CrmError('Acepta la política de privacidad y las condiciones de servicio.')

  return prisma.$transaction(async tx => {
    // Lock the authenticated user so concurrent submissions cannot create two workspaces.
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, accounts: { where: { provider: 'google' }, select: { id: true } } }
    })

    if (!user?.email || !user.accounts.length)
      throw new CrmError('Inicia sesión con Google para completar tu registro.', 403)

    const existing = await tx.membership.findFirst({
      where: { userId },
      orderBy: [{ isOwner: 'desc' }, { createdAt: 'asc' }],
      include: { tenant: true }
    })

    if (existing) {
      if (existing.tenant.status !== 'ACTIVE')
        throw new CrmError('Tu espacio no está activo. Contacta con soporte.', 403)

      return { tenantId: existing.tenantId }
    }

    return createCompanyWorkspace(tx, { companyName, ownerId: user.id, ownerEmail: user.email })
  })
}
