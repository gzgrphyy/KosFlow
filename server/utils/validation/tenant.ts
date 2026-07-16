// server/utils/validation/tenant.ts
import { z } from 'zod'

export const createTenantSchema = z.object({
    fullName: z.string().min(1, 'Nama wajib diisi').max(100),
    phone: z.string().min(8, 'Nomor HP minimal 8 digit').max(20),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')).transform(v => v || undefined),
    ktpNumber: z
        .string()
        .length(16, 'Nomor KTP harus 16 digit')
        .regex(/^\d{16}$/, 'Nomor KTP harus berupa 16 angka'),
})

export const updateTenantSchema = z.object({
    fullName: z.string().min(1).max(100).optional(),
    phone: z.string().min(8).max(20).optional(),
    email: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
    // ktpNumber opsional — kalau tidak dikirim, KTP lama tidak berubah
    ktpNumber: z
        .string()
        .length(16, 'Nomor KTP harus 16 digit')
        .regex(/^\d{16}$/, 'Nomor KTP harus berupa 16 angka')
        .optional(),
})

export const tenantIdParamSchema = z.object({
    id: z.string().min(1, 'ID tenant diperlukan'),
})
