// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)

    if (session.user) {
        await writeAuditLog({
            userId: session.user.id,
            action: 'LOGOUT',
            entityType: 'User',
            entityId: session.user.id,
        })
    }

    await clearUserSession(event)
    return { success: true }
})