export const WHATSAPP_REPLY_WINDOW_HOURS = 24
export const WHATSAPP_REPLY_WINDOW_MS = WHATSAPP_REPLY_WINDOW_HOURS * 60 * 60 * 1000

export type WhatsappReplyWindow = {
  lastInboundAt: Date | null
  expiresAt: Date | null
  isOpen: boolean
  remainingMs: number
}

export const getWhatsappReplyWindow = (lastInboundAt: Date | null, now = new Date()): WhatsappReplyWindow => {
  if (!lastInboundAt) {
    return {
      lastInboundAt: null,
      expiresAt: null,
      isOpen: false,
      remainingMs: 0
    }
  }

  const expiresAt = new Date(lastInboundAt.getTime() + WHATSAPP_REPLY_WINDOW_MS)
  const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime())

  return {
    lastInboundAt,
    expiresAt,
    isOpen: remainingMs > 0,
    remainingMs
  }
}

export const getWhatsappReplyWindowFromIso = (lastInboundAt: string | null, now = Date.now()) => {
  if (!lastInboundAt) return getWhatsappReplyWindow(null, new Date(now))

  const parsedLastInboundAt = new Date(lastInboundAt)

  if (Number.isNaN(parsedLastInboundAt.getTime())) return getWhatsappReplyWindow(null, new Date(now))

  return getWhatsappReplyWindow(parsedLastInboundAt, new Date(now))
}

export const formatReplyWindowRemaining = (remainingMs: number) => {
  const totalMinutes = Math.max(0, Math.floor(remainingMs / 60000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days) return `${days} d ${hours} h`
  if (hours) return `${hours} h ${minutes} min`

  return `${minutes} min`
}
