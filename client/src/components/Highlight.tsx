// import React from 'react'
import Person from "../assets/images/person-mood.svg"
import { showWarning } from "../utilities/Alert"


function Highlight({ loginStatus } :
    {
        loginStatus: boolean
    }) {


    const handleScanButton = () => {
        if (loginStatus) window.location.href = "/scan-mood"
        else showWarning("Silahkan login terlebih dahulu.");
    }

    return (
        <div className='highlightContainer'>
            <div className='personMood'>
                <div>
                    <img src={Person} alt='person' />
                    <div className='moodDetail'>
                        <p className='title'> Bagaimana mood mu hari ini? </p>
                        <p> Dapatkan rekomendasi menu yang cocok sesuai dengan mood mu </p>
                    </div>
                </div>
            </div>
            <div className='cekMood'>
                <h1> Cek mood yuk </h1>
                <p> Kami dapat membantu anda untuk memilih menu apa yang tepat buat mngembalikan mood anda </p>
                <div onClick={handleScanButton} className='scanMood'>
                    <p> scan now </p>
                </div>
            </div>
        </div>
    )
}

export default Highlight
