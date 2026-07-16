// server/api/tenants/index.post.ts
import { createTenantSchema } from '../../utils/validation/tenant'

export default defineEventHandler(async (event) => {
    const user = await requireAdminOrOwner(event)

    const body = await readBody(event)
    const parsed = createTenantSchema.safeParse(body)
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Input tidak valid',
            data: parsed.error.flatten(),
        })
    }

    const { fullName, phone, email, ktpNumber } = parsed.data

    // Enkripsi KTP sebelum simpan — nomor asli tidak pernah tersimpan plaintext
    const ktpEncrypted = encryptKtp(ktpNumber)

    const tenant = await prisma.tenant.create({
        data: {
            fullName,
            phone,
            email,
            ktpEncrypted,
        },
    })

    // Audit log: TANPA nomor KTP asli di metadata
    await writeAuditLog({
        userId: user.id,
        action: 'TENANT_CREATED',
        entityType: 'Tenant',
        entityId: tenant.id,
        metadata: { fullName, phone },
    })

    return {
        id: tenant.id,
        fullName: tenant.fullName,
        phone: tenant.phone,
        email: tenant.email,
        ktpMasked: maskKtp(ktpNumber),
        createdAt: tenant.createdAt,
    }
})
