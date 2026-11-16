export function safeCallbackPath(value: unknown) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\s\u0000-\u001f]/.test(value)
  )
    return '/home'

  try {
    const url = new URL(value, 'https://crm.invalid')

    if (
      url.origin !== 'https://crm.invalid' ||
      url.pathname.startsWith('//') ||
      /^\/(?:login|register|onboarding|api)(?:\/|$)/i.test(url.pathname)
    )
      return '/home'

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/home'
  }
}

export function authErrorMessage(code: unknown) {
  if (!code) return null
  if (code === 'OAuthAccountNotLinked')
    return 'Ya existe una cuenta con este correo. Entra con tu contraseña y vincula Google desde Configuración para conservar tu espacio de trabajo.'
  if (code === 'GoogleAccountMismatch')
    return 'Selecciona la cuenta de Google que utiliza el mismo correo que tu cuenta de Magnus CRM.'
  if (code === 'AccessDenied')
    return 'No se completó el acceso con Google. Usa una cuenta con correo verificado e inténtalo de nuevo.'

  return 'No pudimos completar el acceso. Inténtalo de nuevo o entra con tu correo y contraseña.'
}
