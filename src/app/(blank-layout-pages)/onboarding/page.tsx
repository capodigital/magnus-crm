import { redirect } from 'next/navigation'

import type { Metadata } from 'next'

import Box from '@mui/material/Box'

import GoogleWorkspaceForm from '@/components/auth/GoogleWorkspaceForm'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { safeCallbackPath } from '@/lib/auth/navigation'

export const metadata: Metadata = { title: 'Crear espacio de trabajo', robots: { index: false, follow: false } }

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [session, params] = await Promise.all([auth(), searchParams])
  const callbackUrl = safeCallbackPath(params.callbackUrl)

  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  const [membership, account] = await Promise.all([
    prisma.membership.findFirst({ where: { userId: session.user.id }, select: { id: true } }),
    prisma.account.findFirst({ where: { userId: session.user.id, provider: 'google' }, select: { id: true } })
  ])

  if (membership || !account) redirect(callbackUrl)

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 4 }}>
      <GoogleWorkspaceForm email={session.user.email || ''} callbackUrl={callbackUrl} />
    </Box>
  )
}
