// server/api/auth/register.post.ts
import { z } from 'zod'
import argon2 from 'argon2'

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(72), // argon2 limit input 72 byte
    role: z.enum(['OWNER', 'ADMIN']).default('ADMIN'),
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: 'Input tidak valid', data: parsed.error.flatten() })
    }

    const { name, email, password, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
    }

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456, // 19 MiB, rekomendasi OWASP
        timeCost: 2,
        parallelism: 1,
    })

    const user = await prisma.user.create({
        data: { name, email, passwordHash, role },
    })

    await writeAuditLog({
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        metadata: { role },
    })

    return { success: true, userId: user.id }
})