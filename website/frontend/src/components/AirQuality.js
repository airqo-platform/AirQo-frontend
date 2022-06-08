import React from 'react'
import AirQualityImg from 'assets/img/AirQuality.png'

const AirQuality = () => {
    return (
        <div className='air-quality-section'>
            <div className='header'>
                <h2>Closing the air quality data gaps in Africa </h2>
                <p>We provide accurate, hyperlocal, and timely air quality data to provide evidence of the magnitude and scale of air pollution across Africa.</p>
                <div className='tabs'>
                    <div><span>For African Cities</span></div>
                    <div><span>For Communities</span></div>
                </div>
            </div>
            <div className='content'>
                <div className='content-container'>
                    <div className='selected'>
                        <h4>High resolution network</h4>
                        <ol>
                            <li><small>We want cleaner air in all African cities</small></li>
                            <li><small>— We leverage our understanding of the African context</small></li>
                        </ol>
                    </div>
                    <div className='unselected'>
                        <h4>Digital air quality platforms</h4>
                        <ol>
                            <li><small>— We empower decision-makers in African cities</small></li>
                            <li><small>— We increased access to air quality data evidence </small></li>
                        </ol>
                    </div>
                    <div className='unselected'>
                        <h4>Policy Engagement</h4>
                        <ol>
                            <li><small>— We engage city authorities and government agencies</small></li>
                            <li><small>— We empower local leaders with air quality information</small></li>
                        </ol>
                    </div>
                </div>
                <div className='image'>
                    <img src={AirQualityImg} alt='AirQuality image'/>
                </div>
            </div>
        </div>
    )
}

export default AirQuality;