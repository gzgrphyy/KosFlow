// server/utils/audit.ts
import type { H3Event } from 'h3'

export async function writeAuditLog(params: {
    userId: string
    action: string
    entityType: string
    entityId: string
    metadata?: Record<string, unknown>
}) {
    await prisma.auditLog.create({
        data: {
            userId: params.userId,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            metadata: (params.metadata ?? {}) as object,
        },
    })
}