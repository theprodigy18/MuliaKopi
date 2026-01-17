// import React from 'react'

import { useEffect, useState } from "react"
import type { Admin, DailyReportData } from "../../interface/Interface"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"
import Loading from "../../components/Loading"
import axios from "axios"
import { closeLoading, showLoading, showWarning } from "../../utilities/Alert"

function DailyReport() {
    const apiURL = import.meta.env.VITE_API_URL
    const transactionAPI = `${apiURL}/transactions`
    const today = new Date(Date.now())
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState(true)
    const [dailyReportData, setDailyReportData] = useState<DailyReportData>(
        {
            todayOrders: 0,
            yesterdayOrders: 0,
            todayRevenue: 0,
            yesterdayRevenue: 0
        }
    )
    const [date, setDate] = useState<string>()

    useEffect(() => {
        async function fetchData() {
            await VerifyTokenAdmin(setAdminData)

            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayString = `${year}-${month}-${day}`; // format: YYYY-MM-D
            setDate(todayString)

            const res = (await axios.get(`${transactionAPI}/get/daily-report/${todayString}`)).data;
            if (res.success) {
                setDailyReportData(res.dailyReportData);
                console.log(res.dailyReportData)
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <Loading />

    const formatDate = (date: Date) => {
        const formattedDate = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);

        return formattedDate;
    }

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    }

    const handleSearchByDate = async () => {
        if (!date) {
            showWarning("Silahkan isi tanggal terlebih dahulu.");
            return
        }

        showLoading()
        axios.get(`${transactionAPI}/get/daily-report/${date}`).then((res) => {
            closeLoading()
            if (res.data.success) {
                setDailyReportData(res.data.dailyReportData)
            }
            else {
                setDailyReportData({
                    todayOrders: 0,
                    yesterdayOrders: 0,
                    todayRevenue: 0,
                    yesterdayRevenue: 0
                })
            }
        }).catch(() => {
            closeLoading()
            setDailyReportData({
                todayOrders: 0,
                yesterdayOrders: 0,
                todayRevenue: 0,
                yesterdayRevenue: 0
            })
            showWarning("Terjadi kesalahan saat mencari laporan harian.")
        })

    }

    return (
        <div>
            <HeaderAdmin name={adminData?.name || ""} />
            <div className='laporanSectionContainer'>
                <h1> Laporan Harian </h1>
                <h2> {formatDate(today)} </h2>
                <div className='laporanList'>
                    <div className='laporanItem'>
                        <i className="fa-solid fa-dollar-sign"></i>
                        <div className='laporanDescription'>
                            <h1> Pemasukan hari ini </h1>
                            <p> {formatRupiah(dailyReportData.todayRevenue)} </p>
                        </div>
                    </div>
                    <div className='laporanItem'>
                        <i className="fa-solid fa-book"></i>
                        <div className='laporanDescription'>
                            <h1> Jumlah transaksi </h1>
                            <p> {dailyReportData.todayOrders} struk tercetak </p>
                        </div>
                    </div>
                </div>

                {dailyReportData.yesterdayRevenue > 0 ? (
                    <div className='statistikContainer'>
                        <h1> Statistik </h1>

                        {/* Pemasukan */}
                        <div className='statistikItem'>
                            <h1> Pemasukan </h1>
                            <div className='statistikBox'>
                                <h1> Pemasukan hari kemarin </h1>
                                <p>{formatRupiah(dailyReportData.yesterdayRevenue)}</p>

                                {dailyReportData.todayRevenue > dailyReportData.yesterdayRevenue ? (
                                    <span style={{ color: "#16ff16" }}>
                                        Pemasukan hari ini naik {(
                                            ((dailyReportData.todayRevenue - dailyReportData.yesterdayRevenue) / dailyReportData.yesterdayRevenue) * 100
                                        ).toFixed(2)}%
                                        <br />
                                        + {formatRupiah(dailyReportData.todayRevenue - dailyReportData.yesterdayRevenue)}
                                    </span>
                                ) : dailyReportData.todayRevenue < dailyReportData.yesterdayRevenue ? (
                                    <span style={{ color: "#9c0000" }}>
                                        Pemasukan hari ini turun {(
                                            ((dailyReportData.yesterdayRevenue - dailyReportData.todayRevenue) / dailyReportData.yesterdayRevenue) * 100
                                        ).toFixed(2)}%
                                        <br />
                                        - {formatRupiah(dailyReportData.yesterdayRevenue - dailyReportData.todayRevenue)}
                                    </span>
                                ) : (
                                    <span style={{ color: "white" }}>
                                        Pemasukan hari ini tidak berubah
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Transaksi */}
                        <div className='statistikItem'>
                            <h1> Transaksi </h1>
                            <div className='statistikBox'>
                                <h1> Transaksi hari kemarin </h1>
                                <p>{dailyReportData.yesterdayOrders} struk tercetak</p>

                                {dailyReportData.todayOrders > dailyReportData.yesterdayOrders ? (
                                    <span style={{ color: "#16ff16" }}>
                                        Transaksi hari ini naik {(
                                            ((dailyReportData.todayOrders - dailyReportData.yesterdayOrders) / dailyReportData.yesterdayOrders) * 100
                                        ).toFixed(2)}%
                                        <br />
                                        + {dailyReportData.todayOrders - dailyReportData.yesterdayOrders} struk
                                    </span>
                                ) : dailyReportData.todayOrders < dailyReportData.yesterdayOrders ? (
                                    <span style={{ color: "#9c0000" }}>
                                        Transaksi hari ini turun {(
                                            ((dailyReportData.yesterdayOrders - dailyReportData.todayOrders) / dailyReportData.yesterdayOrders) * 100
                                        ).toFixed(2)}%
                                        <br />
                                        - {dailyReportData.yesterdayOrders - dailyReportData.todayOrders} struk
                                    </span>
                                ) : (
                                    <span style={{ color: "white" }}>
                                        Transaksi hari ini tidak berubah
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='statistikContainer'>
                        <h1> Tidak Ada Transaksi Hari Kemarin </h1>
                    </div>
                )}

                <div className='dateRangeBar'>
                    <input
                        type='date'
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <button onClick={handleSearchByDate}>Filter</button>
                </div>
            </div>
            <SidebarAdmin />
        </div>
    )
}

export default DailyReport
