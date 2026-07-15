export type TenantContext = {
  host: string
  tenantSlug: string | null
  isPlatformHost: boolean
}

const localhostHosts = new Set(['localhost', '127.0.0.1'])

const stripPort = (host: string) => host.split(':')[0] ?? host

export const resolveTenantContext = (hostHeader: string | null): TenantContext => {
  const platformHost = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host.toLowerCase() : 'localhost:3000'
  const host = (hostHeader?.trim().toLowerCase() || platformHost).replace(/\/+$/, '')
  const hostWithoutPort = stripPort(host)
  const platformHostWithoutPort = stripPort(platformHost)

  const isPlatformHost =
    host === platformHost ||
    hostWithoutPort === platformHostWithoutPort ||
    localhostHosts.has(hostWithoutPort) ||
    localhostHosts.has(platformHostWithoutPort)

  return {
    host,
    tenantSlug: isPlatformHost ? null : hostWithoutPort.split('.')[0] ?? null,
    isPlatformHost
  }
}
