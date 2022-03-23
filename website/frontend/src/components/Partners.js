import React from 'react'
import Google from 'icons/homepage/partners/google.svg';
import WorldBankGroup from 'icons/homepage/partners/worldbankgroup.svg';
import BirminghamUniversity from 'icons/homepage/partners/birmingham-university.svg';
import Zindi from 'icons/homepage/partners/zindi.svg';
import ESPRC from 'icons/homepage/partners/EPSRC.svg';
import NRF from 'icons/homepage/partners/NRF.svg';
import ColumbiaUniversity from 'icons/homepage/partners/columbia-university.svg';
import ASAP from 'icons/homepage/partners/ASAP.svg';

const Partners = () => {
    return (
        <div className='home-partners'>
            <div className='backdrop'>
                <div id='title'>
                    <span><strong>50+</strong> Partners trust AirQo</span>
                </div>
                <div className='logos-web'>
                    <div className='logo'>
                        <div><ESPRC /></div>
                        <div><Google /></div>
                        <div><WorldBankGroup /></div>
                        <div><BirminghamUniversity /></div>
                        <div><Zindi /></div>
                        <div><NRF /></div>
                        <div><ColumbiaUniversity /></div>
                        <div><ASAP /></div>
                    </div>
                </div>
                <div className='logos-mobile'>
                    <div className='mobile-row' id="row1">
                        <div><ESPRC /></div>
                        <div><Google /></div>
                        <div><WorldBankGroup /></div>
                        <div><BirminghamUniversity /></div>
                    </div>
                    <div className='mobile-row' id="row2">
                        <div><Zindi /></div>
                        <div><NRF /></div>
                        <div><ColumbiaUniversity /></div>
                        <div><ASAP /></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Partners;