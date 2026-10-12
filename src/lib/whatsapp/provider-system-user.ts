export type ProviderSystemUserConfiguration = {
  systemUserId: string
  systemUserToken: string
}

export const getProviderSystemUserConfiguration = (
  env: Record<string, string | undefined> = process.env
): ProviderSystemUserConfiguration | null => {
  const systemUserId = env.META_SYSTEM_USER_ID?.trim() ?? ''
  const systemUserToken = env.META_SYSTEM_USER_ACCESS_TOKEN?.trim() ?? ''

  if (!systemUserId && !systemUserToken) return null

  if (!systemUserId || !systemUserToken) {
    throw new Error(
      'Para asignar el System User del proveedor debes configurar META_SYSTEM_USER_ID y META_SYSTEM_USER_ACCESS_TOKEN juntos.'
    )
  }

  if (!/^\d{6,32}$/.test(systemUserId)) {
    throw new Error('META_SYSTEM_USER_ID no tiene un formato válido.')
  }

  return {
    systemUserId,
    systemUserToken
  }
}
