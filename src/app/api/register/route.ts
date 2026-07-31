import { NextResponse } from 'next/server'

import { registerUser } from '@/lib/auth/register-user'

type RegisterPayload = {
  name?: string
  email?: string
  password?: string
}

export async function POST(request: Request) {
  let payload: RegisterPayload

  try {
    payload = (await request.json()) as RegisterPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  try {
    const user = await registerUser({
      name: payload.name ?? '',
      email: payload.email ?? '',
      password: payload.password ?? ''
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed.'
    const status = errorMessage.includes('already exists') ? 409 : 400

    return NextResponse.json({ error: errorMessage }, { status })
  }
}
