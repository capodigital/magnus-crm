import type { Metadata } from 'next'

import LegalDocumentPage from '@/components/marketing/LegalDocumentPage'
import PublicSiteShell from '@/components/marketing/PublicSiteShell'

export const metadata: Metadata = {
  title: 'Eliminar datos',
  description: 'Instrucciones publicas para solicitar o ejecutar la eliminacion de datos en Magnus CRM.',
  alternates: {
    canonical: '/data-deletion'
  },
  openGraph: {
    title: 'Eliminar datos | Magnus CRM',
    description: 'Instrucciones publicas para solicitar o ejecutar la eliminacion de datos en Magnus CRM.',
    url: 'https://crm.magnusecosystems.com/data-deletion',
    type: 'article'
  }
}

const DataDeletionInstructionsPage = () => {
  return (
    <PublicSiteShell>
      <LegalDocumentPage
        eyebrow='Datos de usuario'
        title='Como eliminar tus datos'
        description='Ultima actualizacion: 31 de julio de 2026. Esta pagina explica como un usuario de Magnus CRM puede eliminar su cuenta y solicitar la eliminacion de sus datos personales.'
        sections={[
          {
            title: '1. Eliminar tu cuenta desde el CRM',
            content: (
              <>
                <p>Si puedes iniciar sesion, puedes ejecutar la solicitud directamente desde tu cuenta.</p>
                <ul>
                  <li>Inicia sesion en Magnus CRM con la cuenta que deseas eliminar.</li>
                  <li>
                    Abre la ruta interna <strong>/settings/data-deletion</strong>.
                  </li>
                  <li>Lee la advertencia de eliminacion y confirma escribiendo la palabra solicitada en pantalla.</li>
                  <li>Envia la solicitud. Cuando el proceso termine, la sesion se cerrara automaticamente.</li>
                </ul>
              </>
            )
          },
          {
            title: '2. Que datos se eliminan',
            content: (
              <>
                <p>
                  La solicitud elimina tu usuario de autenticacion y tu acceso personal a Magnus CRM. Tambien se
                  eliminan las sesiones asociadas a tu cuenta.
                </p>
                <p>
                  Si tu cuenta pertenece a un workspace administrado por una empresa, algunos registros comerciales,
                  conversaciones o datos operativos pueden conservarse dentro del tenant por obligaciones del cliente,
                  seguridad, auditoria o continuidad del servicio.
                </p>
              </>
            )
          },
          {
            title: '3. Si no puedes iniciar sesion',
            content: (
              <>
                <p>
                  Si no puedes acceder a tu cuenta, contacta al administrador del workspace que te invito a Magnus CRM y
                  solicita la eliminacion de tu usuario.
                </p>
                <p>
                  Cuando exista un canal publico de soporte para esta instancia, lo publicaremos en esta misma pagina y
                  en la politica de privacidad.
                </p>
              </>
            )
          },
          {
            title: '4. Tiempo de procesamiento',
            content: (
              <>
                <p>
                  Las solicitudes ejecutadas desde la ruta interna se procesan de forma inmediata para la cuenta de
                  usuario. Algunas copias de seguridad, registros tecnicos o datos retenidos por motivos legales pueden
                  tardar mas en expirar segun los ciclos normales de infraestructura.
                </p>
              </>
            )
          },
          {
            title: '5. Informacion relacionada',
            content: (
              <>
                <p>
                  Para conocer como tratamos la informacion del servicio, revisa la politica de privacidad publicada en
                  <strong> /privacy-policy</strong>.
                </p>
              </>
            )
          }
        ]}
      />
    </PublicSiteShell>
  )
}

export default DataDeletionInstructionsPage
