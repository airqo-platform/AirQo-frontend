import React from 'react'
import TopBarNav from '../../components/CleanAir/TopBarNav'

const CleanAirPageContainer = ({ children }) => {
    return (
        <div className='Page Clean-air-page'>
            <TopBarNav />
            <div className='page-wrapper page-container'>
                {children}
            </div>
        </div>
    )
}

export default CleanAirPageContainer;