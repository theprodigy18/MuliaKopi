// import React from 'react'

import { useEffect, useState } from "react"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"
import type { Admin, Transaction } from "../../interface/Interface"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import Loading from "../../components/Loading"
import { useParams } from "react-router-dom"
import axios from "axios"
import SuccessIcon from "../../assets/images/Success Icon.png"
import LogoStruk from "../../assets/images/logo-struk.png"
import BottomLine from "../../assets/images/Group 69.png"

function ReceiptAdmin() {
    const apiURL = import.meta.env.VITE_API_URL
    const transactionsAPI = `${apiURL}/transactions`
    const { uniqueCode } = useParams()
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState(true)
    const [transaction, setTransaction] = useState<Transaction>()

    useEffect(() => {
        if (!uniqueCode) {
            window.location.href = '/admin/cashier'
            return
        }

        async function fetchData() {
            await VerifyTokenAdmin(setAdminData)

            const res = (await axios.get(`${transactionsAPI}/get/by-order-unique-code/${uniqueCode?.toUpperCase()}`)).data

            if (res.success) {
                setTransaction(res.transaction)
            }
            else {
                window.location.href = '/admin/cashier'
                return
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

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    return (
        <div>
            <HeaderAdmin name={adminData?.name as string} />
            <div className='strukContainer'>
                {transaction && (
                    <div className='strukBox'>
                        <div className='title'>
                            <p> Payment </p>
                        </div>

                        <div className='struk'>
                            <img src={SuccessIcon} alt='ceklist' className='ceklist' />
                            <h1> Payment Detail </h1>
                            <p> {formatDate(transaction.createdAt)} </p>
                            <div className='strukItem'>
                                <h1> Nama Pelanggan </h1>
                                <p> {transaction.order.recipientName} </p>
                            </div>
                            <div className='strukItem'>
                                <h1> Nama Kasir </h1>
                                <p> {transaction.admin.name} </p>
                            </div>
                            <span></span> {/* line */}
                            {transaction.order.uniqueCode && (
                                <div className='uniqueCode'> {transaction.order.uniqueCode} </div>
                            )}
                            {transaction.order.orderItems.map((item, key) => {

                                return (
                                    <div className='strukItem' key={key}>
                                        <h1> {item.menu.name} x{item.quantity} </h1>
                                        <p> {formatRupiah(item.subPrice)} </p>
                                    </div>
                                )
                            })}
                            <span></span> {/* line */}
                            <div className='strukItem'>
                                <h1> Total Harga </h1>
                                <p> {formatRupiah(transaction.totalPrice)} </p>
                            </div>
                            <div className='strukItem'>
                                <h1> Pembayaran </h1>
                                <p> {transaction.paymentMethod} </p>
                            </div>
                            <img src={LogoStruk} alt='logo' className='logoMulia' />
                            <h2 className='alamat'> gg sawah, Jl. Bendungan Sutami, Sumbersari, <br /> Kec. Lowokwaru, Kota Malang </h2>
                            <img src={BottomLine} alt='round' className='rounderBottom' />
                        </div>
                        <button> Cetak Struk </button>
                    </div>
                )}
            </div>
            <SidebarAdmin />
        </div>
    )
}

export default ReceiptAdmin
