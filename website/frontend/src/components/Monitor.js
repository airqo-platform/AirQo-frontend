import React from 'react';
import ArrowRight from 'icons/homepage/arrow-right.svg';
import MonitorImg from 'assets/img/monitor.png';

const Monitor = () => (
        <div className="Monitor">
            <div className="monitor-content">
                <div className="label"><span>Air Quality Monitors</span></div>
                <p className="text-main">Low-cost air quality monitoring device</p>
                <p className="text-sub">Our signature low-cost air quality monitor is locally built and uniquely designed to withstand physical environmental conditions.</p>
                {/* <p className="learn-more"><span>Lean more</span><ArrowRight style={{ marginLeft: '5px' }} /></p> */}
            </div>
            <div className='Monitor-img'>
                <img src={MonitorImg} alt="Monitor Image"></img>
            </div>
        </div>
);

export default Monitor;
