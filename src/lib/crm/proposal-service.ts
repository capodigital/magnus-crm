import 'server-only'

import prisma from '@/lib/prisma'
import { CrmError, objectInput, textInput } from './contracts'
import { generateCrmText } from './ai-client'

export async function generateProposal(tenantId: string, input: unknown) {
  const data = objectInput(input)
  const contactId = textInput(data.contactId, 'Contacto')
  const brief = textInput(data.brief, 'Objetivo de la propuesta', 4000)

  const contact = await prisma.contact.findFirst({
    where: { tenantId, id: contactId },
    select: {
      fullName: true,
      company: true,
      notes: true,
      leads: {
        where: { tenantId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: { title: true, valueCents: true, currency: true, status: true }
      },
      activities: {
        where: { tenantId },
        take: 10,
        orderBy: { occursAt: 'desc' },
        select: { type: true, title: true, description: true }
      }
    }
  })

  if (!contact) throw new CrmError('Contacto no encontrado.', 404)

  const { body } = await generateCrmText(
    'proposal',
    'auto',
    'Redacta una propuesta comercial para revisión, con contexto, solución, alcance, inversión y próximo paso. No incluyas datos de otros clientes.',
    { brief, contact }
  )

  return prisma.proposal.create({
    data: {
      tenantId,
      contactId,
      title: `Propuesta para ${contact.company || contact.fullName || 'contacto'}`.slice(0, 200),
      body: body.slice(0, 20000),
      aiGenerated: true
    }
  })
}
