import React, { useState } from 'react'
import AfricanCities from './AfricanCities'
import Communities from './Communities'

const AirQuality = () => {
    const [selectedTab, setSelectedTab] = useState('AfricanCities')
    const onClickTabItem = (tab) => setSelectedTab(tab)

    return (
        <div className='airquality-section'>
            <div className='backdrop'>
                <div className='header'>
                    <h2>Closing the air quality data gaps in Africa </h2>
                    <p>We provide accurate, hyperlocal, and timely air quality data to provide evidence of the magnitude and scale of air pollution across Africa.</p>
                    <div className='tabs'>
                        <div>
                            <span className={selectedTab === 'AfricanCities' ? "tab tab-selected" : "tab"}
                                name='AfricanCities'
                                onClick={() => onClickTabItem('AfricanCities')}>
                                For African Cities
                            </span>
                        </div>
                        <div>
                            <span className={selectedTab === 'Communities' ? "tab tab-selected" : "tab"}
                                name='Communities'
                                onClick={() => onClickTabItem('Communities')}>
                                For Communities
                            </span>
                        </div>
                    </div>
                </div>
                <div className='content'>
                    {
                        selectedTab === 'AfricanCities' ? 
                        <AfricanCities />
                        :
                        <Communities />
                    }
                </div>
            </div>
        </div>
    )
}

export default AirQuality;