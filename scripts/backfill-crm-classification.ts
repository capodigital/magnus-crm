import 'dotenv/config'

import prisma from '../src/lib/prisma'

async function main() {
  const [wonStages, lostStages, customers] = await prisma.$transaction([
    prisma.pipelineStage.updateMany({
      where: { slug: 'ganado', isFinal: true, outcome: 'OPEN' },
      data: { outcome: 'WON' }
    }),
    prisma.pipelineStage.updateMany({
      where: { slug: 'perdido', isFinal: true, outcome: 'OPEN' },
      data: { outcome: 'LOST' }
    }),
    prisma.contact.updateMany({
      where: { lifecycle: 'PROSPECT', leads: { some: { status: 'WON' } } },
      data: { lifecycle: 'CUSTOMER' }
    })
  ])

  console.log({ wonStages: wonStages.count, lostStages: lostStages.count, customers: customers.count })
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.name : 'Backfill failed')
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
