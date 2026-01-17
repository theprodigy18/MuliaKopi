// import React from 'react'

import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import LoginAccess from "../components/utils/LoginAccess"

function VerifyAccount() {
    const apiURL = import.meta.env.VITE_API_URL
    const usersAPI = `${apiURL}/users`
    const { email, token } = useParams()
    const [success, setSuccess] = useState("")
    const [errMessage, setErrMessage] = useState("")

    useEffect(() => {
        axios.post(`${usersAPI}/post/auth/verify/new-account`, { email, token })
            .then(res => {
                if (res.data.success) {
                    setErrMessage("")
                    setSuccess(res.data.message)
                } else {
                    setSuccess("")
                    setErrMessage(res.data.message)
                }
            }).catch(() => {
                setErrMessage("Terjadi kesalahan saat verifikasi akun.")
            })
    }, [])


    const navigate = (path: string) => {
        window.location.href = path
    }

    return (
        <div className='authContainer'>
            {success && (
                <div className='authBox'>
                    <h1> {success} </h1>
                    <button className='authButton2' onClick={() => navigate("/auth/login")}> Kembali ke Login </button>
                </div>
            )}
            {errMessage && (
                <div className='authBox'>
                    <p> {errMessage} </p>
                    <button className='authButton2' onClick={() => navigate("/")}> Home </button>
                </div>
            )}
            <LoginAccess />
        </div>
    )
}

export default VerifyAccount
