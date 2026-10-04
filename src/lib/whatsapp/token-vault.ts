import 'server-only'

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import { WhatsappMetaApiError, getMetaAccessToken } from '@/lib/whatsapp/meta-client'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

export type EncryptedMetaAccessToken = {
  accessTokenCiphertext: string
  accessTokenIv: string
  accessTokenAuthTag: string
}

export type StoredMetaAccessToken = {
  accessTokenCiphertext?: string | null
  accessTokenIv?: string | null
  accessTokenAuthTag?: string | null
  accessTokenExpiresAt?: Date | null
}

const getEncryptionKey = () => {
  const encodedKey = process.env.META_ENCRYPTION_KEY?.trim()

  if (!encodedKey) {
    throw new WhatsappMetaApiError('META_ENCRYPTION_KEY no esta configurado en el servidor.', 503)
  }

  const key = Buffer.from(encodedKey, 'base64')

  if (key.length !== 32) {
    throw new WhatsappMetaApiError('META_ENCRYPTION_KEY debe ser una clave Base64 de 32 bytes.', 503)
  }

  return key
}

export const hasValidMetaEncryptionKey = () => {
  try {
    getEncryptionKey()

    return true
  } catch {
    return false
  }
}

export const encryptMetaAccessToken = (accessToken: string): EncryptedMetaAccessToken => {
  const normalizedToken = accessToken.trim()

  if (!normalizedToken) {
    throw new WhatsappMetaApiError('Meta no devolvio un token de acceso valido.', 502)
  }

  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(normalizedToken, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return {
    accessTokenCiphertext: ciphertext.toString('base64'),
    accessTokenIv: iv.toString('base64'),
    accessTokenAuthTag: authTag.toString('base64')
  }
}

export const decryptMetaAccessToken = (storedToken: StoredMetaAccessToken) => {
  if (!storedToken.accessTokenCiphertext || !storedToken.accessTokenIv || !storedToken.accessTokenAuthTag) {
    return null
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(storedToken.accessTokenIv, 'base64'))

    decipher.setAuthTag(Buffer.from(storedToken.accessTokenAuthTag, 'base64'))

    return Buffer.concat([
      decipher.update(Buffer.from(storedToken.accessTokenCiphertext, 'base64')),
      decipher.final()
    ]).toString('utf8')
  } catch {
    throw new WhatsappMetaApiError('No pudimos descifrar la credencial de WhatsApp de este workspace.', 503)
  }
}

export const resolveMetaAccessToken = (storedToken?: StoredMetaAccessToken | null) => {
  if (storedToken?.accessTokenExpiresAt && storedToken.accessTokenExpiresAt <= new Date()) {
    return getMetaAccessToken()
  }

  return decryptMetaAccessToken(storedToken ?? {}) ?? getMetaAccessToken()
}
