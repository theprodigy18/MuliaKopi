// import React from 'react'

import { useNavigate } from "react-router-dom";

function SidebarAdmin() {
    let navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token-admin")
        window.location.href = "/admin/auth/login"
    }

    return (
        <div className='sidebar'>
            <div className='adminMenu'>
                <p onClick={() => navigate("/admin/cashier")}> Kasir </p>
                <p onClick={() => navigate("/admin/online-order")}> Pesanan Online</p>
                <p onClick={() => navigate("/admin/transaction-history")}> Riwayat Transaksi </p>
                <p onClick={() => navigate("/admin/daily-report")}> Laporan Harian </p>
                <p onClick={() => navigate("/admin/menu-management")}> Kelola Menu </p>
                <p onClick={handleLogout} className='logout'> Logout {'>>'} </p>
            </div>
            <p className='adminCopyright'> &copy; 2024 Mulia Kopi, Inc. <br /> All Right Reserved. </p>
        </div>
    )
}

export default SidebarAdmin
