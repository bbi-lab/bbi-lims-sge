export const AuthService = {
    async loginUser(email: String, password: String) {
        try {
            const response = await $fetch(`/api/users/login`, {method: 'POST', body: { email, password }})
            return response
        } catch (err:any) {
            return {success: false, errorMessage: err.statusMessage || 'Login failed. Please check your credentials.'}
        }
    },

    async registerUser(name: String, email: String, password: String) {
        try {
            const response = await $fetch(`/api/users/register`, {method: 'POST', body: { name, email, password }})
            return response
        } catch (err:any) {
            return {success: false, errorMessage: err.statusMessage || 'Registration failed.'}
        }
    },
}
