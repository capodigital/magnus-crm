import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { deleteUserAccount } from '@/lib/account/delete-user-account'

export async function DELETE() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const result = await deleteUserAccount(userId)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Could not delete the account.'

    return NextResponse.json({ error: errorMessage }, { status: 409 })
  }
}
