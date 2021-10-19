import React from 'react';
import PlaceHolder from 'icons/homepage/PlaceHolder';
import Google from 'icons/homepage/partners/google.svg';
import WorldBankGroup from 'icons/homepage/partners/worldbankgroup.svg';
import BirminghamUniversity from 'icons/homepage/partners/birmingham-university.svg';
import Zindi from 'icons/homepage/partners/zindi.svg';
import ESPRC from 'icons/homepage/partners/EPSRC.svg';
import NRF from 'icons/homepage/partners/NRF.svg';
import ColumbiaUniversity from 'icons/homepage/partners/columbia-university.svg';
import ASAP from 'icons/homepage/partners/ASAP.svg';
import NavTab from '../components/nav/NavTab';

const Icon = ({ icon }) => (
        <div className="icon">{icon}</div>
);

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
        <div className="partner-section">
            <div>
                <div className="text">Our Partners</div>
                <div className="icon-wrapper">
                    <Icon icon={<Google height={76} width={164} />} />
                    <Icon icon={<WorldBankGroup width={124} height={124} />} />
                    <Icon icon={<BirminghamUniversity width={220} height={102} />} />
                    <Icon icon={<Zindi width={220} height={102} />} />
                    <Icon icon={<ESPRC width={192} height={90} />} />
                    <Icon icon={<NRF width={234} height={108} />} />
                    <Icon icon={<ColumbiaUniversity width={220} height={102} />} />
                    <Icon icon={<ASAP width={220} height={102} />} />
                </div>
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
