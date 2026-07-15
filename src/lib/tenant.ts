export type TenantContext = {
  host: string
  normalizedHost: string
  tenantSlug: string | null
  isPlatformHost: boolean
  isPlatformSubdomain: boolean
}

const localhostHosts = new Set(['localhost', '127.0.0.1'])

const stripPort = (host: string) => host.split(':')[0] ?? host

export const normalizeHost = (host: string) => stripPort(host.trim().toLowerCase().replace(/\/+$/, ''))

export const resolveTenantContext = (hostHeader: string | null): TenantContext => {
  const platformHost = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host.toLowerCase() : 'localhost:3000'
  const host = (hostHeader?.trim().toLowerCase() || platformHost).replace(/\/+$/, '')
  const normalizedHost = normalizeHost(host)
  const platformHostWithoutPort = normalizeHost(platformHost)

  const isPlatformHost =
    host === platformHost ||
    normalizedHost === platformHostWithoutPort ||
    localhostHosts.has(normalizedHost) ||
    localhostHosts.has(platformHostWithoutPort)

  const isPlatformSubdomain =
    !isPlatformHost &&
    normalizedHost.length > platformHostWithoutPort.length &&
    normalizedHost.endsWith(`.${platformHostWithoutPort}`)

  return {
    host,
    normalizedHost,
    tenantSlug: isPlatformSubdomain ? normalizedHost.slice(0, -(platformHostWithoutPort.length + 1)) || null : null,
    isPlatformHost,
    isPlatformSubdomain
  }
}
