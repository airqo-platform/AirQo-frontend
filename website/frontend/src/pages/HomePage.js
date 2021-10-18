import React from 'react';
import PlaceHolder from 'icons/homepage/PlaceHolder';
import NavTab from '../components/nav/NavTab';

const HomePage = () => (
    <div className="HomePage">
        <div className="intro-container">
            <div className="container">
                <div className="text-container">
                    <div className="text-primary">Clean Air for all African Cities </div>
                    <div className="text-secondary">We empower communities with accurate, hyperlocal and timely air quality data to drive air pollution mitigation actions.</div>
                    <div className="btn-container">
                        <NavTab text="Get the App — It’s free" width={236} hideArrow filled style={{ marginRight: '17px' }} />
                        <NavTab text="Get involved" width={160} hideArrow colored />
                    </div>
                </div>
                <PlaceHolder />
            </div>
        </div>
        <div className="subscribe-container">
            <div className="text-primary">Get air quality updates!</div>
            <div className="text-secondary">Subscribe to our newsletter and learn about the quality of the air you are breathing</div>
            <div className="btn-container">
                <div className="input"><div className="text">Enter email</div></div>
                <div className="button">Subscribe</div>
            </div>
        </div>
    </div>
);

export default HomePage;
