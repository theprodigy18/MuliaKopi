// import React from 'react'

import { useEffect, useRef, useState } from "react";
import type { User } from "../interface/Interface";
import { VerifyToken } from "../utilities/VerifiyToken";
import Header from "../components/Header"
import Webcam from 'react-webcam'
import Loading from "../components/Loading";
import { closeLoading, showError, showLoading, showSuccessDialog } from "../utilities/Alert";
import axios from "axios";

function ScanMood() {
    const apiURL = import.meta.env.VITE_API_URL
    const scanMoodAPI = `${apiURL}/scan-mood`
    const webcamRef = useRef<Webcam>(null)
    const [userData, setUserData] = useState<User>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await VerifyToken(setUserData, true)

            setLoading(false)
        }

        fetchData()

    }, [])

    if (loading) return <Loading />

    const captureImage = () => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (!imageSrc) {
            showError("Terjadi kesalahan saat mengambil gambar.")
            return
        }

        showLoading()

        axios.post(`${scanMoodAPI}/post/scan-user-mood`, {
            image: imageSrc, userId: userData?.uuid
        }).then(res => {
            closeLoading()
            if (res.data.success) {
                showSuccessDialog(
                    res.data.message,
                    'Rekomendasi',
                    () => { window.location.href = ('/recommendation/' + res.data.scan.id) }
                )
                return
            }

            showError(res.data.message)
        }).catch(() => {
            closeLoading()
            showError("Terjadi kesalahan saat mengambil gambar.")
        })
    }

    return (
        <div className="moodDetectionContainer">
            <Header userData={userData as User} />
            <div className='scanBox'>
                <p> Scan Mood mu Sekarang </p>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={400}
                    height={300}
                    className='webcam'
                />
                <button onClick={captureImage}>Scan Mood</button>
            </div>
        </div>
    )
}

export default ScanMood
