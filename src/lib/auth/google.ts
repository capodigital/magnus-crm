import 'server-only'

export function hasGoogleProvider() {
  const values = [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET]

  return values.every(value => Boolean(value?.trim()) && !/replace_me|placeholder|your_/i.test(value!))
}

export function verifiedGoogleEmail(profile: unknown) {
  if (!profile || typeof profile !== 'object') return null
  const data = profile as Record<string, unknown>

  if (data.email_verified !== true || typeof data.sub !== 'string' || !data.sub || typeof data.email !== 'string')
    return null
  const email = data.email.trim().toLowerCase()

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}
