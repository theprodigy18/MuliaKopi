// import React from 'react'

import { useParams } from "react-router-dom"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { useEffect, useState } from "react"
import { VerifyToken } from "../utilities/VerifiyToken"
import type { RecommendationData, User } from "../interface/Interface"
import Loading from "../components/Loading"
import Sad from "../assets/images/sedih.jpg"
import Happy from "../assets/images/bahagia.jpg"
import Fear from "../assets/images/takut.jpg"
import Normal from "../assets/images/normal.jpg"
import Angry from "../assets/images/marah.jpg"
import axios from "axios"
import Cart from "../assets/images/shopping-cart.svg"
import { closeLoading, showError, showLoading, showSuccess, showWarning } from "../utilities/Alert"
import { IsUserBuying } from "../utilities/BuyingCheck"

const mapping = {
    'Sedih': Sad,
    'Bahagia': Happy,
    'Takut': Fear,
    'Normal': Normal,
    'Marah': Angry
}

function Recommendation() {
    const apiURL = import.meta.env.VITE_API_URL
    const cartsAPI = `${apiURL}/carts`
    const recommendationAPI = `${apiURL}/recommendation`
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const productAPI = `${imageURL}/products`
    const { scanId } = useParams()
    const [userData, setUserData] = useState<User>()
    const [loading, setLoading] = useState<boolean>(true)
    const [mood, setMood] = useState<string>("")
    const [recommendations, setRecommendations] = useState<RecommendationData[]>([])
    const [refresher, setRefresher] = useState<boolean>(false)
    const [isBuying, setIsBuying] = useState<boolean>(false)

    useEffect(() => {
        if (!scanId) {
            window.location.href = "/"
            return
        }

        async function fetchData() {
            const user = await VerifyToken(setUserData, true)

            const recommendationsRes = (await axios.get(`${recommendationAPI}/get/by-scan-id/${scanId}`)).data

            if (!recommendationsRes.success) {
                window.location.href = "/"
                return
            }

            await IsUserBuying(user.uuid || '', setIsBuying)

            setMood(recommendationsRes.mood)
            setRecommendations(recommendationsRes.recommendations)

            setLoading(false)
        }

        fetchData()

    }, [])

    if (loading) return <Loading />

    const capitalizeWords = (str: string) => {
        if (!str) return "";
        return str
            .split(" ") // Memisahkan string menjadi array kata-kata
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Mengubah huruf pertama tiap kata menjadi besar
            .join(" "); // Menggabungkan kembali menjadi string
    };

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    function formatNumber(num: number) {
        if (num >= 1_000_000) {
            // Jika angkanya lebih besar atau sama dengan 1 juta, tambahkan 'M' (misalnya, 1.5M)
            return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (num >= 1_000) {
            // Jika angkanya lebih besar atau sama dengan 1 ribu, tambahkan 'k' (misalnya, 6.5k)
            return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
        } else {
            // Jika kurang dari 1 ribu, kembalikan angka asli
            return num.toString();
        }
    }

    const handleBeliSekarang = (id: string) => {
        if (!userData) {
            showWarning("Silahkan login terlebih dahulu.")
            return
        }

        if (isBuying) {
            showWarning("Silahkan selesaikan pembelian sebelumnya terlebih dahulu.")
            return
        }

        showLoading()

        axios.post(`${cartsAPI}/post/add-to-cart`,
            {
                userId: userData.uuid,
                menuId: id
            })
            .then(res => {
                closeLoading()
                if (res.data.success) {
                    showSuccess(res.data.message)
                    setRefresher(!refresher)
                    return
                }

                showError(res.data.message)
            })
            .catch(() => {
                closeLoading()
                showError("Terjadi kesalahan saat menambahkan ke keranjang.")
            })
    }

    return (
        <div>
            <Header refresher={refresher} userData={userData as User} />
            <div className='recommendation'>
                <img src={mapping[mood as keyof typeof mapping]} alt='gambar' />
                <div className='recommendationContainer'>
                    <h1> Mood mu sedang {mood} </h1>
                    <h2> Rekomendasi menu menyesuaikan mood mu </h2>
                    <div className='recommendationMenuWrapper'>
                        {recommendations.map((item, key) => {
                            const category = item.menu.category;
                            const textCategory = category.replace("-", " ");
                            return (
                                <div className='recommendationMenuBox' key={key}>
                                    <img src={`${productAPI}/${item.menu.image || "default.jpg"}`} alt='menu' onClick={() => { window.location.href = ("/menu-description/" + item.menuId) }} />
                                    <button onClick={() => handleBeliSekarang(item.menuId)}> Beli Sekarang </button>
                                    <p className='menuName'> {item.menu.name} </p>
                                    <p className='category'> {capitalizeWords(textCategory)} </p>
                                    <p className='price'> {formatRupiah(item.menu.price)} </p>
                                    <div className='mobileMenuPricing'>
                                        <p> {formatNumber(item.menu.price)} </p>
                                        <img src={Cart} alt='cart' onClick={() => handleBeliSekarang(item.menuId)} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Recommendation
