// import React from 'react'

import { useEffect, useState } from "react"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import type { Admin, AdminCart, MenuData } from "../../interface/Interface"
import Loading from "../../components/Loading"
import axios from "axios"
import { closeLoading, showError, showLoading, showSuccess, showSuccessDialog, showWarning } from "../../utilities/Alert"

function Cashier() {
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const adminCartsAPI = `${apiURL}/admin-carts`
    const menuAPI = `${apiURL}/menu`
    const ordersAPI = `${apiURL}/orders`
    const productAPI = `${imageURL}/products`
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState<boolean>(true)
    const [buying, setBuying] = useState<boolean>(false)
    const [recipientName, setRecipientName] = useState<string>("")
    const [paymentMethod, setPaymentMethod] = useState<string>("")
    const [carts, setCarts] = useState<AdminCart[]>([])
    const [query, setQuery] = useState<string>("")
    const [choosenMenu, setChoosenMenu] = useState<AdminCart['menu']>()
    const [choosenQuantity, setChoosenQuantity] = useState<number>(0)
    const [totalPrice, setTotalPrice] = useState<number>(0)
    const [menus, setMenus] = useState<MenuData[]>([])
    const [filteredMenus, setFilteredMenus] = useState<MenuData[]>([])
    const [refresher, setRefresher] = useState<boolean>(false)


    useEffect(() => {
        async function fetchData() {
            await VerifyTokenAdmin(setAdminData)

            const menuRes = (await axios.get(`${menuAPI}/get/all`)).data

            if (menuRes.success) {
                setMenus(menuRes.menus)
                setFilteredMenus(menuRes.menus)
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    // Carts useEffect
    useEffect(() => {
        async function fetchData() {
            const res = (await axios.get(`${adminCartsAPI}/get/all`)).data

            if (res.success) {
                const total = res.carts.reduce((total: number, item: AdminCart) => total + item.subPrice, 0)
                setTotalPrice(total)
                setCarts(res.carts)
            }
        }

        fetchData()
    }, [refresher])

    if (loading) return <Loading />

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    const handleSearchQuery = () => {
        if (!query) {
            setFilteredMenus(menus)
            return
        }

        const filtered = menus.filter(menu => menu.name.toLowerCase().includes(query.toLowerCase()))
        setFilteredMenus(filtered)
    }

    const handleChoosenMenu = (menu: AdminCart['menu']) => {
        if (choosenMenu?.id === menu.id) {
            setChoosenMenu(undefined)
            return
        }

        const existingCart = carts.find(cart => cart.menuId === menu.id)

        if (existingCart) {
            setChoosenQuantity(existingCart.quantity)
        }
        else {
            setChoosenQuantity(0)
        }

        setChoosenMenu(menu)
    }

    const listByCategory = (category: string) => {
        const filtered = menus.filter(menu => menu.category === category)
        setFilteredMenus(filtered)
    }

    const changeKeranjangJumlah = (id: string, operator: number) => {
        if (!choosenMenu) {
            showWarning("Silahkan pilih menu terlebih dahulu.")
            return
        }

        if (operator === 1) {
            showLoading()
            axios.post(`${adminCartsAPI}/post/add-to-cart`, {
                menuId: id
            }).then(res => {
                closeLoading()
                if (res.data.success) {
                    showSuccess(res.data.message)
                    setChoosenQuantity(choosenQuantity + 1)
                    setRefresher(!refresher)
                    return
                }
                showError(res.data.message)
            }).catch(() => {
                closeLoading()
                showError("Terjadi kesalahan saat menambahkan ke keranjang.")
            })
        }
        else if (operator === -1 && choosenQuantity > 0) {
            showLoading()
            axios.patch(`${adminCartsAPI}/patch/remove-from-cart`, {
                menuId: id
            }).then(res => {
                closeLoading()
                if (res.data.success) {
                    showSuccess(res.data.message)
                    setChoosenQuantity(Math.max(choosenQuantity - 1))
                    setRefresher(!refresher)
                    return
                }
                showError(res.data.message)
            }).catch(() => {
                closeLoading()
                showWarning('Operator tidak valid.')
            })
        }
        else {
            showError
        }
    }

    const handleCheckout = () => {
        if (carts.length === 0 || totalPrice === 0) {
            showWarning("Keranjang masih kosong.")
            return
        }

        setRecipientName("")
        setPaymentMethod("")
        setBuying(true)
    }

    const handleTransaction = () => {
        if (recipientName === "" || paymentMethod === "") {
            showWarning("Silahkan isi nama dan metode pembayaran.")
            return
        }

        if (adminData === undefined) {
            showWarning("Terjadi kesalahan saat checkout.")
            return
        }

        showLoading()
        axios.post(`${ordersAPI}/post/from-admin/create-new-order`, {
            recipientName,
            paymentMethod,
            adminId: adminData.uuid,
            totalPrice
        }).then(res => {
            closeLoading()
            if (res.data.success) {
                setBuying(false)
                setRefresher(!refresher)
                setChoosenQuantity(0)
                showSuccessDialog(res.data.message, 'Lihat Struk', () => { 
                    window.location.href = "/admin/receipt/" + res.data.uniqueCode.toLowerCase()
                })
                return
            }
            showError(res.data.message)
        }).catch(() => {
            closeLoading()
            showError("Terjadi kesalahan saat checkout.")
        })
    }


    return (
        <div>
            <HeaderAdmin name={adminData?.name as string} />
            <div className='kasirContainer'>
                {buying && (
                    <div className='successModal' onClick={() => setBuying(false)}>
                        <div className='successBox' onClick={(event) => event.stopPropagation()}>
                            <p> Masukkan Nama Pelanggan </p>
                            <input
                                type='text'
                                name='nama'
                                placeholder='nama'
                                onChange=
                                {
                                    (event) => { setRecipientName(event.target.value) }
                                }
                            />
                            <select
                                name="paymentMethod"
                                onChange={(event) => setPaymentMethod(event.target.value)}
                            >
                                <option value="">Pilih Metode Pembayaran</option>
                                <option value="Qris">Qris</option>
                                <option value="Cash">Cash</option>
                            </select>
                            <button onClick={handleTransaction}> Enter </button>
                        </div>
                    </div>
                )}
                <div className='categoryMenuKasir'>
                    <button onClick={() => listByCategory("kopi")}> Kopi </button>
                    <button onClick={() => listByCategory("non-kopi")}> Non Kopi </button>
                    <button onClick={() => listByCategory("makanan")}> Makanan </button>
                </div>
                <div className='menuContainerkasir'>
                    {filteredMenus.map((menu, key) => {
                        return (
                            <div className='menuBoxKasir' key={key}>
                                <img src={`${productAPI}/${menu.image || "default.jpg"}`} alt='menu' onClick={() => handleChoosenMenu(menu)} />
                                <p className='menuName'> {menu.name} </p>
                                <p className='menuPrice'> {formatRupiah(menu.price)} </p>
                            </div>
                        )
                    })}
                </div>

                <div className='kasirBar'>
                    <div className='left'>
                        <p> Total Harga </p>
                        <h1> {formatRupiah(totalPrice)} </h1>
                    </div>
                    <div className='right'>
                        {choosenMenu && (
                            <p> {choosenMenu.name} </p>
                        )}
                        <div className='amount'>
                            <p className='increment' onClick={() => changeKeranjangJumlah(choosenMenu?.id || "", -1)}><i className="fa-solid fa-minus"></i></p>
                            <p className='number'> {choosenQuantity} </p>
                            <p className='increment' onClick={() => changeKeranjangJumlah(choosenMenu?.id || "", 1)}><i className="fa-solid fa-plus"></i></p>
                        </div>
                        <button onClick={handleCheckout}> Check Out </button>
                    </div>
                </div>

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

                <div className='rightSidebar'>
                    <p> Total Pesanan </p>
                    <div className='pesananContainer'>
                        {carts.map((item, key) => {
                            return (
                                <div className='pesananBox' key={key} >
                                    <img src={`${productAPI}/${item.menu.image}`} alt='menu' onClick={() => handleChoosenMenu(item.menu)} />
                                    <div className='infoPesanan'>
                                        <h1> {item.menu.name} </h1>
                                        <p> {formatRupiah(item.menu.price)} </p>
                                    </div>
                                    <p> {item.quantity}x </p>
                                </div>
                            )
                        })};
                    </div>
                </div>
            </div>
            <SidebarAdmin />
        </div>
    )
}

export default Cashier
