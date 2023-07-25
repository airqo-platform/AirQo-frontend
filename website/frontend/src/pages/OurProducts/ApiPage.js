import React from 'react'
import Page from '../Page';
import { useInitScrollTop } from 'utils/customHooks';
import Header from '../../components/OurProducts/Header';
import NavTab from '../../components/nav/NavTab';

const ApiPage = () => {
    useInitScrollTop();
    return (
        <Page>
            <div className="product-page mobile-app analytics">
                <Header
                    style={{ backgroundColor: '#FFFDEA' }}
                    pageTitle={'AirQo API'}
                    title={'AirQo’s Application Programming Interface.'}
                    subText={
                        ' Are you a developer? We invite you to access and leverage our open-air quality data on your Application. Our free API enables seamless integration with applications and provides you with real-time, historical, and forecast raw and calibrated air quality data.'
                    }>
                    <img src={''} alt="" />
                </Header>
                <div className="content">
                    <div className="grid-wrapper column section section-1">
                        <div className="row">
                            <h2 className="left title">
                                Know your <span className="blue">Air</span>
                            </h2>
                            <p className="right">
                                The AirQo Air quality Mobile App is the first of its kind in Africa. With the App,
                                you have access to real-time and forecast air quality information from monitored
                                urban areas across major cities in Africa.
                            </p>
                        </div>
                        <div className="overlap-section">
                            <div className="lapping-left card" style={{ backgroundColor: '#F2F1F6' }}>
                                <h5>Personalized air quality alerts and notifications</h5>
                                <p>
                                    Receive personalized air quality alerts and recommendations to empower you to take
                                    action and stay healthy.
                                    <br />
                                    <br /> Set up your favourite places to quickly check the quality of air in areas
                                    that matter to you.
                                    <br />
                                    <br /> Turn on the notifications to know the quality of the air you are breathing.{' '}
                                    <br />
                                    <br /> You will receive a push notification whenever the quality of air is clean
                                    or gets above the recommended safe levels.
                                </p>
                            </div>
                            <div className="lapping-left image" id="section-1">
                                <img src={''} alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="grid-wrapper section">
                        <div className="overlap-section">
                            <div
                                className="lapping-right card larger-top"
                                style={{ backgroundColor: '#F2F1F6' }}>
                                <h5>Real-time and forecast</h5>
                                <p>
                                    Our App gives you access to real-time and forecast air quality information at the
                                    palm of your hands, giving you the power to make informed decisions about your
                                    daily activities. <br /> <br />
                                    Our 24-hour air quality forecast developed using Machine
                                    Learning and AI provides you with the power to better plan your day, know when to
                                    take a walk or a jog to avoid air pollution and stay healthy.
                                </p>
                            </div>
                            <div className="lapping-right image" id="section-2">
                                <img src={''} alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="grid-full column section landscape-section" style={{ backgroundColor: '#FFFDEA' }}>
                        <div className="column smaller-width">
                            <h2 className="left title">
                                <span className="blue">Easy to use</span> interface
                            </h2>
                            <p className="right">
                                Our visualization charts are designed to help you easily interpret and gain insights
                                into the data while giving you access to air quality trends in African Cities over
                                time. With our easy-to-use interface, you can track and visualise air quality trends
                                over time.
                            </p>
                            <NavTab text="Read Docs" path="/" hideArrow filled />
                        </div>
                        <div className="image">
                            <img src={''} alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    )
}

export default ApiPage