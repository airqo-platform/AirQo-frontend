import React from 'react';
import MonitorImg from 'assets/img/monitor.png';
import { Link } from 'react-router-dom';


const Monitor = () => {
    

    return(
        <div className="Monitor">
            <div className="monitor-content">
                <div className="label"><span>Air Quality Monitor</span></div>
                <p className="text-main">High-resolution air quality monitoring network</p>
                <p className="text-sub">We deploy a high-resolution air quality monitoring network in target urban areas across Africa to increase awareness and understanding of air quality management, provide actionable information and derive actions against air pollution</p>
                <Link to='/products/monitor'><p className="learn-more"><span>Learn more {'-->'}</span></p></Link>
            </div>
            <div className='Monitor-img'>
                <img src={MonitorImg} alt="Monitor Image"></img>
            </div>
        </div>
);
    };

export default Monitor;