import { NextResponse } from 'next/server'

import { unsubscribe } from '@/lib/crm/email-worker'

type Context = { params: Promise<{ token: string }> }

export async function GET(_request: Request, { params }: Context) {
  const { token } = await params

  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response('Enlace inválido', { status: 404 })

return new Response(
    `<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cancelar suscripción</title><body style="font-family:system-ui;max-width:480px;margin:15vh auto;padding:24px"><h1>Preferencias de email</h1><p>Confirma para dejar de recibir campañas de este espacio de trabajo.</p><form method="post"><button style="padding:12px 20px">Cancelar suscripción</button></form></body></html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
        'Referrer-Policy': 'no-referrer'
      }
    }
  )
}

export async function POST(_request: Request, { params }: Context) {
  const ok = await unsubscribe((await params).token)


return new NextResponse(
    ok ? 'Suscripción cancelada. No recibirás más campañas de este espacio.' : 'Enlace no encontrado.',
    { status: ok ? 200 : 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }
  )
}
