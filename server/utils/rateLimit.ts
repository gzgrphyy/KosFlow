// server/utils/rateLimit.ts
interface AttemptRecord {
    count: number
    firstAttempt: number
}

const attempts = new Map<string, AttemptRecord>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 menit

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now()
    const record = attempts.get(key)

    if (!record) {
        attempts.set(key, { count: 1, firstAttempt: now })
        return { allowed: true }
    }

    if (now - record.firstAttempt > WINDOW_MS) {
        // window sudah lewat, reset
        attempts.set(key, { count: 1, firstAttempt: now })
        return { allowed: true }
    }

    if (record.count >= MAX_ATTEMPTS) {
        return { allowed: false, retryAfterMs: WINDOW_MS - (now - record.firstAttempt) }
    }

    record.count++
    return { allowed: true }
}

export function resetRateLimit(key: string) {
    attempts.delete(key)
}