import React from 'react';
import ArrowRight from 'icons/homepage/arrow-right.svg';
import MonitorImg from 'assets/img/monitor.png';

const Monitor = () => (
        <div className="Monitor">
            <div className="monitor-content">
                <div className="label"><span>Air Quality Monitor</span></div>
                <p className="text-main">High-resolution air quality monitoring network</p>
                <p className="text-sub">We deploy a high-resolution air quality monitoring network in target urban areas across Africa to increase awareness and understanding of air quality management, provide actionable information and derive actions against air pollution</p>
                {/* <p className="learn-more"><span>Lean more</span><ArrowRight style={{ marginLeft: '5px' }} /></p> */}
            </div>
            <div className='Monitor-img'>
                <img src={MonitorImg} alt="Monitor Image"></img>
            </div>
        </div>
);

export default Monitor;