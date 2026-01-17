// import React from 'react'

import User from "../../assets/images/User.svg";
import Logo from "../../assets/images/logo_mulia_kopi.png";

function HeaderAdmin({ name } : {
    name: string
}) {
    return (
        <div className='adminHeader'>
            <div className='adminProfile'>
                <img src={User} alt='admin' />
                <p> {name} </p>
            </div>
            <img src={Logo} alt='logo' onClick={() => window.location.href = ("/admin/cashier")} />
        </div>
    )
}

export default HeaderAdmin
