//import router from '@/router'
//import axios from 'axios'
import { defineStore } from 'pinia'

//const baseUrl = `${import.meta.env.VITE_API_URL}/api/user`

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(useCookie('user').value || '{}'),
        returnUrl: null
    }),
    actions: {
        async login(email, password) {
            //const response = await axios.post(`${baseUrl}/login`, { email, password })

            // update pinia state
            this.user = response?.data || null

            // store user details and jwt in local storage to keep user logged in between page refreshes
            useCookie('user').value = JSON.stringify(response.data)

            // redirect to previous url or default to home page
            //router.push(this.returnUrl || '/')
        },
        async refresh() {
            //const response = await axios.get(`${baseUrl}/refresh`)

            // update pinia state
            this.user = response?.data || null

            // store user details and jwt in local storage to keep user logged in between page refreshes
            useCookie('user').value = JSON.stringify(response.data)

            return response.data
        },
        logout() {
            this.user = null
            useCookie('user').value = null
            //router.push('/auth/login')
        }
    }
})
