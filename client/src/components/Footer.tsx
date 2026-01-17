// import React from 'react'
import Maps from "../assets/images/maps.svg";
import Icon from "../assets/images/icon_map.svg";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Schedule } from "../interface/Interface";


function Footer() {
    const apiURL = import.meta.env.VITE_API_URL
    const schedulesAPI = `${apiURL}/schedules`
    const [schedules, setSchedules] = useState<Schedule[]>([])


    useEffect(() => {
        async function fetchData() {
            const schedulesRes = (await axios.get(`${schedulesAPI}/get/all`)).data

            if (schedulesRes.success) {
                setSchedules(schedulesRes.schedules)
            }
        }

        fetchData();
    }, [])


    return (
        <div className='footer' id='footer'>
            <div className="locationSection">
                <h2> Lokasi Kami <img src={Icon} alt='icon' /></h2>
                <a className="mapContainer" href='https://maps.app.goo.gl/AvgkF7ZZVkx9hLNL9'>
                    <img src={Maps} alt="Lokasi pada peta" />
                </a>
                <div className="socialLinks">

                    <a href="https://www.instagram.com/kedai_yangmulia?utm_source=ig_web_button_share_sheet&igsh=ZWlwdW5jN2M4ZjYy" className="socialIcon"><i className="fab fa-instagram"></i></a>
                    {/* <a href="/" className="socialIcon"><i className="fab fa-whatsapp"></i></a> */}
                </div>
            </div>
            <div className='scheduleSection'>
                <h2> Waktu Buka <i className="fas fa-clock"></i> </h2>
                <div className='scheduleList'>
                    {schedules.map((value, key) => {
                        const start = value.start.slice(0, 5).replace(":", ".");
                        const end = value.end.slice(0, 5).replace(":", ".");

                        const schedule = `${start} - ${end}`;

                        return (
                            <div className="scheduleItem" key={key}>
                                <span> {value.day} </span>
                                <span> {schedule} </span>
                            </div>
                        );
                    })}
                </div>
                {schedules.length === 0 && (
                    <div className="scheduleItem">
                        <span> Tidak ada jadwal </span>
                    </div>
                )}
            </div>
            <div className='copyright'>
                &copy; 2024 Mulia Kopi, Inc. All Right Reserved.
            </div>
        </div>
    )
}

export default Footer
