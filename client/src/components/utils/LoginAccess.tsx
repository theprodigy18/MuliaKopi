// import React from 'react'

import { useEffect, useState } from "react"
import Loading from "../Loading"
import axios from "axios"

function LoginAccess() {
    const apiURL = import.meta.env.VITE_API_URL
    const usersAPI = `${apiURL}/users`
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem('token')

            if (token) {
                const res = (await axios.get(`${usersAPI}/get/auth/verify/token`, {
                    headers: { Authorization: `Bearer ${token}` }
                })).data

                if (res.success) window.location.href = "/"
                else localStorage.removeItem('token')
            }

            setLoading(false)
        }

        fetchData();
    }, [])

    if (loading) return <Loading />

    return null
}

export default LoginAccess
