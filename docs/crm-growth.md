# Ampliación del CRM — 13 de noviembre de 2026

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
| `/settings/integrations/email` | Estado de configuración de Resend e instrucciones para administradores. |

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

La conexión configurada a Neon devolvió `P1001` durante esta implementación. No se aplicaron cambios al entorno remoto. El esquema y la migración se validaron sobre PostgreSQL local mediante PGlite, sin diferencias al comparar el resultado con Prisma.

1. Restablecer la conexión de la base de datos y aplicar el esquema **antes** de publicar el nuevo código. La migración aditiva está en `prisma/migrations/20261113_crm_growth/migration.sql`.
2. Este repositorio ha sincronizado la base existente con `db push`. En ese entorno, ejecutar `npm run db:push` y después `npm run db:backfill:crm`. No aceptar pérdida de datos. El backfill conserva las etapas finales estándar y clasifica contactos con ventas ganadas; no concede consentimiento de marketing.
3. Usar `npm run db:migrate:deploy` solamente en una base con el historial de migraciones correctamente inicializado. El repositorio no contiene una migración inicial completa para crear una base vacía.
4. Configurar las variables de servidor indicadas abajo y un remitente de dominio verificado en Resend. No colocar claves en variables públicas ni en el navegador.
5. Programar una solicitud `GET /api/cron/email` cada minuto desde el scheduler del alojamiento, con `Authorization: Bearer <CRON_SECRET>`. El endpoint está implementado; el scheduler externo no se ha activado. Ajustar frecuencia y capacidad a los límites del alojamiento y la cuenta de Resend.
6. Después del despliegue, probar un envío real a un contacto interno autorizado, verificar su recepción y probar la baja antes de activar campañas para clientes.

| Variable | Uso |
| --- | --- |
| `RESEND_API_KEY` | Credencial de servidor para enviar mediante Resend. |
| `RESEND_FROM_EMAIL` | Remitente verificado, compartido por esta instalación del CRM. |
| `NEXT_PUBLIC_APP_URL` | URL pública HTTPS para los enlaces de baja. |
| `CRON_SECRET` | Autorización del procesador de emails. |
| `OPENAI_API_KEY` | Generación opcional de propuestas. |
| `OPENAI_MODEL` | Modelo habilitado en la cuenta y compatible con Responses. |

El transporte sigue [Send Email de Resend](https://resend.com/docs/api-reference/emails/send-email). La IA utiliza [Responses de OpenAI](https://developers.openai.com/api/reference/resources/responses/methods/create) con `store: false`. No se configuraron ni probaron claves reales de ninguno de estos proveedores.

## Verificación reproducible

- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/eslint/bin/eslint.js . --ext .js,.jsx,.ts,.tsx`
- `npm run build`
- `npm run test:whatsapp-embedded-signup`
- `npm run test:whatsapp-token-vault`
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
