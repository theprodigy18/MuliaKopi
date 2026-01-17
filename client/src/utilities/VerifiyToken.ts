import axios from "axios"
import type { Admin, User } from "../interface/Interface"

const apiURL = import.meta.env.VITE_API_URL
const usersAPI = `${apiURL}/users`
const adminAPI = `${apiURL}/admin`

export async function VerifyToken(setUserData: (user: User) => void, backOnFail: boolean = false) {
    const token = localStorage.getItem('token')

    if (token) {
        const res = (await axios.get(`${usersAPI}/get/auth/verify/token`, {
            headers: { Authorization: `Bearer ${token}` }
        })).data

        if (res.success) setUserData(res.user)
        else {
            localStorage.removeItem('token')
            if (backOnFail) window.location.href = "/"
        }

        return (res.user ?? null)
    }
    else if (backOnFail) window.location.href = "/"
    return null
}

export async function VerifyTokenAdmin(setAdminData: (admin: Admin) => void) {
    const token = localStorage.getItem('token-admin')

    if (!token) {
        window.location.href = "/admin/auth/login"
        return
    }

    const res = (await axios.get(`${adminAPI}/get/auth/verify/token`, {
        headers: { Authorization: `Bearer ${token}` }
    })).data

    if (res.success) setAdminData(res.admin)
    else {
        localStorage.removeItem('token-admin')
        window.location.href = "/admin/auth/login"
    }
}