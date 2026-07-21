export default defineNuxtRouteMiddleware(async (to) => {
    const { loggedIn, fetch } = useUserSession()
    await fetch()

    const publicRoutes = ['/login', '/', '/tentang', '/galeri', '/kamar', '/kontak']

    // Cek exact match atau prefix match (untuk dynamic routes seperti /kamar/:id)
    const isPublic = publicRoutes.some(route =>
        to.path === route || to.path.startsWith(route + '/')
    )

    if (!loggedIn.value && !isPublic) {
        return navigateTo('/login')
    }

    if (loggedIn.value && to.path === '/login') {
        return navigateTo('/')
    }
})