import { auth } from '@/lib/auth'
import { completeGoogleRegistration } from '@/lib/auth/complete-google-registration'
import { crmRoute } from '@/lib/crm/access'
import { CrmError } from '@/lib/crm/contracts'

export async function POST(request: Request) {
  return crmRoute(async () => {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    if (!origin || (origin !== `https://${host}` && origin !== `http://${host}`))
      throw new CrmError('Origen de solicitud no permitido.', 403)
    const session = await auth()

    if (!session?.user?.id) throw new CrmError('Inicia sesión para continuar.', 401)

    return completeGoogleRegistration(session.user.id, await request.json())
  })
}
