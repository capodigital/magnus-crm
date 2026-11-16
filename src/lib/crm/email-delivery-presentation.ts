// Provider diagnostics stay in the database; the CRM exposes operational messages only.
export function emailDeliveryNotice(delivery: { status: string; error: string | null }) {
  if (!delivery.error) return null
  if (delivery.status === 'SKIPPED')
    return 'No se envió: el contacto canceló la suscripción, cambió de email o no tiene consentimiento.'
  if (delivery.status === 'QUEUED' || delivery.status === 'PROCESSING')
    return 'El envío se ha retrasado. Se reintentará automáticamente.'
  if (delivery.status === 'FAILED') return 'No se pudo completar el envío. Contacta con soporte si necesitas ayuda.'

  return null
}
