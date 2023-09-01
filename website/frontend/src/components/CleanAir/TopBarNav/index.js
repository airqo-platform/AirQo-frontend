import React from 'react'
import { Link } from 'react-router-dom'
import NavTab from '../../nav/NavTab';

const TopBarNav = () => {
    return (
        <div className="TopBar">
            <div className="wrapper">
                <div className="logo">
                    <Link to='/clean-air'>
                        <div style={{ border: '3px solid red' }}> CLEAN-Air logo</div>
                    </Link>
                </div>
                <div className="nav-center" id="nav-center">
                    <div className="nav-wrapper">
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <span>Partners</span>
                            <span>Events</span>
                            <span>Press</span>
                            <NavTab text="Get involved" hideArrow colored />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopBarNav