import 'dotenv/config'

import { disconnectPrisma } from '@/lib/prisma'
import { bootstrapWorkspace } from '@/lib/workspace-bootstrap'

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const main = async () => {
  const result = await bootstrapWorkspace({
    tenantSlug: requireEnv('BOOTSTRAP_TENANT_SLUG'),
    tenantName: requireEnv('BOOTSTRAP_TENANT_NAME'),
    ownerEmail: requireEnv('BOOTSTRAP_OWNER_EMAIL'),
    ownerName: process.env.BOOTSTRAP_OWNER_NAME,
    ownerPassword: process.env.BOOTSTRAP_OWNER_PASSWORD,
    domainHost: process.env.BOOTSTRAP_DOMAIN_HOST,
    pipelineName: process.env.BOOTSTRAP_PIPELINE_NAME,
    supportEmail: process.env.BOOTSTRAP_SUPPORT_EMAIL,
    locale: process.env.BOOTSTRAP_TENANT_LOCALE,
    timezone: process.env.BOOTSTRAP_TENANT_TIMEZONE
  })

  console.log('Workspace bootstrap completed:')
  console.log(`- tenantId: ${result.tenantId}`)
  console.log(`- tenantSlug: ${result.tenantSlug}`)
  console.log(`- ownerUserId: ${result.ownerUserId}`)
  console.log(`- primaryDomainHost: ${result.primaryDomainHost}`)
  console.log(`- pipelineId: ${result.pipelineId}`)
  console.log(`- stageCount: ${result.stageCount}`)
}

main()
  .catch(error => {
    console.error('Workspace bootstrap failed.')
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectPrisma()
  })
