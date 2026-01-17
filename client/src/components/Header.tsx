// import React from 'react'

import axios from "axios"
import { useEffect, useRef, useState } from "react"
import type { CartItem, User } from "../interface/Interface"
import Logo from "../assets/images/logo_mulia_kopi.png"
import Cart from "../assets/images/shopping-cart.svg"
import CartBack from "../assets/images/Group 194.png"
import CartBg from "../assets/images/Group 195.jpg"
import { closeLoading, showError, showLoading, showSuccess, showWarning } from "../utilities/Alert"
import { IsUserBuying } from "../utilities/BuyingCheck"

function Header({ refresher, userData }:
    {
        refresher?: boolean,
        userData: User
    }) {
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const cartsAPI = `${apiURL}/carts`
    const ordersAPI = `${apiURL}/orders`
    const productAPI = `${imageURL}/products`
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const profilePopupRef = useRef<HTMLDivElement>(null)
    const [carts, setCarts] = useState<CartItem[]>([])
    const [cartOpen, setCartOpen] = useState(false)
    const cartRef = useRef<HTMLDivElement>(null)
    const cartPopupRef = useRef<HTMLDivElement>(null)
    const [isBuying, setIsBuying] = useState(false)
    const [uniqueCode, setUniqueCode] = useState('')
    const [priceTotal, setPriceTotal] = useState(0)
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (userData) {
                const cartsRes = (await axios.get(`${cartsAPI}/get/by-user-id/${userData.uuid}`)).data

                if (cartsRes.success) {
                    setCarts(cartsRes.carts)
                    const total = cartsRes.carts.reduce((total: number, item: CartItem) => total + item.subPrice, 0)
                    setPriceTotal(total)
                }

                await IsUserBuying(userData.uuid, setIsBuying, setUniqueCode)
            }
        }

        fetchData();

        function handlePopupState() {
            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Node;

                if (profileRef.current && !profileRef.current.contains(target) &&
                    profilePopupRef.current && !profilePopupRef.current.contains(target)) {
                    setProfileOpen(false);
                }

                if (cartRef.current && !cartRef.current.contains(target) &&
                    cartPopupRef.current && !cartPopupRef.current.contains(target)) {
                    setCartOpen(false);
                }
            };

            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }

        handlePopupState();

        if (window.innerWidth > 431) {
            const handleScroll = () => {
                const header = document.querySelector(".header");

                if (window.scrollY > 0) {
                    header?.classList.add("scroll");
                } else {
                    header?.classList.remove("scroll");
                }
            };

            // Tambahkan event listener scroll
            window.addEventListener("scroll", handleScroll);

            // Bersihkan event listener saat komponen di-unmount
            return () => {
                window.removeEventListener("scroll", handleScroll);
            };
        }
        else {
            return;
        }

    }, [refresher, refresh])


    const navigate = (path: string) => {
        window.location.href = path
    }


    const toggleProfile = () => setProfileOpen(!profileOpen)
    const toggleCart = () => setCartOpen(!cartOpen)

    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.reload()
    }

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    const changeKeranjangJumlah = (id: string, operator: number) => {
        if (isBuying) {
            showWarning('Anda sedang membeli, tidak dapat mengubah keranjang.')
            return
        }

        if (operator === 1) {
            showLoading()
            axios.post(`${cartsAPI}/post/add-to-cart`, {
                userId: userData.uuid,
                menuId: id
            }).then(res => {
                closeLoading()
                if (res.data.success) {
                    showSuccess(res.data.message)
                    setRefresh(!refresh)
                    return
                }
                showError(res.data.message)
            }).catch(() => {
                closeLoading()
                showError("Terjadi kesalahan saat menambahkan ke keranjang.")
            })
        }
        else if (operator === -1) {
            showLoading()
            axios.patch(`${cartsAPI}/patch/remove-from-cart`, {
                userId: userData.uuid,
                menuId: id
            }).then(res => {
                closeLoading()
                if (res.data.success) {
                    showSuccess(res.data.message)
                    setRefresh(!refresh)
                    return
                }
                showError(res.data.message)
            }).catch(() => {
                closeLoading()
                showError("Terjadi kesalahan saat menghapus menu dari keranjang.")
            })
        }
        else {
            showWarning('Operator tidak valid.')
        }
    }

    const handleCheckout = () => {
        showLoading()
        axios.post(`${ordersAPI}/post/from-user/create-new-order`, {
            userId: userData.uuid,
        }).then(res => {
            closeLoading()
            if (res.data.success) {
                showSuccess(res.data.message)
                setRefresh(!refresh)
                return
            }
            showError(res.data.message)
        }).catch(() => {
            closeLoading()
            showError("Terjadi kesalahan saat membuat pesanan.")
        })
    }

    return (
        <div className='header'>
            <div className='logo' onClick={() => navigate('/')}>
                {location.pathname === "/menu-mobile/kopi" ||
                    location.pathname === "/menu-mobile/non-kopi" ||
                    location.pathname === "/menu-mobile/makanan" ? (
                    <i className="fa-solid fa-arrow-right fa-rotate-180 backHome"></i>
                ) : (
                    <img src={Logo} alt='logo' />
                )}
            </div>
            <div className='rightSide'>
                <ul className='navLink'>
                    <li>
                        <a href='/'> home </a>
                    </li>
                    <li>
                        <a href='/#aboutUs'> about us </a>
                    </li>
                    <li>
                        <a href='/menu/kopi'> menu </a>
                    </li>
                    {location.pathname !== '/scan-mood' && (
                        <li>
                            <a href={`${location.pathname}#footer`} > contact </a>
                        </li>
                    )}

                </ul>
                {userData ? (
                    <div className='cart'>
                        <div className='cartSub' ref={cartRef} onClick={toggleCart}>
                            <img src={Cart} alt='cart' />
                            {carts.length > 0 && (
                                <span> {carts.length} </span>
                            )}
                        </div>
                        <span>|</span>
                        <p onClick={toggleProfile} ref={profileRef}> <i className="fa-solid fa-user"></i> {userData.name} </p>
                        {profileOpen && (
                            <div className='logout' ref={profilePopupRef}>
                                <button onClick={handleLogout}> Logout </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='cart'>
                        <button onClick={() => navigate("/auth/login")}> Login </button>
                    </div>
                )}
            </div>
            {cartOpen && (
                <div className='cartOpen' ref={cartPopupRef}>
                    <img src={CartBg} alt='gambar' className='imgKeranjang' />
                    <img src={CartBack} alt='back' className='imgBack' onClick={toggleCart} />
                    {isBuying ? (
                        <div className='cartMenuWrapper'>
                            <p> Anda sudah melakukan pemesanan, silahkan lakukan pembayaran di kasir. </p>
                            <button onClick={() => window.location.href = (`/receipt/${uniqueCode.toLowerCase()}`)}> Cek Kode Pesanan </button>
                        </div>
                    ) : carts.length > 0 ? (
                        <div className='cartMenuWrapper'>
                            <div className='cartMenu'>
                                {carts?.map((item, key) => {
                                    return (
                                        <div className='cartMenuBox' key={key}>
                                            <img src={`${productAPI}/${item.menu.image}`} alt='menu' />
                                            <div className='cartMenuDetail'>
                                                <h1> {item.menu.name} </h1>
                                                <p> {formatRupiah(item.menu.price)} </p>
                                            </div>
                                            <p>
                                                <i className="fa-solid fa-minus" onClick={() => changeKeranjangJumlah(item.menuId, -1)}></i>
                                                {item.quantity}
                                                <i className="fa-solid fa-plus" onClick={() => changeKeranjangJumlah(item.menuId, 1)}></i>
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className='cartMenuTotal'>
                                <div className='totalBox'>
                                    <h1> Total </h1>
                                    <p> {formatRupiah(priceTotal)} </p>
                                </div>
                                <button onClick={handleCheckout}> Check Out </button>
                            </div>
                        </div>
                    ) : (
                        <div className='cartMenuWrapper'>
                            <p> Keranjang anda kosong. </p>
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}

export default Header
