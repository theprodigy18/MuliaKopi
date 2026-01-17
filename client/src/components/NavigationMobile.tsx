// import React from 'react'

import Kopi from "../assets/images/kopi-logo.svg";
import NonKopi from "../assets/images/nonkopi-logo.svg";
import Makanan from "../assets/images/makanan-logo.svg";
import { showWarning } from "../utilities/Alert";


function NavigationMobile({ loginStatus }: 
    { 
        loginStatus: boolean 
    }) {


    const handleScanButton = () => {
        if (loginStatus) window.location.href = "/scan-mood"
        else showWarning("Silahkan login terlebih dahulu.");
    }

    return (
        <div className='navMobileContainer'>
            <div className='scanMood' onClick={handleScanButton}>
                <p> scan now </p>
            </div>
            <div className='categoryMenuMobile'>
                <div className='categoryBox'>
                    <a href='/menu-mobile/kopi'>
                        <img src={Kopi} alt='logo' />
                    </a>
                    <p> Kopi </p>
                </div>
                <div className='categoryBox'>
                    <a href='/menu-mobile/non-kopi'>
                        <img src={NonKopi} alt='logo' />
                    </a>
                    <p> Non Kopi </p>
                </div>
                <div className='categoryBox'>
                    <a href='/menu-mobile/makanan'>
                        <img src={Makanan} alt='logo' />
                    </a>
                    <p> Makanan </p>
                </div>
            </div>
        </div>
    )
}

export default NavigationMobile
