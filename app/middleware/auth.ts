// app/middleware/auth.ts
// Named middleware untuk melindungi halaman admin.
// Didaftarkan via definePageMeta({ middleware: 'auth' }) di setiap halaman admin.
// Validasi: hanya user dengan role ADMIN atau OWNER yang bisa mengakses dashboard.
export default defineNuxtRouteMiddleware(async (to) => {
    const { loggedIn, user, fetch } = useUserSession()
    await fetch()

    const publicRoutes = ['/login', '/', '/tentang', '/galeri', '/kamar', '/kontak']

    // Cek exact match atau prefix match (untuk dynamic routes seperti /kamar/:id)
    const isPublic = publicRoutes.some(route =>
        to.path === route || to.path.startsWith(route + '/')
    )

    // Kalau route public, izinkan akses tanpa login
    if (isPublic) {
        return
    }

    // Kalau belum login, redirect ke login
    if (!loggedIn.value) {
        return navigateTo('/login')
    }

    // Validasi role: hanya ADMIN atau OWNER yang boleh akses halaman admin/dashboard
    if (user.value?.role !== 'ADMIN' && user.value?.role !== 'OWNER') {
        return abortNavigation('Akses ditolak. Halaman ini khusus untuk Admin.')
    }

})
