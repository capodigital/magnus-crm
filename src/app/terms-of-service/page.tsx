import type { Metadata } from 'next'

import LegalDocumentPage from '@/components/marketing/LegalDocumentPage'
import PublicSiteShell from '@/components/marketing/PublicSiteShell'

export const metadata: Metadata = {
  title: 'Condiciones de servicio',
  description: 'Condiciones de servicio de Magnus CRM para crm.magnusecosystems.com.',
  alternates: {
    canonical: '/terms-of-service'
  },
  openGraph: {
    title: 'Condiciones de servicio | Magnus CRM',
    description: 'Condiciones de servicio de Magnus CRM para crm.magnusecosystems.com.',
    url: 'https://crm.magnusecosystems.com/terms-of-service',
    type: 'article'
  }
}

const TermsOfServicePage = () => {
  return (
    <PublicSiteShell>
      <LegalDocumentPage
        eyebrow='Legal'
        title='Condiciones de servicio'
        description='Ultima actualizacion: 31 de julio de 2026. Estas condiciones regulan el acceso y uso de Magnus CRM en crm.magnusecosystems.com.'
        sections={[
          {
            title: '1. Aceptacion',
            content: (
              <>
                <p>
                  Al acceder o usar Magnus CRM aceptas estas condiciones y cualquier politica complementaria publicada
                  en el sitio.
                </p>
              </>
            )
          },
          {
            title: '2. Uso permitido',
            content: (
              <>
                <p>El servicio debe usarse para fines comerciales legitimos y conforme a la ley aplicable.</p>
                <ul>
                  <li>No puedes usar el servicio para fraude, spam o actividades ilicitas.</li>
                  <li>No puedes intentar acceder a datos o workspaces que no te pertenecen.</li>
                  <li>No puedes interferir con la seguridad, estabilidad o disponibilidad de la plataforma.</li>
                </ul>
              </>
            )
          },
          {
            title: '3. Cuentas y acceso',
            content: (
              <>
                <p>
                  Eres responsable de mantener seguras tus credenciales y de toda actividad realizada desde tu cuenta.
                </p>
                <p>
                  El acceso al CRM puede depender de invitaciones, membresias de tenant y configuraciones internas del
                  workspace.
                </p>
              </>
            )
          },
          {
            title: '4. Datos del cliente y contenidos',
            content: (
              <>
                <p>
                  El cliente o tenant conserva la responsabilidad sobre los datos que carga, procesa o comparte mediante
                  el servicio, incluyendo conversaciones y registros comerciales.
                </p>
                <p>
                  Magnus CRM actua como plataforma operativa y puede procesar esa informacion solo en la medida
                  necesaria para prestar el servicio.
                </p>
              </>
            )
          },
          {
            title: '5. Integraciones externas',
            content: (
              <>
                <p>
                  Algunas funciones dependen de servicios de terceros, como proveedores de autenticacion,
                  infraestructura o mensajeria empresarial.
                </p>
                <p>
                  La disponibilidad o cambios de esas integraciones pueden afectar ciertas funciones sin que eso
                  implique una garantia absoluta de continuidad.
                </p>
              </>
            )
          },
          {
            title: '6. Suspension o terminacion',
            content: (
              <>
                <p>
                  Podemos suspender o limitar el acceso si detectamos uso indebido, incumplimiento, riesgo de seguridad
                  o requerimientos legales.
                </p>
                <p>
                  Los usuarios tambien pueden solicitar la eliminacion de su cuenta desde la ruta interna
                  <strong> /settings/data-deletion</strong>.
                </p>
                <p>La solicitud requiere sesion autenticada y afecta el acceso del usuario que la ejecuta.</p>
              </>
            )
          },
          {
            title: '7. Limitacion de responsabilidad',
            content: (
              <>
                <p>
                  Magnus CRM se ofrece sobre una base razonable de disponibilidad y mejora continua. En la maxima medida
                  permitida por la ley, no asumimos responsabilidad por danos indirectos, incidentales o derivados del
                  uso del servicio.
                </p>
              </>
            )
          },
          {
            title: '8. Cambios',
            content: (
              <>
                <p>
                  Podemos actualizar estas condiciones cuando el producto, la operacion o el marco legal lo requieran.
                  La version vigente se publicara en esta pagina.
                </p>
              </>
            )
          }
        ]}
      />
    </PublicSiteShell>
  )
}

export default TermsOfServicePage
