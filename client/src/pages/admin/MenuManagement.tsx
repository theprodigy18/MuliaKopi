// import React from 'react'

import { useEffect, useState } from "react"
import type { Admin, MenuData } from "../../interface/Interface"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import Loading from "../../components/Loading"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"
import axios from "axios"
import { closeLoading, showError, showLoading, showSuccessDialog } from "../../utilities/Alert"

function MenuManagement() {
    const apiUrl = import.meta.env.VITE_API_URL
    const imageUrl = import.meta.env.VITE_API_IMAGE_URL
    const menuAPI = `${apiUrl}/menu`
    const uploadImagesAPI = `${apiUrl}/upload-images`
    const productAPI = `${imageUrl}/products`
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState(true)
    const [menus, setMenus] = useState<MenuData[]>([])
    const [filteredMenus, setFilteredMenus] = useState<MenuData[]>([])
    const [choosenMenu, setChoosenMenu] = useState<MenuData>()
    const [query, setQuery] = useState<string>("")
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    useEffect(() => {
        async function fetchData() {
            await VerifyTokenAdmin(setAdminData)

            const res = (await axios.get(`${menuAPI}/get/all`)).data

            if (res.success) {
                setMenus(res.menus)
                setFilteredMenus(res.menus)
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <Loading />

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    const filterByCategory = (category: string) => {
        setFilteredMenus(menus.filter(menu => menu.category === category))
    }

    const handleSearchQuery = () => {
        if (!query) {
            setFilteredMenus(menus)
            return
        }

        const filtered = menus.filter(menu => menu.name.toLowerCase().includes(query.toLowerCase()))
        setFilteredMenus(filtered)
    }

    const toggleChoosenMenu = (menu: MenuData) => {
        if (choosenMenu?.id === menu.id) {
            setChoosenMenu(undefined)
            return
        }

        setChoosenMenu(menu)
    }

    const showDeleteModal = () => {
        if (!choosenMenu) {
            showError("Silahkan pilih menu terlebih dahulu.")
        }

        setIsDeleting(true)
    }

    const deleteMenu = async () => {
        if (!choosenMenu) {
            showError("Silahkan pilih menu terlebih dahulu.")
            return
        }

        showLoading()
        const image = choosenMenu.image

        const res = (await axios.delete(`${menuAPI}/delete/by-id/${choosenMenu.id}`)).data
        if (!res.success) {
            closeLoading()
            showError(res.message)
            return
        }
        const message = res.message
        
        axios.delete(`${uploadImagesAPI}/delete/product/${image}`).then(() => {
            closeLoading()
            showSuccessDialog(message, 'Ok', () => {
                window.location.reload()
            })
        }).catch(() => {
            closeLoading()
            showError("Terjadi kesalahan saat menghapus gambar.")
        })

    }

    return (
        <div>
            <HeaderAdmin name={adminData?.name || ""} />
            <div className='kelolaMenuContainer'>
                <div className='sortingCategory'>
                    <h1> Kelola Menu </h1>
                    <div className='categoryList'>
                        <button onClick={() => filterByCategory("kopi")}> Kopi </button>
                        <button onClick={() => filterByCategory("non-kopi")}> Non Kopi </button>
                        <button onClick={() => filterByCategory("makanan")}> Makanan </button>
                    </div>
                </div>
                <div className='kelolaMenuWrapper'>
                    {filteredMenus.map((menu, key) => {
                        return (
                            <div className='kelolaMenuBox' key={key}>
                                <img src={`${productAPI}/${menu.image || "default.jpg"}`} alt='menu' onClick={() => toggleChoosenMenu(menu)} />
                                <p className='menuName'> {menu.name} </p>
                                <p className='menuPrice'> {formatRupiah(menu.price)} </p>
                            </div>
                        )
                    })}
                </div>
                <div className='kelolaMenuBar'>
                    <div className='left'>
                        <button onClick={() => window.location.href = ("/admin/create-menu")}> Tambah Menu </button>
                    </div>
                    <span className='line'></span>
                    {choosenMenu && (
                        <div className='right'>
                            <h1> {choosenMenu.name} </h1>
                            <div className='action'>
                                <button onClick={() => window.location.href = (`/admin/menu-description/${choosenMenu.id.toLowerCase()}`)}> Detail Menu </button>
                                <button onClick={() => window.location.href = (`/admin/edit-menu/${choosenMenu.id.toLowerCase()}`)}> Edit Menu </button>
                                <button onClick={() => showDeleteModal()}> Hapus Menu </button>
                            </div>
                        </div>
                    )}
                    {!choosenMenu && (
                        <div className='right'></div>
                    )}
                </div>
                {isDeleting && (
                    <div className='successModal' onClick={() => setIsDeleting(false)}>
                        <div className='successBox' onClick={(event) => event.stopPropagation()}>
                            <p> Apakah anda yakin ingin menghapus menu {choosenMenu?.name}? </p>
                            <button onClick={deleteMenu}> Yes </button>
                            <button onClick={() => setIsDeleting(false)}> No </button>
                        </div>
                    </div>
                )}

                <div className='searchBar'>
                    <input
                        type='text'
                        placeholder='Search...'
                        name='menu'
                        value={query}
                        onChange=
                        {
                            (event) => { setQuery(event.target.value) }
                        }
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleSearchQuery()
                            }
                        }}
                    />
                </div>
            </div>
            <SidebarAdmin />
        </div>
    )
}

export default MenuManagement
