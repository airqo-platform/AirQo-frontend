import React from 'react'
import Google from 'icons/homepage/partners/google.svg';
import USMission from 'icons/homepage/partners/usmission.svg';
import Enabel from 'icons/homepage/partners/Enabel.svg';
import WBG from 'icons/homepage/partners/wbg.svg';
import UN from 'icons/homepage/partners/UN.svg';

const Partners = () => {
  return (
    <div className='partners-section'>
        <div className='backdrop'>
            <div className='content'>
                <div>
                    <span className='title'> Airqo is trusted by over <strong>20+ partners</strong></span>
                </div>
                <div className='logos'>
                    <div><Google/> </div>
                    <div><USMission/> </div>
                    <div><Enabel /> </div>
                    <div><WBG /> </div>
                    <div><UN /> </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Partners;