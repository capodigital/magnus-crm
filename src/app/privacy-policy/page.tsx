import Link from 'next/link'

import type { Metadata } from 'next'

import LegalDocumentPage from '@/components/marketing/LegalDocumentPage'
import PublicSiteShell from '@/components/marketing/PublicSiteShell'
import { publicSite } from '@/configs/publicSite'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Cómo Magnus CRM recopila, utiliza, comparte, conserva y elimina datos de cuenta, de Google y del trabajo comercial.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    title: 'Política de privacidad | Magnus CRM',
    description: 'Datos de Google, información del CRM, proveedores, conservación y derechos de privacidad.',
    url: `${publicSite.url}/privacy-policy`,
    type: 'article'
  }
}

const PrivacyPolicyPage = () => (
  <PublicSiteShell>
    <LegalDocumentPage
      eyebrow='Magnus CRM · Privacidad'
      title='Política de privacidad'
      description={`Última actualización: ${publicSite.policyUpdatedAt}. Esta política explica el tratamiento de datos en Magnus CRM, disponible en crm.magnusecosystems.com.`}
      sections={[
        {
          title: '1. Quién presta el servicio y cómo contactarnos',
          content: (
            <>
              <p>
                Magnus CRM es un servicio de Magnus Ecosystems para gestionar clientes, leads, oportunidades,
                conversaciones, actividades, propuestas y campañas de email.
              </p>
              <p>
                Para consultas de privacidad, soporte o solicitudes sobre tus datos, escribe a{' '}
                <a href={`mailto:${publicSite.contactEmail}`}>{publicSite.contactEmail}</a>. Indica que tu consulta
                corresponde a Magnus CRM.
              </p>
              <p>
                Gestionamos los datos de las cuentas y la operación de la plataforma. Cuando una empresa incorpora
                información de sus clientes a su espacio de trabajo, esa empresa determina la finalidad del tratamiento
                y las personas autorizadas; Magnus CRM procesa esa información para prestar el servicio. Si eres un
                contacto de una empresa usuaria, también puedes dirigirte a ella para ejercer tus derechos.
              </p>
            </>
          )
        },
        {
          title: '2. Información que recopilamos',
          content: (
            <>
              <ul>
                <li>
                  <strong>Cuenta y empresa:</strong> nombre, correo, nombre de la empresa, pertenencia al espacio de
                  trabajo, rol y, si se proporciona, teléfono. Si te registras con contraseña, conservamos su
                  representación protegida mediante hash, no la contraseña en texto legible.
                </li>
                <li>
                  <strong>Información comercial:</strong> datos de contactos que tú o tu equipo introducen, como nombre,
                  email, teléfono, empresa, notas, etiquetas, estado y consentimiento para comunicaciones; leads,
                  etapas, importes y propuestas comerciales.
                </li>
                <li>
                  <strong>Interacciones:</strong> conversaciones y mensajes de los canales conectados, sus
                  identificadores y estados de entrega, y registros de llamadas, emails, reuniones, tareas y
                  recordatorios. Registrar una llamada o reunión no implica grabar su audio o video.
                </li>
                <li>
                  <strong>Campañas:</strong> segmentos, destinatarios, contenidos, programación, reglas de seguimiento,
                  estados de envío y solicitudes de baja.
                </li>
                <li>
                  <strong>Datos técnicos:</strong> cookies de sesión, preferencias de interfaz y registros de
                  funcionamiento y seguridad, que pueden incluir dirección IP, navegador, fechas, errores y solicitudes
                  al servicio.
                </li>
              </ul>
              <p>
                Los datos proceden de ti, de usuarios autorizados de tu empresa y de los servicios que decidas conectar.
                Debes contar con autorización para incorporar información de otras personas y evitar datos sensibles
                innecesarios.
              </p>
            </>
          )
        },
        {
          title: '3. Acceso con Google: datos y permisos',
          content: (
            <>
              <p>
                Continuar con Google es una opción para registrarte o iniciar sesión. Solicitamos únicamente los
                permisos de identidad básica <strong>openid, email y profile</strong>. Google nos proporciona tu
                identificador de cuenta, nombre, email, estado de verificación del correo y foto de perfil cuando está
                disponible.
              </p>
              <p>
                Usamos el identificador y el correo verificado para reconocer tu cuenta, vincular el acceso que
                autorizas y evitar suplantaciones; el nombre y la foto permiten identificarte dentro de tu cuenta y
                espacio de trabajo. Guardamos estos datos en nuestros registros de usuario y cuenta vinculada. El
                sistema de autenticación también puede conservar los tokens que Google entrega, su alcance y su
                vencimiento para gestionar esa vinculación.
              </p>
              <p>
                No recibimos tu contraseña de Google. No solicitamos permisos para leer o enviar Gmail, acceder a Google
                Drive o Calendar, ni importar tus contactos de Google. Las campañas del CRM se envían por nuestro
                proveedor de email y no desde tu buzón de Gmail.
              </p>
              <p>
                Puedes retirar la autorización en{' '}
                <a href='https://myaccount.google.com/connections'>las conexiones de tu cuenta de Google</a>. Revocar la
                conexión impide futuros accesos con esa autorización, pero no elimina por sí solo la cuenta ni los datos
                que ya se guardaron en Magnus CRM. La sección de eliminación explica cómo solicitarlos.
              </p>
            </>
          )
        },
        {
          title: '4. Para qué utilizamos los datos',
          content: (
            <>
              <ul>
                <li>Crear cuentas, autenticar usuarios, mantener sesiones y aplicar permisos por empresa y rol.</li>
                <li>
                  Mostrar fichas de clientes, conversaciones e historial, organizar oportunidades y dar seguimiento a
                  actividades.
                </li>
                <li>
                  Enviar las comunicaciones y campañas que configuras, ejecutar seguimientos programados y gestionar
                  bajas.
                </li>
                <li>
                  Generar borradores comerciales cuando solicitas asistencia de IA, conforme a la sección siguiente.
                </li>
                <li>Atender soporte, diagnosticar fallos, prevenir abuso y cumplir obligaciones legales aplicables.</li>
              </ul>
              <p>
                Tratamos los datos necesarios para prestar el servicio solicitado, mantener su seguridad y atender
                obligaciones legales. Las conexiones opcionales se activan con tu autorización; la empresa que envía
                comunicaciones debe disponer del consentimiento o la habilitación que corresponda. No vendemos datos
                personales ni utilizamos los datos de Google para publicidad personalizada.
              </p>
            </>
          )
        },
        {
          title: '5. Asistencia con inteligencia artificial',
          content: (
            <>
              <p>
                La IA de Magnus CRM genera borradores de texto para propuestas y emails cuando un usuario solicita esa
                función. Para una propuesta se envían al proveedor de IA las instrucciones del usuario y el contexto del
                contacto seleccionado: nombre, empresa, notas, oportunidades y actividades recientes. Para un borrador
                de email se envían las instrucciones que introduces.
              </p>
              <p>
                Los resultados se muestran para su revisión. Las propuestas se guardan en el CRM; los emails se
                incorporan al contenido de la campaña o automatización cuando decides utilizarlos. La generación por sí
                sola no envía el borrador al cliente.
              </p>
              <p>
                Los datos obtenidos del inicio de sesión con Google y sus tokens no se incluyen como contexto de estas
                solicitudes ni se utilizan para entrenar modelos. No usamos la información recibida de Google para
                desarrollar modelos de IA. La función de IA del CRM no genera imágenes.
              </p>
            </>
          )
        },
        {
          title: '6. Con quién se comparte la información',
          content: (
            <>
              <p>Compartimos la información necesaria para las funciones que utilizas, con estos destinatarios:</p>
              <ul>
                <li>
                  <strong>Tu empresa:</strong> usuarios autorizados del mismo espacio de trabajo, según sus permisos,
                  pueden acceder a los registros comerciales compartidos.
                </li>
                <li>
                  <strong>Infraestructura:</strong> Vercel para alojar la aplicación y procesar solicitudes, y Neon para
                  almacenar la base de datos. Estos servicios procesan los datos necesarios para operar el CRM.
                </li>
                <li>
                  <strong>Google:</strong> interviene en el acceso cuando eliges identificarte con tu cuenta de Google.
                </li>
                <li>
                  <strong>Meta / WhatsApp:</strong> al conectar WhatsApp Business, procesa identificadores de la cuenta
                  y teléfono empresarial, mensajes y estados de entrega necesarios para comunicarte con los contactos.
                </li>
                <li>
                  <strong>Resend:</strong> procesa direcciones de destinatarios, remitente, contenido de los emails y
                  datos de entrega para las campañas y seguimientos que configuras.
                </li>
                <li>
                  <strong>OpenAI:</strong> procesa las instrucciones y el contexto descritos en la sección de IA para
                  devolver el borrador solicitado. No recibe las credenciales de Google como parte de esa función.
                </li>
              </ul>
              <p>
                También podemos comunicar información cuando sea necesario para atender una obligación legal válida o
                investigar un incidente de seguridad. El acceso por personal de soporte se limita a la atención
                solicitada, la seguridad o el cumplimiento de obligaciones aplicables. Los proveedores pueden procesar
                información en países distintos del tuyo, bajo sus condiciones y las garantías que correspondan al
                servicio.
              </p>
            </>
          )
        },
        {
          title: '7. Compromisos sobre los datos de Google',
          content: (
            <>
              <p>
                El uso de la información recibida de Google se ajustará a la{' '}
                <a href='https://developers.google.com/terms/api-services-user-data-policy'>
                  Política de Datos de Usuario de los Servicios de API de Google
                </a>
                , incluidos los requisitos de Uso Limitado que resulten aplicables. Limitamos su uso al acceso, la
                identificación de tu cuenta y la seguridad de esas funciones.
              </p>
              <p>
                No vendemos esos datos, no los transferimos para publicidad, vigilancia o evaluación crediticia, ni los
                utilizamos para entrenar modelos de IA. Solo se procesan por la infraestructura necesaria para operar el
                acceso o cuando exista una necesidad de seguridad u obligación legal. Si se incorporan funciones que
                requieran otros datos de Google, explicaremos su finalidad y solicitaremos los permisos correspondientes
                antes de acceder a ellos.
              </p>
            </>
          )
        },
        {
          title: '8. Conservación y eliminación',
          content: (
            <>
              <p>
                Conservamos los datos de perfil y de la cuenta vinculada mientras mantienes tu cuenta para permitir el
                acceso al servicio. Al eliminarla, se eliminan el usuario, las cuentas de autenticación vinculadas
                —incluidos sus tokens almacenados—, las sesiones registradas y su pertenencia a los espacios de trabajo.
              </p>
              <p>
                Los contactos, conversaciones, campañas y otros registros comerciales pertenecen al espacio de trabajo
                de la empresa. Eliminar un usuario no elimina automáticamente esos registros. Para borrar datos
                personales que figuren en ellos, solicita su revisión al administrador del espacio o a nuestro correo de
                privacidad. Puede ser necesario resolver antes asignaciones de trabajo u otras relaciones que impidan
                eliminar la cuenta.
              </p>
              <p>
                Los datos necesarios para obligaciones legales, seguridad o resolución de reclamaciones pueden
                conservarse mientras subsista esa necesidad, con acceso limitado. La eliminación de la base activa no
                implica que todas las copias de seguridad y registros de los proveedores desaparezcan de inmediato:
                permanecen hasta su renovación o vencimiento conforme a sus ciclos de conservación. Puedes consultar el
                alcance de tu solicitud por email; no prometemos un plazo único para todos los tipos de datos.
              </p>
            </>
          )
        },
        {
          title: '9. Tus opciones y solicitudes',
          content: (
            <>
              <p>
                Puedes solicitar acceso, corrección, eliminación o una copia de tus datos, y plantear oposición o
                limitación del tratamiento cuando corresponda, escribiendo a{' '}
                <a href={`mailto:${publicSite.contactEmail}`}>{publicSite.contactEmail}</a>. Indica el correo de tu
                cuenta, la empresa y qué necesitas; podremos verificar tu identidad antes de actuar. No envíes
                contraseñas ni tokens.
              </p>
              <p>
                Para eliminar tu cuenta desde la aplicación, entra en{' '}
                <Link href='/settings/data-deletion'>Configuración → Eliminar datos</Link> y sigue la confirmación. Si
                no puedes acceder, usa el correo anterior. Las{' '}
                <Link href='/data-deletion'>instrucciones públicas de eliminación</Link> están disponibles sin iniciar
                sesión.
              </p>
              <p>
                Puedes cancelar la autorización de Google desde tu cuenta de Google. Los destinatarios de campañas
                pueden utilizar el enlace de baja del email para dejar de recibir esas comunicaciones del espacio de
                trabajo remitente.
              </p>
            </>
          )
        },
        {
          title: '10. Cookies y seguridad',
          content: (
            <>
              <p>
                Usamos cookies para mantener la sesión y proteger el acceso, y almacenamiento de preferencias para
                recordar opciones de interfaz. La aplicación no incorpora publicidad basada en los datos de Google.
                Bloquear las cookies necesarias puede impedir que inicies sesión.
              </p>
              <p>
                Aplicamos controles de acceso por usuario y empresa, protección de contraseñas mediante hash y
                comunicaciones HTTPS en el sitio de producción. Restringimos el acceso a las credenciales del servicio.
                Ningún sistema garantiza seguridad absoluta: protege tu cuenta y avísanos si detectas un acceso no
                autorizado.
              </p>
            </>
          )
        },
        {
          title: '11. Cambios a esta política',
          content: (
            <>
              <p>
                Publicaremos las actualizaciones en esta página con su fecha. Si cambia de forma sustancial el uso de
                datos de Google, informaremos a los usuarios y solicitaremos la autorización necesaria antes de utilizar
                esos datos para una finalidad nueva.
              </p>
              <p>
                Para cualquier consulta, contacta con Magnus Ecosystems en{' '}
                <a href={`mailto:${publicSite.contactEmail}`}>{publicSite.contactEmail}</a>.
              </p>
            </>
          )
        }
      ]}
    />
  </PublicSiteShell>
)

export default PrivacyPolicyPage
