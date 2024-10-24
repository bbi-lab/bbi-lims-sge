export const AuthService = {
    async loginUser(email, password, {event}) {
        const response = await $fetch(`http://localhost:3000/api/users/login`, {method: 'POST', body: { email, password }})
        return response
    },
}
