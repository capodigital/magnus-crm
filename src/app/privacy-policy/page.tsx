import type { Metadata } from 'next'

import LegalDocumentPage from '@/components/marketing/LegalDocumentPage'
import PublicSiteShell from '@/components/marketing/PublicSiteShell'

export const metadata: Metadata = {
  title: 'Politica de privacidad',
  description: 'Politica de privacidad de Magnus CRM para crm.magnusecosystems.com.',
  alternates: {
    canonical: '/privacy-policy'
  },
  openGraph: {
    title: 'Politica de privacidad | Magnus CRM',
    description: 'Politica de privacidad de Magnus CRM para crm.magnusecosystems.com.',
    url: 'https://crm.magnusecosystems.com/privacy-policy',
    type: 'article'
  }
}

const PrivacyPolicyPage = () => {
  return (
    <PublicSiteShell>
      <LegalDocumentPage
        eyebrow='Legal'
        title='Politica de privacidad'
        description='Ultima actualizacion: 31 de julio de 2026. Esta politica resume como Magnus CRM recopila, usa y protege la informacion necesaria para operar el servicio.'
        sections={[
          {
            title: '1. Informacion que recopilamos',
            content: (
              <>
                <p>
                  Recopilamos la informacion minima necesaria para crear cuentas, autenticar usuarios y operar el CRM.
                </p>
                <ul>
                  <li>Datos de cuenta como nombre, correo y credenciales de acceso.</li>
                  <li>Datos operativos del workspace, incluyendo conversaciones, leads y actividad comercial.</li>
                  <li>
                    Metadatos tecnicos y de seguridad necesarios para auditoria, estabilidad y prevencion de abuso.
                  </li>
                </ul>
              </>
            )
          },
          {
            title: '2. Como usamos la informacion',
            content: (
              <>
                <p>
                  Usamos la informacion para prestar el servicio, proteger la plataforma y mejorar la operacion del CRM.
                </p>
                <ul>
                  <li>Autenticacion, gestion de sesiones y control de acceso.</li>
                  <li>Procesamiento de mensajes y organizacion del trabajo comercial dentro del CRM.</li>
                  <li>Soporte tecnico, cumplimiento legal, seguridad y continuidad operativa.</li>
                </ul>
              </>
            )
          },
          {
            title: '3. Comparticion y proveedores',
            content: (
              <>
                <p>
                  Podemos compartir datos con proveedores de infraestructura, autenticacion y mensajeria cuando eso sea
                  necesario para operar el servicio.
                </p>
                <ul>
                  <li>Plataformas de hosting, base de datos y monitoreo.</li>
                  <li>Meta y otros proveedores integrados cuando el cliente conecta sus propios canales.</li>
                  <li>Autoridades o terceros cuando exista una obligacion legal valida.</li>
                </ul>
              </>
            )
          },
          {
            title: '4. Conservacion de datos',
            content: (
              <>
                <p>
                  Conservamos los datos mientras la cuenta o el workspace permanezcan activos y por el tiempo razonable
                  necesario para seguridad, cumplimiento y soporte.
                </p>
                <p>
                  Cuando una cuenta o solicitud de eliminacion sea procesada, eliminaremos o anonimizaremos la
                  informacion aplicable segun el alcance tecnico y legal del servicio.
                </p>
              </>
            )
          },
          {
            title: '5. Derechos y eliminacion de datos',
            content: (
              <>
                <p>
                  Los usuarios autenticados pueden gestionar la eliminacion de su cuenta desde la URL interna del CRM
                  <strong> /settings/data-deletion</strong>.
                </p>
                <p>Esta ruta requiere haber iniciado sesion con la cuenta que deseas eliminar.</p>
                <p>
                  Si accedes al servicio a traves de un workspace administrado por tu empresa, algunas solicitudes
                  pueden requerir aprobacion o coordinacion con el administrador del tenant.
                </p>
              </>
            )
          },
          {
            title: '6. Seguridad',
            content: (
              <>
                <p>
                  Aplicamos medidas razonables de seguridad tecnica y organizativa para proteger cuentas, credenciales y
                  datos operativos.
                </p>
                <p>
                  Ningun sistema es infalible, por lo que recomendamos usar contrasenas robustas y limitar el acceso
                  solo a usuarios autorizados.
                </p>
              </>
            )
          },
          {
            title: '7. Cambios a esta politica',
            content: (
              <>
                <p>
                  Podemos actualizar esta politica para reflejar cambios del producto, requisitos legales o mejoras
                  operativas. Publicaremos la version vigente en esta misma pagina.
                </p>
              </>
            )
          }
        ]}
      />
    </PublicSiteShell>
  )
}

export default PrivacyPolicyPage
