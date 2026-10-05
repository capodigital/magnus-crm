export const formatEmbeddedSignupWabaVerificationError = (message: string) => {
  if (message.toLowerCase().includes('business_management')) {
    return (
      'Meta requiere acceso avanzado a business_management para verificar el WABA dentro del Business Portfolio. ' +
      'Vuelve a solicitar ese permiso en App Review y repite la conexión. ' +
      `Detalle de Meta: ${message}`
    )
  }

  return `No pudimos verificar el WABA dentro del Business Portfolio: ${message}`
}
