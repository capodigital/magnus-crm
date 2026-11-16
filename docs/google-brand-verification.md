# Verificación de marca de Magnus CRM

Cambios locales del 16 de noviembre de 2026. La publicación y el reenvío a Google los realiza el propietario. La aprobación depende de Google; actualizar los textos no equivale a haber obtenido la verificación.

## Qué se corrigió

- `/` muestra la presentación de Magnus CRM para cualquier visitante, incluso con una sesión iniciada. El acceso al producto sigue en `/login` y `/home` permanece protegido.
- La portada explica clientes, leads, oportunidades, conversaciones de WhatsApp, agenda, campañas y borradores de texto con IA. Elimina textos de plantilla y promesas de funcionalidades futuras.
- La portada y la política explican que Google se usa para identificar la cuenta, con `openid email profile`. No se solicitan permisos de Gmail, Drive, Calendar ni contactos.
- La política detalla datos, finalidades, almacenamiento, proveedores, IA, conservación, revocación, eliminación y contacto público. No promete cifrado universal ni plazos de borrado que no estén implementados.
- Los términos prohíben imágenes íntimas no consentidas, incluidas las generadas con IA. La aplicación solo ofrece generación de texto comercial; no dispone de generación de imágenes.
- Contacto confirmado por el propietario: `magnusecosystems@gmail.com`. La identidad pública existente se conserva como Magnus Ecosystems; si debe figurar una razón social distinta, actualizarla antes de reenviar.

## Después de publicar

En Google Auth Platform → Branding, comprobar:

| Campo | Valor |
| --- | --- |
| Nombre de la aplicación | **Magnus CRM** |
| Correo de soporte | `magnusecosystems@gmail.com` |
| Página principal | `https://crm.magnusecosystems.com/` |
| Política de privacidad | `https://crm.magnusecosystems.com/privacy-policy` |
| Condiciones del servicio | `https://crm.magnusecosystems.com/terms-of-service` |
| Dominio autorizado | `magnusecosystems.com` |

La página principal es la raíz `/`, no `/login` ni `/home`. El callback del cliente OAuth sigue siendo `https://crm.magnusecosystems.com/api/auth/callback/google`; es un campo diferente. No hay nuevas variables de entorno.

Usar el mismo logotipo de Magnus CRM que aparece en la web. Confirmar la propiedad del dominio en Search Console con una cuenta autorizada para el proyecto. Revisar que Acceso a datos solo incluya los permisos de identidad realmente usados. No añadir scopes para funciones futuras.

Abrir las tres URLs en una ventana sin sesión y comprobar que muestran la versión actual sin pedir acceso ni mostrar una protección de Vercel. Verificar que el correo público funciona y que el contenido describe la operación real, incluidos los proveedores y la conservación de copias de seguridad. Después, reenviar la solicitud de verificación o responder al hilo del equipo revisor si así lo indicaron.

## Comprobaciones reproducibles

Con el servidor local en el puerto 3100: `npm run check:public-pages`. Comprueba HTML público, enlaces, texto de identidad, alcance de Google y protección de rutas privadas. Opcionalmente, iniciar servidor y comprobación con el mismo secreto local de prueba (`NEXTAUTH_SECRET` / `PUBLIC_SITE_TEST_SECRET`) para verificar la portada con un JWT sintético. No usar credenciales reales para esta prueba.

Después de publicar: `npm run check:public-pages -- https://crm.magnusecosystems.com/`. Solo hace lecturas públicas; no autentica ni modifica datos. Las comprobaciones automatizadas no sustituyen la revisión de Google.

## Mensaje para la revisión, después de verificar la publicación

> Actualizamos la web de Magnus CRM. La página principal https://crm.magnusecosystems.com/ es pública y explica la gestión de clientes, ventas, conversaciones y campañas. El nombre y el logotipo coinciden con la pantalla de consentimiento. La política de privacidad describe los datos recibidos de Google, su finalidad, almacenamiento, proveedores, conservación y eliminación. Google se utiliza únicamente para el registro y acceso mediante openid, email y profile; no solicitamos Gmail, Drive ni Calendar. La asistencia de IA genera borradores de texto comercial y no genera imágenes ni usa datos del acceso con Google para entrenar modelos. Prohibimos contenido íntimo no consentido. Solicitamos una nueva revisión.

## Referencias oficiales consultadas

- [Requisitos de la página principal](https://support.google.com/cloud/answer/13807376?hl=en)
- [Requisitos de la política de privacidad](https://support.google.com/cloud/answer/13806988?hl=en)
- [Identidad y marca](https://support.google.com/cloud/answer/13804963?hl=en)
- [Configuración de Branding](https://support.google.com/cloud/answer/15549049?hl=en)
- [Política de Datos de Usuario de Google](https://developers.google.com/terms/api-services-user-data-policy)
- [Condiciones de las APIs de Google](https://developers.google.com/terms)
