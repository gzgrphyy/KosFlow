// server/api/auth/login.post.ts
import { z } from 'zod'
import argon2 from 'argon2'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: 'Input tidak valid' })
    }

    const { email, password } = parsed.data

    // Rate limit berdasarkan IP + email supaya gak bisa brute force per akun
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
    const rateLimitKey = `${ip}:${email}`
    const rl = checkRateLimit(rateLimitKey)

    if (!rl.allowed) {
        const retrySeconds = Math.ceil((rl.retryAfterMs ?? 0) / 1000)
        throw createError({
            statusCode: 429,
            statusMessage: `Terlalu banyak percobaan login. Coba lagi dalam ${retrySeconds} detik.`,
        })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Selalu lakukan verify walau user gak ketemu, biar timing attack gak bisa dipakai
    // untuk menebak email mana yang terdaftar
    const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$dummy'
    const isValid = user
        ? await argon2.verify(user.passwordHash, password).catch(() => false)
        : await argon2.verify(dummyHash, password).catch(() => false)

    if (!user || !isValid) {
        if (user) {
            await writeAuditLog({
                userId: user.id,
                action: 'LOGIN_FAILED',
                entityType: 'User',
                entityId: user.id,
                metadata: { email, ip },
            })
        }
        throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
    }

    resetRateLimit(rateLimitKey)

    await setUserSession(event, {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        loggedInAt: Date.now(),
    })

    await writeAuditLog({
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        entityType: 'User',
        entityId: user.id,
        metadata: { ip },
    })

    return { success: true, user: { id: user.id, name: user.name, role: user.role } }
})