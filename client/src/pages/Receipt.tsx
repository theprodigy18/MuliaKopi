// import React from 'react'

import { useEffect, useState } from "react"
import Header from "../components/Header"
import { useParams } from "react-router-dom"
import type { Order, User } from "../interface/Interface"
import axios from "axios"
import Loading from "../components/Loading"
import Footer from "../components/Footer"
import ReceiptHeader from "../assets/images/receipt-header.png"
import { VerifyToken } from "../utilities/VerifiyToken"

function Receipt() {
    const apiURL = import.meta.env.VITE_API_URL
    const ordersAPI = `${apiURL}/orders`
    const { uniqueCode } = useParams()
    const [userData, setUserData] = useState<User>()
    const [order, setOrder] = useState<Order>()
    const [loading, setLoading] = useState(true)
    const [priceTotal, setPriceTotal] = useState(0)

    useEffect(() => {
        if (!uniqueCode) {
            window.location.href = '/'
            return
        }

        async function fetchData() {
            const user = await VerifyToken(setUserData, true)

            const orderRes = (await axios.get(`${ordersAPI}/get/by-user-id-and-unique-code/${user.uuid}/${uniqueCode}`)).data

            if (!orderRes.success) {
                window.location.href = '/'
                return
            }

            if (orderRes.order.paymentStatus) {
                window.location.href = '/'
                return
            }

            const total = orderRes.order.orderItems.reduce((total: number, item: any) => total + item.subPrice, 0)
            setPriceTotal(total)
            setOrder(orderRes.order)
            setLoading(false)

        }

        fetchData();
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
            <Header userData={userData as User} />
            <div className='strukOnlineContainer'>
                <img src={ReceiptHeader} alt='head images' />
                <div className='mobileBg'> Receipt </div>
                <div className='strukOnlineWrapper'>
                    <div className='strukOnlineBox'>
                        <h1> --MULIA KOPI-- </h1>
                        <div className='customerDetail'>
                            <p> Order by <b> {order?.recipientName} </b> </p>
                            <p> {formatDate(order?.createdAt as string)} </p>
                        </div>
                        <span className='straightLine'></span>
                        <span className='straightLine'></span>
                        <div className='strukContent'>
                            <div className='strukOnlineItem'>
                                <h1> Description </h1>
                                <h1> Price </h1>
                            </div>
                            {order?.orderItems.map((item, key) => {
                                return (
                                    <div className='strukOnlineItem' key={key}>
                                        <p> {item.menu.name} {item.quantity}x </p>
                                        <p> {formatRupiah(item.subPrice)} </p>
                                    </div>
                                )
                            })}
                        </div>
                        <span className='straightLine'></span>
                        <span className='straightLine'></span>
                        <div className='strukTotal'>
                            <p> Total Harga: </p>
                            <p> {formatRupiah(priceTotal)} </p>
                        </div>
                        <div className='code'>
                            <p> Ini adalah kode pesanan anda: </p>
                            <h1> {order?.uniqueCode} </h1>
                            <p> Silahkan membawa kode ini ke kasir untuk melakukan pembayaran. </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Receipt
