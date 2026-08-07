import { NextResponse } from 'next/server'

import {
  CompanyWorkspaceRegistrationError,
  registerCompanyWorkspace
} from '@/lib/auth/register-company-workspace'

type RegisterPayload = {
  name?: string
  email?: string
  password?: string
  companyName?: string
}

export async function POST(request: Request) {
  let payload: RegisterPayload

  try {
    payload = (await request.json()) as RegisterPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  try {
    const result = await registerCompanyWorkspace({
      ownerName: payload.name ?? '',
      email: payload.email ?? '',
      password: payload.password ?? '',
      companyName: payload.companyName ?? ''
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'No pudimos completar el registro.'
    const status = error instanceof CompanyWorkspaceRegistrationError ? error.status : 400

    return NextResponse.json({ error: errorMessage }, { status })
  }
}
