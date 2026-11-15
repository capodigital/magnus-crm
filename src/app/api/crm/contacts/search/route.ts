import { crmAccess, crmRoute } from '@/lib/crm/access'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess()
    const q = (new URL(request.url).searchParams.get('q') ?? '').slice(0, 200)

    return prisma.contact.findMany({
      where: {
        tenantId,
        OR: [{ fullName: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }]
      },
      take: 25,
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, email: true }
    })
  })
}
