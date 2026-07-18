// server/utils/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
    const hex = process.env.KTP_ENCRYPTION_KEY
    if (!hex || hex.length !== 64) {
        throw new Error('KTP_ENCRYPTION_KEY harus 32-byte hex (64 karakter) di .env')
    }
    return Buffer.from(hex, 'hex')
}

/**
 * Enkripsi nomor KTP.
 * Format output buffer: [IV 12 byte][AuthTag 16 byte][ciphertext]
 */
export function encryptKtp(plaintext: string): Buffer {
    const key = getKey()
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, key, iv)

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted])
}

/**
 * Dekripsi buffer KTP yang dihasilkan oleh encryptKtp().
 */
export function decryptKtp(buf: Uint8Array): string {
    const key = getKey()
    const iv = Buffer.from(buf.subarray(0, IV_LENGTH))
    const authTag = Buffer.from(buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH))
    const ciphertext = Buffer.from(buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH))

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8')
}

/**
 * Masking KTP: tampilkan 4 digit pertama dan 4 digit terakhir.
 * Contoh: "3273456789010001" → "3273********0001"
 */
export function maskKtp(plain: string): string {
    if (plain.length < 8) return '****'
    return plain.slice(0, 4) + '*'.repeat(plain.length - 8) + plain.slice(-4)
}
