export default defineNuxtRouteMiddleware(async (to) => {
    const { loggedIn, fetch } = useUserSession()
    await fetch()

    const publicRoutes = ['/login']

    if (!loggedIn.value && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }

    if (loggedIn.value && to.path === '/login') {
        return navigateTo('/')
    }
})