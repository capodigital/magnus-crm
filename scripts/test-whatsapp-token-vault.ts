import assert from 'node:assert/strict'

import { decryptMetaAccessToken, encryptMetaAccessToken, hasValidMetaEncryptionKey } from '@/lib/whatsapp/token-vault'

process.env.META_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')

assert.equal(hasValidMetaEncryptionKey(), true)

process.env.META_ENCRYPTION_KEY = 'not-a-valid-32-byte-key'
assert.equal(hasValidMetaEncryptionKey(), false)
process.env.META_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')

const plaintext = 'test-tenant-token'
const encrypted = encryptMetaAccessToken(plaintext)

assert.notEqual(encrypted.accessTokenCiphertext, plaintext)
assert.equal(decryptMetaAccessToken(encrypted), plaintext)

console.log('WhatsApp token vault checks passed.')
