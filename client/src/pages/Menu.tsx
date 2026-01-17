// import React from 'react'

import { useEffect, useState } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useNavigate, useParams } from "react-router-dom"
import type { MenuData, User } from "../interface/Interface"
import axios from "axios"
import Loading from "../components/Loading"
import { VerifyToken } from "../utilities/VerifiyToken"
import { closeLoading, showError, showLoading, showSuccess, showWarning } from "../utilities/Alert"
import { IsUserBuying } from "../utilities/BuyingCheck"

function Menu() {
    let navigate = useNavigate()
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const menuAPI = `${apiURL}/menu`
    const cartsAPI = `${apiURL}/carts`
    const productAPI = `${imageURL}/products`
    const [refresher, setRefresher] = useState(false)
    const [userData, setUserData] = useState<User>()
    const { category } = useParams()
    const [menus, setMenus] = useState<MenuData[]>([])
    const [isBuying, setIsBuying] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check screen width
        if (window.innerWidth < 431) {
            window.location.href = ('/menu-mobile/' + category); // Redirect to the home page
            return;
        }

        if (category !== 'kopi' && category !== 'non-kopi' && category !== 'makanan') {
            navigate('/menu/kopi')
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

        fetchData();

    }, [navigate, category]);

    if (loading) return <Loading />

    const byCategory = (category: string) => {
        navigate(`/menu/${category}`)
    }

    const capitalizeWords = (words: string) => {
        return words.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
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
            <div className='headerMenuContainer'>
                <h1> Temukan menu favoritmu di sini </h1>
                <p> Sesuaikan keinginan mu dengan menu favoritmu </p>
            </div>
            <div className='menuSectionContainer'>
                <h1> Menu </h1>
                <div className='menuCategory'>
                    <button className='categoryButton' onClick={() => byCategory("kopi")}> Kopi </button>
                    <button className='categoryButton' onClick={() => byCategory("non-kopi")}> Non Kopi </button>
                    <button className='categoryButton' onClick={() => byCategory("makanan")}> Makanan </button>
                </div>
                <div className='menuContainer'>
                    {menus.map((menu, key) => {
                        const category = menu.category;
                        const textCategory = category.replace("-", " ");
                        return (
                            <div className='menuBox' key={key}>
                                <img src={`${productAPI}/${menu.image}`} alt='menu' onClick={() => { window.location.href = ("/menu-description/" + menu.id.toLowerCase()) }} />
                                <button onClick={() => handleBeliSekarang(menu.id)}> Beli Sekarang </button>
                                <p className='menuName'> {menu.name} </p>
                                <p className='category'> {capitalizeWords(textCategory)} </p>
                                <p className='price'> {formatRupiah(menu.price)} </p>
                            </div>
                        )
                    })}
                    {menus.length === 0 && (
                        <h1>Tidak ada menu</h1>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Menu
