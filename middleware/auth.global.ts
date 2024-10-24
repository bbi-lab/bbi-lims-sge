export default defineNuxtRouteMiddleware(async (to, from) => {
    const { loggedIn, fetch } = useUserSession()

    await fetch()
    if (!loggedIn.value && to.path!='/login') {
      // if not logged in and not currently headed to login page, redirect there
      return navigateTo('/login')
    } else if (loggedIn.value && to.path=='/login') {
      // if already logged in and is headed to the login page, redirect to home
      // to prevent infinite redirect
      return navigateTo('/')
    } 
    return
  }
)
