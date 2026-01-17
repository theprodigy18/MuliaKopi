// import React from 'react'

import { useEffect, useState } from "react"
import type { Admin, MenuData } from "../../interface/Interface"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import Loading from "../../components/Loading"
import { useParams } from "react-router-dom"
import axios from "axios"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"

function MenuDescriptionAdmin() {
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const menuAPI = `${apiURL}/menu`
    const productAPI = `${imageURL}/products`
    const { menuId } = useParams()
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState(true)
    const [menu, setMenu] = useState<MenuData>()

    useEffect(() => {
        if (!menuId) {
            window.location.href = '/'
            return
        }

        async function fetchData() {

            await VerifyTokenAdmin(setAdminData)
            
            const res = (await axios.get(`${menuAPI}/get/by-id/${menuId?.toUpperCase()}`)).data
            
            if (res.success) {
                setMenu(res.menu)
            }
            else {
                window.location.href = '/'
                return
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <Loading />

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    }

    return (
        <div>
            <HeaderAdmin name={adminData?.name || ''} />
            <div className='detailMenuAdminContainer'>
                <h1> Detail Menu </h1>
                <img src={`${productAPI}/${menu?.image || 'default.jpg'}`} alt='menu' />
                <div className='detailMenuDescription'>
                    <h1> {menu?.name} </h1>
                    <p> {menu?.description} </p>
                </div>
                <p> {formatRupiah(menu?.price || 0)} </p>
            </div>
            <SidebarAdmin />
        </div>
    )
}

export default MenuDescriptionAdmin
