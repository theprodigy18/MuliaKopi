// import React from 'react'

import { useEffect, useState } from "react"
import Footer from "../components/Footer"
import Header from "../components/Header"
import type { MenuData, User } from "../interface/Interface"
import { useParams } from "react-router-dom"
import axios from "axios"
import Loading from "../components/Loading"
import { VerifyToken } from "../utilities/VerifiyToken"
import { closeLoading, showError, showLoading, showSuccess, showWarning } from "../utilities/Alert"
import { IsUserBuying } from "../utilities/BuyingCheck"

function MenuDescription() {
    const apiURL = import.meta.env.VITE_API_URL
    const menuAPI = `${apiURL}/menu`
    const cartsAPI = `${apiURL}/carts`
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const productAPI = `${imageURL}/products`
    const { id } = useParams()
    const [refresher, setRefresher] = useState(false)
    const [menu, setMenu] = useState<MenuData>()
    const [userData, setUserData] = useState<User>()
    const [loading, setLoading] = useState(true)
    const [isBuying, setIsBuying] = useState(false)

    useEffect(() => {
        if (!id) {
            window.location.href = '/'
            return
        }

        async function fetchData() {
            const user = await VerifyToken(setUserData)

            const menuRes = (await axios.get(`${menuAPI}/get/by-id/${id?.toUpperCase()}`)).data

            if (menuRes.success) {
                setMenu(menuRes.menu)
            }

            await IsUserBuying(user.uuid || '', setIsBuying)
            setLoading(false)
        }

        fetchData();
    }, [])


    if (loading) return <Loading />


    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    const handleBeliSekarang = () => {
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
            <div className='menuDescriptionContainer'>
                <h1> {menu?.name} </h1>
                <img src={`${productAPI}/${menu?.image || 'default.jpg'}`} alt='menu' />
                <div className='descriptionContainer'>
                    <p> {menu?.description} </p>
                    <p className='menuPrice'> {formatRupiah(menu?.price || 0)} </p>
                    <button onClick={handleBeliSekarang}> Tambah ke Keranjang </button>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default MenuDescription
