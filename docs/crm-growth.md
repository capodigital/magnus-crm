# Ampliación del CRM — 13 de noviembre de 2026

## Navegación y modelos — actualización del 16 de noviembre

- Inicio incluye accesos a Crear cliente, Crear lead, Interacciones y Campañas. La barra de secciones permanece visible en las páginas del CRM y Marketing tiene un grupo propio en el menú.
- Clientes: Nuevo cliente crea una relación CUSTOMER; Nuevo contacto crea un PROSPECT. Al guardar se abre su ficha. En móvil se muestran tarjetas con accesos directos a la ficha, chats, propuestas e interacciones.
- Leads/Oportunidades: alta manual con creación de un contacto dentro del mismo formulario, conservando los datos del negocio.
- La ficha tiene pestañas enlazables por ?tab=info|chats|proposals|timeline|deals. Interacciones ofrece accesos para registrar cada tipo de actividad. Inicio y conversaciones también permiten abrir la ficha.
- Campañas y automatizaciones permiten solicitar un borrador de email y aplicarlo al campo Mensaje después de revisarlo. Generar no guarda una campaña ni activa un envío.
- La IA está integrada directamente en propuestas y emails. La interfaz no muestra claves configuradas, modelos, proveedores ni instrucciones técnicas; la selección y la conexión se gestionan internamente.

### Selección automática de IA

| Acción | Predeterminado | Razonamiento |
| --- | --- | --- |
| Email de campaña o automatización | gpt-6-luna | low |
| Propuesta comercial | gpt-6.1-sol | medium |
| Perfil avanzado interno (sin selector público) | gpt-6-astra | medium |

