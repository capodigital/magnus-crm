import { crmAccess, crmRoute } from '@/lib/crm/access'
import { objectInput, textInput } from '@/lib/crm/contracts'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true)
    const data = objectInput(await request.json())

    return prisma.pipeline.create({
      data: {
        tenantId,
        name: textInput(data.name, 'Nombre', 80),
        stages: {
          create: [
            { tenantId, name: 'Nuevo', slug: 'nuevo', position: 1, color: '#2563eb' },
            { tenantId, name: 'Calificado', slug: 'calificado', position: 2, color: '#d97706' },
            { tenantId, name: 'Ganado', slug: 'ganado', position: 3, color: '#16a34a', outcome: 'WON', isFinal: true },
            {
              tenantId,
              name: 'Perdido',
              slug: 'perdido',
              position: 4,
              color: '#dc2626',
              outcome: 'LOST',
              isFinal: true
            }
          ]
        }
      }
    })
  })
}
