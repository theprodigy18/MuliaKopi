// import React from 'react'

import { useEffect, useState } from "react"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"
import type { Admin, Order, OrderItem } from "../../interface/Interface"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import Loading from "../../components/Loading"
import { closeLoading, showError, showLoading, showSuccessDialog } from "../../utilities/Alert"
import axios from "axios"

function OnlineOrder() {
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const ordersAPI = `${apiURL}/orders`
    const productAPI = `${imageURL}/products`
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState(true)
    const [buying, setBuying] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<string>("")
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [activeOrderId, setActiveOrderId] = useState<string>("")
    const [activeTotalPrice, setActiveTotalPrice] = useState<number>(0)
    const [query, setQuery] = useState<string>("")
    const [refresher, setRefresher] = useState(false)


    useEffect(() => {
        async function fetchData() {
            await VerifyTokenAdmin(setAdminData)

            const res = (await axios.get(`${ordersAPI}/get/all-online-order`)).data

            if (res.success) {
                setOrders(res.orders)
                setFilteredOrders(res.orders)
            }

            setLoading(false)
        }

        fetchData();
    }, [refresher])

    if (loading) return <Loading />

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    const toggleOrderId = (orderId: string) => {
        if (activeOrderId === orderId) {
            setActiveOrderId("")
        } else {
            setActiveOrderId(orderId)
        }
    }

    const handleSearchQuery = () => {
        if (!query) {
            setFilteredOrders(orders)
            return
        }

        const filtered = orders.filter(order => order.uniqueCode.toLowerCase().includes(query.toLowerCase()))
        setFilteredOrders(filtered)
    }

    const openPaymentModal = (orderId: string, totalPrice: number) => {
        setPaymentMethod("")
        setActiveOrderId(orderId)
        setActiveTotalPrice(totalPrice)
        setBuying(true)
    }

    const handleTransaction = () => {
        if (paymentMethod === "") {
            showError("Silahkan isi metode pembayaran.")
            return
        }

        if (adminData === undefined) {
            showError("Terjadi kesalahan saat checkout.")
            return
        }

        showLoading()
        axios.post(`${ordersAPI}/post/accept-online-order`, {
            orderId: activeOrderId,
            adminId: adminData.uuid,
            paymentMethod,
            totalPrice: activeTotalPrice
        }).then(res => {
            closeLoading()
            if (res.data.success) {
                setBuying(false)
                setRefresher(!refresher)
                setActiveOrderId("")
                setActiveTotalPrice(0)
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
        <div className='pesananSectionContainerWrapper'>
            {buying && (
                <div className='successModal' onClick={() => setBuying(false)}>
                    <div className='successBox' onClick={(event) => event.stopPropagation()}>
                        <p> Pilih Metode Pembayaran </p>
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
            {filteredOrders.map((order, key) => {
                const totalPrice = order.orderItems.reduce(
                    (acc: number, item: OrderItem) => acc + item.subPrice, 0
                );

                return (
                    <div className='pesananSectionContainer' key={key}>
                        <div className='pesananOnlineBox'>
                            <div className='detail'>
                                <h1> {order.uniqueCode} </h1>
                                <p onClick={() => toggleOrderId(order.uuid)}> Lihat selengkapnya </p>
                            </div>
                            <p onClick={() => toggleOrderId(order.uuid)}>
                                <i className={`fa-solid fa-caret-${activeOrderId === order.uuid ? 'down' : 'up'}`}></i>
                            </p>
                        </div>
                        {activeOrderId === order.uuid && (
                            <div className="pesananOnlineBoxMore">
                                <div className='tabelPesanan'>
                                    <div className='menuWrapper'>
                                        {order.orderItems.map((item, index) => (
                                            <div className='pesananBox' key={index}>
                                                <img src={`${productAPI}/${item.menu.image || "default.jpg"}`} alt='menu' />
                                                <div className='infoPesanan'>
                                                    <h1> {item.menu.name} </h1>
                                                    <p> Rp. {item.menu.price} </p>
                                                </div>
                                                <p> {item.quantity}x </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='detailPelanggan'>
                                        <h1> Pesanan </h1>
                                        <p> Nama pemesan: {order.recipientName} </p>
                                    </div>
                                </div>
                                <div className='detailHarga'>
                                    <h1> Total Harga </h1>
                                    <p> {formatRupiah(totalPrice)} </p>
                                    <button onClick={() => openPaymentModal(order.uuid, totalPrice)}> Check Out </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

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

export default OnlineOrder
