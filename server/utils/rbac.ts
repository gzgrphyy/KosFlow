// server/utils/rbac.ts
import type { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
    const session = await getUserSession(event)
    if (!session.user) {
        throw createError({ statusCode: 401, statusMessage: 'Belum login' })
    }
    return session.user
}

export async function requireOwner(event: H3Event) {
    const user = await requireAuth(event)
    if (user.role !== 'OWNER') {
        throw createError({ statusCode: 403, statusMessage: 'Hanya Owner yang boleh akses ini' })
    }
    return user
}

export async function requireAdminOrOwner(event: H3Event) {
    const user = await requireAuth(event)
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
        throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
    }
    return user
}