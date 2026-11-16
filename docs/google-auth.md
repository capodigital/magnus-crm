# Acceso y registro con Google

## Configuración de producción

En `.env` para desarrollo y en Vercel → Settings → Environment Variables → Production para producción:

```dotenv
GOOGLE_CLIENT_ID=tu_cliente.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_secreto_de_google
NEXTAUTH_URL=https://crm.magnusecosystems.com
NEXT_PUBLIC_APP_URL=https://crm.magnusecosystems.com
```

Conservar el `NEXTAUTH_SECRET` existente. Las credenciales no llevan prefijo `NEXT_PUBLIC_`. Los cambios en Vercel requieren un nuevo despliegue. No se modificaron las variables reales ni se realizó un despliegue durante esta implementación.

En Google Auth Platform:

| Pantalla / campo | Valor |
| --- | --- |
| Branding: nombre | Magnus CRM |
| Correo de soporte / contacto del desarrollador | Correo operativo del equipo |
| Audiencia | Externa, para admitir usuarios de otras empresas y Gmail |
| Dominio autorizado | `magnusecosystems.com` |
| Página principal | `https://crm.magnusecosystems.com` |
| Privacidad | `https://crm.magnusecosystems.com/privacy-policy` |
| Condiciones | `https://crm.magnusecosystems.com/terms-of-service` |
| Cliente: tipo de aplicación | Aplicación web |
| Cliente: nombre | Magnus CRM |
| Origen JavaScript autorizado | `https://crm.magnusecosystems.com` |
| URI de redirección autorizada | `https://crm.magnusecosystems.com/api/auth/callback/google` |
| Acceso a datos / scopes solicitados | `openid`, `email`, `profile` |

La URI de redirección debe coincidir exactamente, sin barra final. En modo de prueba, agregar los correos autorizados como usuarios de prueba; publicar la aplicación de Google para abrirla a clientes, completando lo que solicite su consola.

Para desarrollo con puerto 3000, usar `http://localhost:3000` en las dos variables de URL; agregar ese origen y `http://localhost:3000/api/auth/callback/google` al cliente OAuth. Si se usa 3100 u otro puerto, reemplazarlo en las cuatro ubicaciones.

Referencias: [Google en NextAuth v4](https://next-auth.js.org/providers/google), [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [vinculación de cuentas](https://next-auth.js.org/configuration/providers/oauth).

## Comportamiento

- Login y registro ofrecen **Continuar con Google**; el usuario no tiene que elegir ni configurar proveedores técnicos.
- Google identifica la cuenta mediante su identificador estable `sub`. Se exige `email_verified: true`; se utilizan las comprobaciones de firma de OpenID Connect, PKCE, state y nonce de NextAuth.
- Una cuenta nueva pasa a `/onboarding`, donde introduce su empresa y acepta las condiciones. El servidor crea empresa, branding, membresía OWNER y pipeline con las cinco etapas iniciales en una transacción. El usuario no recibe una contraseña artificial.
- El registro concurrente se serializa por usuario para evitar espacios duplicados. La identidad se obtiene de la sesión, nunca del cuerpo enviado por el navegador.
- Cuentas que ya tienen membresía vuelven a su destino; no se reemplazan ni se conceden permisos adicionales. Un espacio suspendido no se sustituye por uno nuevo mediante este flujo.
- Una cuenta registrada con contraseña debe entrar primero con esa contraseña y vincular Google en **Configuración → Acceso con Google**. Se requiere el mismo email. No se fusionan cuentas automáticamente por coincidencia de correo.
- Los errores de OAuth se muestran en español, sin secretos ni detalles internos. La ausencia de credenciales muestra disponibilidad temporal, no instrucciones de configuración al cliente.
- La creación del espacio es compartida con el registro por contraseña. No se requiere migración de base de datos.

## Verificación

- `npm run test:auth:google`, con `DATABASE_URL` local: identidad verificada, redirecciones, opciones OAuth, creación transaccional, concurrencia, conservación de membresías y registro por contraseña.
- `npm run test:crm:http`, contra app y base locales: acceso autenticado, origen, rechazo de onboarding sin Google, términos y aislamiento de identidad en el endpoint.
- TypeScript, ESLint y compilación de producción.
- Prueba real pendiente después de configurar el cliente: registro con una cuenta nueva, entrada posterior, vinculación de una cuenta con contraseña y cancelación del consentimiento. Las pruebas automáticas no completan el consentimiento ni el intercambio de códigos real de Google.
