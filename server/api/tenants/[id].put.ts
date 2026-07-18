// server/api/tenants/[id].put.ts
import { updateTenantSchema } from '../../utils/validation/tenant'

export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID tenant tidak valid' })

    const body = await readBody(event)
    const parsed = updateTenantSchema.safeParse(body)
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Input tidak valid',
            data: parsed.error.flatten(),
        })
    }

    const existing = await prisma.tenant.findUnique({ where: { id } })
    if (!existing) {
        throw createError({ statusCode: 404, statusMessage: 'Tenant tidak ditemukan' })
    }

    const { ktpNumber, ...rest } = parsed.data

    // Jika ktpNumber tidak dikirim → pakai ktpEncrypted lama, tidak ada perubahan
    // Jika dikirim → enkripsi ulang
    const updateData: Record<string, unknown> = { ...rest }
    if (ktpNumber !== undefined) {
        updateData.ktpEncrypted = encryptKtp(ktpNumber)
    }

    const updated = await prisma.tenant.update({
        where: { id },
        data: updateData,
    })

    // Audit log tanpa KTP asli
    const metadataChanged: Record<string, unknown> = {}
    if (rest.fullName) metadataChanged.fullName = rest.fullName
    if (rest.phone) metadataChanged.phone = rest.phone
    if (rest.email !== undefined) metadataChanged.email = rest.email
    if (ktpNumber !== undefined) metadataChanged.ktpUpdated = true // hanya flag, bukan nomor asli

    await writeAuditLog({
        userId: user.id,
        action: 'TENANT_UPDATED',
        entityType: 'Tenant',
        entityId: id,
        metadata: metadataChanged,
    })

    return {
        id: updated.id,
        fullName: updated.fullName,
        phone: updated.phone,
        email: updated.email,
        ktpMasked: maskKtp(decryptKtp(updated.ktpEncrypted)),
        updatedAt: updated.updatedAt,
    }
})
