import React from 'react'
import GOOGLE from 'icons/homepage/partners/google.svg';
import WBG from 'icons/homepage/partners/worldbankgroup.svg';
import BU from 'icons/homepage/partners/birmingham-university.svg';
import ZINDI from 'icons/homepage/partners/zindi.svg';
import EPSRC from 'icons/homepage/partners/EPSRC.svg';
import NRF from 'icons/homepage/partners/NRF.svg';
import CU from 'icons/homepage/partners/columbia-university.svg';
import ASAP from 'icons/homepage/partners/ASAP.svg';
import Epsrc from 'icons/homepage/partners-sm/epsrc.svg';
import Google from 'icons/homepage/partners-sm/google.svg';
import BirminghamUniversity from 'icons/homepage/partners-sm/birmingham.svg';
import Zindi from 'icons/homepage/partners-sm/zindi.svg';

const Partners = () => {
    return (
        <div className='home-partners'>
            <div className='backdrop'>
                <div id='title'>
                    <span><strong>50+</strong> Partners trust AirQo</span>
                </div>
                <div className='logos-web'>
                    <div className='logo'>
                        <div><EPSRC /></div>
                        <div><GOOGLE /></div>
                        <div><WBG /></div>
                        <div><BU /></div>
                        <div><ZINDI /></div>
                        <div><NRF /></div>
                        <div><CU /></div>
                        <div><ASAP /></div>
                    </div>
                </div>
                <div className='logos-mobile'>
                    <div className='mobile-row' id="row1">
                        <div><Epsrc /></div>
                        <div><Google /></div>
                        <div><WBG /></div>
                        <div><ZINDI /></div>
                    </div>
                    <div className='mobile-row' id="row2">
                        <div><BirminghamUniversity /></div>
                        <div><Zindi /></div>
                        <div><CU /></div>
                        <div><ASAP /></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Partners;