Esta asignación es una recomendación para el CRM basada en el [catálogo actual de OpenAI](https://developers.openai.com/api/docs/models) y su [guía de selección](https://developers.openai.com/api/docs/guides/model-selection), consultados el 16 de noviembre de 2026. La calidad debe evaluarse con ejemplos comerciales propios. No se verificó el acceso real de la cuenta a estos modelos ni se realizaron inferencias facturadas.

El equipo técnico puede sobrescribir cada ruta mediante OPENAI_MODEL_EMAIL y OPENAI_MODEL_PROPOSAL. En su ausencia se respeta OPENAI_MODEL si estaba configurado; después se usa el valor recomendado. El perfil advanced y OPENAI_MODEL_ADVANCED se reservan para llamadas internas explícitas; no se activan desde la interfaz. Las acciones públicas ignoran cualquier modelo o modo enviado por el cliente y usan la selección automática del servidor. Las credenciales y la selección efectiva no se incluyen en las propiedades de los componentes ni en las respuestas públicas de borradores. Las respuestas incompletas se rechazan; los borradores de email requieren rol OWNER/ADMIN y validación de origen.

### Estado del dominio publicado

La inspección autenticada y Vercel CLI confirmaron que crm.magnusecosystems.com sirve un despliegue del **12 de octubre de 2026**, anterior a esta ampliación. La base configurada ya responde y su esquema coincide con Prisma (diff vacío); no se aplicaron migraciones en esta revisión. Las credenciales nuevas existen localmente, pero no aparecen en la lista de variables de producción de Vercel. El usuario decidió conservar los cambios locales y encargarse de la publicación; no se realizó ningún despliegue ni configuración remota.

La vinculación local con Vercel regeneró automáticamente .env.local. Se eliminó su token OIDC temporal y se repusieron las tres variables de WhatsApp utilizando los valores ya existentes en .env. No se conservaron los valores exactos de los overrides anteriores; .env no se modificó. No se cambiaron variables remotas.

## Funciones implementadas

| Sección | Comportamiento |
| --- | --- |
| `/contacts` | Directorio paginado, búsqueda, relación cliente/prospecto/inactivo, etiquetas, empresa, alta y edición. |
| `/contacts/[id]` | Información, chats de WhatsApp, timeline, tareas, recordatorios, negocios y propuestas editables. |
| `/leads` y `/opportunities` | Gestión separada; conversión cambiando el tipo, responsables, puntuación, importe, moneda, cierre estimado y estado. |
| `/pipeline` | Pipelines y etapas editables, colores, resultados de cierre y movimiento de negocios mediante selector. |
| `/activities` | Historial paginado y agenda pendiente; completar o reabrir reuniones, tareas y recordatorios. |
| `/campaigns` | Borradores, segmentación por relación/etiqueta/origen, vista previa, programación, pausa y reanudación. |
| `/automations` | Emails al crear un contacto desde el CRM o al cambiar la etapa de un negocio, con demora configurable. |
| `/settings/integrations/email` | Explicación de campañas y seguimiento, con accesos a campañas y automatizaciones. |

Los registros existentes de `Lead` conservan su clasificación de oportunidad. Los nuevos leads recibidos por WhatsApp se clasifican como `LEAD`. Una venta ganada clasifica al contacto como cliente. Los cambios de etapa generan una nota en su timeline. Las etapas de cierre determinan Ganado/Perdido; mover un negocio existente a otra etapa abierta lo reabre, salvo que se archive explícitamente.

Las propuestas de IA son borradores guardados para revisión. El usuario puede redactar, editar o generar una propuesta indicando un objetivo. La generación usa nombre, empresa, notas, últimos negocios e interacciones; no envía la propuesta al contacto.

## Datos, autorización y envíos

- Todas las lecturas y mutaciones del CRM se limitan al espacio activo y validan contactos, etapas y responsables de ese espacio.
- `VIEWER` solo consulta. `OWNER` y `ADMIN` gestionan campañas y automatizaciones. Los demás roles con escritura gestionan contactos, ventas y actividades.
- Las mutaciones rechazan orígenes ajenos. Los cambios de negocios usan versión y transacciones para detectar ediciones concurrentes.
- Los segmentos combinan sus filtros con AND. Exigen email, consentimiento de marketing y ausencia de baja. La programación fija la audiencia y el contenido personalizado de cada destinatario.
- La cola guarda remitente, destinatario, contenido y URL pública para mantener el mismo payload durante los reintentos. Revalida consentimiento y email antes de enviar. Cada envío utiliza una clave de idempotencia estable de Resend. Se detienen reintentos después de 23 horas desde el primer intento, antes del vencimiento de la ventana de idempotencia del proveedor. [Referencia oficial de Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).
- Los emails incluyen cancelación de suscripción. GET muestra confirmación; POST realiza la baja, incluido el encabezado de baja con un clic. La baja impide la reactivación desde la ficha.
- Los envíos en curso pueden finalizar después de pausar. Las reglas pausadas conservan su cola; al reactivarlas puede continuar. Editar una regla modifica futuros eventos, no los mensajes ya en cola.
- `SENT` significa aceptado por Resend. No se presentan estadísticas de entrega, apertura o clics sin webhooks del proveedor.
- El worker toma hasta 20 mensajes y deja de iniciar nuevos envíos después de 40 segundos; su límite de ejecución es 60 segundos. Los fallos transitorios se reintentan con espera y un máximo de cinco intentos. Se recuperan bloqueos abandonados tras cinco minutos.

## Activación

La conexión a Neon devolvió `P1001` en la implementación inicial del 13 de noviembre. El 16 de noviembre se verificó nuevamente y el esquema remoto configurado ya coincide con Prisma; no se necesitaron ni aplicaron cambios. El esquema y la migración se validaron sobre PostgreSQL local mediante PGlite, sin diferencias al comparar el resultado con Prisma.

1. Verificar que el despliegue utiliza la misma base de datos revisada. Su esquema ya coincidía con Prisma el 16 de noviembre; no requiere repetir cambios de esquema. Si se publica contra otra base, verificar y aplicar el esquema **antes** de publicar el nuevo código. La migración aditiva está en `prisma/migrations/20261113_crm_growth/migration.sql`.
2. Este repositorio ha sincronizado la base existente con `db push`. Si el esquema no está actualizado, ejecutar `npm run db:push` sin aceptar pérdida de datos. Verificar si ya se ejecutó `npm run db:backfill:crm` y ejecutarlo si falta. El backfill conserva las etapas finales estándar y clasifica contactos con ventas ganadas; no concede consentimiento de marketing. No se ejecutó remotamente durante esta revisión.
3. Usar `npm run db:migrate:deploy` solamente en una base con el historial de migraciones correctamente inicializado. El repositorio no contiene una migración inicial completa para crear una base vacía.
4. Configurar las variables de servidor indicadas abajo y un remitente de dominio verificado en Resend. No colocar claves en variables públicas ni en el navegador.
5. Programar una solicitud `GET /api/cron/email` cada minuto desde el scheduler del alojamiento, con `Authorization: Bearer <CRON_SECRET>`. El endpoint está implementado; el scheduler externo no se ha activado. Ajustar frecuencia y capacidad a los límites del alojamiento y la cuenta de Resend.
6. Después del despliegue, probar un envío real a un contacto interno autorizado, verificar su recepción y probar la baja antes de activar campañas para clientes.

| Variable | Uso |
| --- | --- |
| `RESEND_API_KEY` | Credencial de servidor para enviar mediante Resend. |
| `RESEND_FROM_EMAIL` | Remitente verificado, compartido por esta instalación del CRM. |
| `NEXT_PUBLIC_APP_URL` | `https://crm.magnusecosystems.com`, para los enlaces de baja. |
| `CRON_SECRET` | Autorización del procesador de emails. |
| `OPENAI_API_KEY` | Generación opcional de propuestas y borradores de emails. |
| `OPENAI_MODEL` | Alternativa común opcional para instalaciones existentes. |
| `OPENAI_MODEL_EMAIL` | Modelo para emails; por defecto gpt-6-luna. |
| `OPENAI_MODEL_PROPOSAL` | Modelo para propuestas; por defecto gpt-6.1-sol. |
| `OPENAI_MODEL_ADVANCED` | Perfil interno avanzado, sin selector público; por defecto gpt-6-astra. |

El transporte sigue [Send Email de Resend](https://resend.com/docs/api-reference/emails/send-email). La IA utiliza [Responses de OpenAI](https://developers.openai.com/api/reference/resources/responses/methods/create) con `store: false`. Las claves locales estaban configuradas durante la revisión del 16 de noviembre; no se imprimieron ni se probaron con envíos o inferencias reales.

## Verificación reproducible

- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/eslint/bin/eslint.js . --ext .js,.jsx,.ts,.tsx`
- `npm run build`
- `npm run test:whatsapp-embedded-signup`
- `npm run test:whatsapp-token-vault`
- `npm run test:crm:ai` verifica selección interna, overrides, solicitudes, validación y fallos de IA con fetch simulado; comprueba que los borradores públicos no expongan modelos y que los errores públicos no incluyan detalles del proveedor.
- `npm run test:crm` con `DATABASE_URL` apuntando a PostgreSQL **local aislado**, después de crear su esquema. Rechaza bases remotas, crea dos espacios temporales, simula Resend/OpenAI y limpia sus fixtures.
- `npm run test:crm:http` con una app local en `CRM_TEST_URL` (por defecto `http://localhost:3100`) y la misma `DATABASE_URL` local. Verifica autenticación, roles, origen, aislamiento y persistencia mediante HTTP.

Para reproducir PostgreSQL temporal sin instalar un servicio del sistema se utilizó `npx --yes --package=@electric-sql/pglite-socket@0.2.11 pglite-server --port=55440 --host=127.0.0.1 --max-connections=20`. La app de pruebas debe arrancarse con esa conexión local, nunca con la base remota. No es una dependencia de producción.

La revisión visual autenticada utilizó fixtures locales en escritorio y a 390 px de ancho: directorio, ficha, chats, propuestas, alta de oportunidad, cambio de etapa, registro de llamada, tarea completada, segmentación y automatizaciones. Se corrigieron identificadores de formulario para evitar discrepancias de hidratación. No hubo nuevos errores de consola en las vistas verificadas tras la corrección ni desbordamiento horizontal del documento en la ficha móvil.

## Límites explícitos

- Se registran llamadas y reuniones; no se integró telefonía ni un calendario externo. Registrar un email manual añade una actividad, no envía un correo.
- Los chats corresponden a WhatsApp, con acceso directo a la conversación existente; Resend no añade una bandeja de correo entrante.
- Directorios, ventas y agenda: 25 registros por página. Pipeline: últimos 200 negocios abiertos. Ficha: últimas 100 actividades, 100 emails, 100 negocios, 30 propuestas y 20 chats con 30 mensajes por chat. Marketing: últimas 100 campañas/reglas y 50 envíos; hasta 5000 destinatarios por campaña.
- Las automatizaciones responden a las altas y cambios gestionados por los nuevos servicios del CRM. No se ejecutan retroactivamente ni reaccionan a escrituras externas directas en la base.
- Las claves de Resend y OpenAI y el remitente son de la instalación; no se añadió un almacén de credenciales por empresa.
