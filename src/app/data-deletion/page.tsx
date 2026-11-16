import Link from 'next/link'

import type { Metadata } from 'next'

import LegalDocumentPage from '@/components/marketing/LegalDocumentPage'
import PublicSiteShell from '@/components/marketing/PublicSiteShell'
import { publicSite } from '@/configs/publicSite'

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
        title='Cómo eliminar tus datos'
        description={`Última actualización: ${publicSite.policyUpdatedAt}. Puedes consultar estas instrucciones sin iniciar sesión. Para ejecutar la eliminación de una cuenta, necesitamos verificar su titularidad.`}
        sections={[
          {
            title: '1. Eliminar tu cuenta desde el CRM',
            content: (
              <>
                <p>Si puedes iniciar sesion, puedes ejecutar la solicitud directamente desde tu cuenta.</p>
                <ul>
                  <li>Inicia sesion en Magnus CRM con la cuenta que deseas eliminar.</li>
                  <li>
                    Abre <Link href='/settings/data-deletion'>Configuración → Eliminar datos</Link>.
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
                  eliminan las sesiones registradas, las vinculaciones con Google y los tokens almacenados de esas
                  vinculaciones.
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
                  Escribe a <a href={`mailto:${publicSite.contactEmail}`}>{publicSite.contactEmail}</a> con el asunto
                  «Eliminación de datos de Magnus CRM». Indica el correo de tu cuenta, la empresa y qué datos deseas
                  eliminar. Verificaremos tu identidad; no envíes contraseñas ni tokens.
                </p>
                <p>
                  También puedes contactar al administrador de tu espacio de trabajo para revisar los datos comerciales
                  de la empresa. Si la eliminación encuentra asignaciones pendientes, coordinaremos su resolución antes
                  de volver a intentarlo.
                </p>
              </>
            )
          },
          {
            title: '4. Tiempo de procesamiento',
            content: (
              <>
                <p>
                  Cuando la operación se completa, la cuenta se elimina de la base activa. Las solicitudes por email
                  requieren revisión de identidad y alcance. Las copias de seguridad y registros técnicos pueden
                  persistir hasta su renovación o vencimiento, y los datos sujetos a obligaciones legales se conservan
                  mientras sean necesarios. Puedes consultar el estado de tu solicitud en el mismo correo.
                </p>
              </>
            )
          },
          {
            title: '5. Informacion relacionada',
            content: (
              <>
                <p>
                  Puedes revocar el acceso en{' '}
                  <a href='https://myaccount.google.com/connections'>las conexiones de tu cuenta de Google</a>. Revocar
                  no elimina automáticamente los datos ya guardados en Magnus CRM; utiliza los pasos anteriores para
                  solicitar su eliminación.
                </p>
                <p>
                  Consulta también nuestra <Link href='/privacy-policy'>política de privacidad</Link>.
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
