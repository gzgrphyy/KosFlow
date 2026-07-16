// middleware/owner.ts
export default defineNuxtRouteMiddleware(() => {
    const { user } = useUserSession()

    if (user.value?.role !== 'OWNER') {
        return abortNavigation('Halaman ini khusus Owner')
    }
})