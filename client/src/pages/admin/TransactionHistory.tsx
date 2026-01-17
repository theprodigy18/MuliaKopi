// import React from 'react'

import { useEffect, useState } from "react"
import type { Admin, Transaction } from "../../interface/Interface"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import Loading from "../../components/Loading"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"
import axios from "axios"
import { closeLoading, showError, showLoading } from "../../utilities/Alert"

function TransactionHistory() {
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const transactionsAPI = `${apiURL}/transactions`
    const productAPI = `${imageURL}/products`
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [activeOrderId, setActiveOrderId] = useState<string>("")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")

    useEffect(() => {
        async function fetchData() {
            await VerifyTokenAdmin(setAdminData)

            const now = new Date(Date.now())
            const year = now.getFullYear();
            const month = now.getMonth() + 1; // getMonth() 0-based

            const paddedMonth = String(month).padStart(2, '0');

            // Ambil hari terakhir bulan (misal 28, 30, atau 31)
            const lastDayOfMonth = new Date(year, month, 0).getDate();

            const start = `${year}-${paddedMonth}-01`;
            const end = `${year}-${paddedMonth}-${String(lastDayOfMonth).padStart(2, '0')}`;
            setStartDate(start)
            setEndDate(end)

            const res = (await axios.get(`${transactionsAPI}/get/by-range-date/${start}/${end}`)).data

            if (res.success) {
                setTransactions(res.transactions)
            }
            
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <Loading />

    const formatDate = (date: string) => {
        const createdAt = new Date(date);
        const options = {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        } as const;

        const formattedDate = createdAt.toLocaleString('en-US', options).replace(',', '.');

        return formattedDate;
    }

    const toggleOrderId = (orderId: string) => {
        if (activeOrderId === orderId) {
            setActiveOrderId("")
        } else {
            setActiveOrderId(orderId)
        }
    }

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    const handleSearchByDate = () => {
        showLoading()
        axios.get(`${transactionsAPI}/get/by-range-date/${startDate}/${endDate}`).then((res) => {
            closeLoading()
            if (res.data.success) {
                setTransactions(res.data.transactions)
            }
            else {
                setTransactions([])
            }
        }).catch(() => {
            closeLoading()
            setTransactions([])
            showError("Terjadi kesalahan saat mencari transaksi.")
        })
    }

    return (
        <div>
            <HeaderAdmin name={adminData?.name as string} />
            <div className='pesananSectionContainerWrapper'>
                {transactions.map((transaction, key) => (
                        <div className='pesananSectionContainer' key={key}>
                            <div className='pesananOnlineBox'>
                                <div className='detail'>
                                    <h1> Nama Pelanggan: {transaction.order.recipientName} </h1>
                                    <p> {formatDate(transaction.createdAt)} </p>
                                </div>
                                <p onClick={() => toggleOrderId(transaction.orderId)}>
                                    <i className={`fa-solid fa-caret-${activeOrderId === transaction.orderId ? 'down' : 'up'}`}></i>
                                </p>
                            </div>
                            {activeOrderId === transaction.orderId && (
                                <div className="pesananOnlineBoxMore">
                                    <div className='tabelPesanan'>
                                        <div className='menuWrapper'>
                                            {transaction.order.orderItems.map((item, key) => (
                                                <div className='pesananBox' key={key}>
                                                    <img src={`${productAPI}/${item.menu.image || 'default.jpg'}`} alt='menu' />
                                                    <div className='infoPesanan'>
                                                        <h1> {item.menu.name} </h1>
                                                        <p> {formatRupiah(item.menu.price)} </p>
                                                    </div>
                                                    <p> {item.quantity}x </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className='detailPelanggan'>
                                            <h1> Pesanan </h1>
                                            {transaction.order.userId ? (
                                                <p> Asal Pesanan: Sistem </p>
                                            ) : (

                                                <p> Asal Pesanan: Kasir </p>
                                            )}
                                            <p> Metode Pembayaran: {transaction.paymentMethod} </p>
                                            <p> Nama Kasir: {transaction.admin.name} </p>
                                        </div>
                                    </div>
                                    <div className='detailHarga'>
                                        <h1> Total Harga </h1>
                                        <p> {formatRupiah(transaction.totalPrice)} </p>
                                        <button onClick={() => window.location.href = (`/admin/receipt/${transaction.order.uniqueCode.toLowerCase()}`)}> Lihat Struk </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}

                <div className='dateRangeBar'>
                    <input
                        type='date'
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span>s/d</span>
                    <input
                        type='date'
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <button onClick={handleSearchByDate}>Filter</button>
                </div>
            </div>
            <SidebarAdmin />
        </div>
    )
}

export default TransactionHistory
