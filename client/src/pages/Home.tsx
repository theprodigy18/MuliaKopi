// import React from 'react'
import { useEffect, useState } from "react"
import Footer from "../components/Footer"
import Header from "../components/Header"
import Highlight from "../components/Highlight"
import NavigationMobile from "../components/NavigationMobile"
import Logo from "../assets/images/logo_mulia_kopi.png"
import Sholat from "../assets/images/sholat.svg"
import Wifi from "../assets/images/wifi.svg"
import Layanan from "../assets/images/layanan.svg"
import Infotainment from "../components/Infotainment"
import Loading from "../components/Loading"
import type { User } from "../interface/Interface"
import { VerifyToken } from "../utilities/VerifiyToken"

function Home() {
    const [userData, setUserData] = useState<User>()
    const [loading, setLoading] = useState(true)
    

    useEffect(() => {
        async function fetchData() {
            await VerifyToken(setUserData)

            setLoading(false)
        }

        fetchData();
    }, [])

    if (loading) return <Loading />

    return (
        <div className='homeBody'>
            <Header userData={userData as User} />
            <Highlight loginStatus={userData ? true : false} />
            <div className='secondBody'>
                <NavigationMobile loginStatus={userData ? true : false} />

                {/* About Us */}
                <div className='aboutContainer' id='aboutUs'>
                    <h1> Tentang kami </h1>
                    <div className='aboutUs'>
                        <div className='leftAbout'>
                            <p> Mulia kopi adalah cofee shop yang bertemakan sub tropis dengan tempat yang menyajikan pemandangan alam yang memanjakan mata. </p>
                            <p> Tempat yang strategis untuk menikmati kopi dengan berbagai varian dan tempat yang cocok untuk kaum mahasiswa yang membutuhkan tempat mengerjakan tugas maupun rapat semi formal. </p>
                        </div>
                        <div className='rightAbout'>
                            <img src={Logo} alt='logo' />
                        </div>
                    </div>
                </div>

                {/* Infotainment */}
                <Infotainment />

                {/* Facility */}
                <div className='facilityContainer'>
                    <p> Fasilitas dan layanan yang tersedia <i className="fa-solid fa-arrow-right"></i></p>
                    <div className='facility'>
                        <div className='facilityBox'>
                            <img src={Sholat} alt='logo' />
                            <div className='oval'>
                                <h1> Mushola </h1>
                                <p> Kami menyediakan mushola untuk penunjang ibadah bagi seorang muslim </p>
                            </div>
                            <p className='facilityLabel'> Fasilitas </p>
                        </div>
                        <div className='facilityBox'>
                            <img src={Wifi} alt='logo' />
                            <div className='oval'>
                                <h1> Wi-Fi </h1>
                                <p> Kami menyediakan wifi dengan kecepatan 50 mbps yang dapat menunjang segala aktivitas anda </p>
                            </div>
                            <p className='facilityLabel'> Fasilitas </p>
                        </div>
                        <div className='facilityBox'>
                            <img src={Layanan} alt='logo' />
                            <div className='oval'>
                                <h1> Layanan </h1>
                                <p> Kami menyedia layanan yang senantiasa membantu anda </p>
                            </div>
                            <p className='facilityLabel'> Layanan </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home
