// import React from 'react'

import { useEffect, useState } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import type { MenuData, User } from "../interface/Interface"
import { VerifyToken } from "../utilities/VerifiyToken"
import Loading from "../components/Loading"
import { useParams } from "react-router-dom"
import axios from "axios"
import KopiHeader from "../assets/images/kopi-header.jpg"
import NonKopiHeader from "../assets/images/non-kopi-header.jpg"
import MakananHeader from "../assets/images/makanan-header.jpg"
import Cart from "../assets/images/shopping-cart.svg";
import { closeLoading, showError, showLoading, showSuccess, showWarning } from "../utilities/Alert"
import { IsUserBuying } from "../utilities/BuyingCheck"

function MenuMobile() {
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const menuAPI = `${apiURL}/menu`
    const cartsAPI = `${apiURL}/carts`
    const productAPI = `${imageURL}/products`
    const { category } = useParams();
    const [userData, setUserData] = useState<User>()
    const [refresher, setRefresher] = useState(false)
    const [loading, setLoading] = useState(true)
    const [menus, setMenus] = useState<MenuData[]>([])
    const [isBuying, setIsBuying] = useState(false)

    useEffect(() => {
        if (window.innerWidth > 430) {
            window.location.href = ("/menu/" + category) // Mengarahkan ke halaman lain
            return
        }

        if (category !== 'kopi' && category !== 'non-kopi' && category !== 'makanan') {
            window.location.href = '/menu-mobile/kopi'
            return
        }

        async function fetchData() {
            const user = await VerifyToken(setUserData)

            const menusRes = (await axios.get(`${menuAPI}/get/by-category/${category}`)).data

            if (menusRes.success) {
                setMenus(menusRes.menus)
            }
            else {
                setMenus([])
            }

            await IsUserBuying(user.uuid || '', setIsBuying)

            setLoading(false)
        }
        fetchData()

    }, [])

    if (loading) return <Loading />

    const mappingHeader = {
        'kopi': KopiHeader,
        'non-kopi': NonKopiHeader,
        'makanan': MakananHeader
    }

    const capitalizeWords = (str: string) => {
        if (!str) return "";
        return str
            .split(" ") // Memisahkan string menjadi array kata-kata
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Mengubah huruf pertama tiap kata menjadi besar
            .join(" "); // Menggabungkan kembali menjadi string
    };

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
            <Header userData={userData as User} refresher={refresher} />
            <div className='mobileMenuContainer'>
                <img src={mappingHeader[category as keyof typeof mappingHeader]} alt='header' />
                <div className='secondBodyMenu'>
                    <p> {capitalizeWords(category?.replace("-", " ") as string)} </p>
                    <div className='menuBoard'>
                        {menus.map((menu, key) => {
                            return (
                                <div className='mobileMenuBox' key={key}>
                                    <img src={`${productAPI}/${menu.image}`} alt='menu' onClick={() => window.location.href = (`/menu-description/${menu.id.toLowerCase()}`)} />
                                    <p> {menu.name} </p>
                                    <div className='mobileMenuPricing'>
                                        <p> {formatNumber(menu.price)} </p>
                                        <img src={Cart} alt='cart' onClick={() => handleBeliSekarang(menu.id)} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default MenuMobile
