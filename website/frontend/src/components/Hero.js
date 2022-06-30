import React from 'react';
import { useDispatch } from "react-redux";
import { showGetInvolvedModal } from "reduxStore/GetInvolved/operations";
import useWindowSize from 'utils/customHooks';
import HeroCityImg from 'icons/homepage/hero-city.png';
import HeroCityLargeImg from 'icons/homepage/hero-city-full.png';
import HeroImg from 'assets/img/Hero_Kampala.jpeg';
import Location from 'icons/homepage/hero/location.svg';
import Reload from 'icons/homepage/hero/reload.svg';
import ArrowDown from 'icons/homepage/hero/arrow-down.svg';

const breakPoint = 580;

// eslint-disable-next-line react/button-has-type
const Button = ({ className, label, onClick }) => <button className={className || 'button-hero'} onClick={onClick}>{label}</button>;

const Hero = () => {
  const size = useWindowSize();
  const dispatch = useDispatch();
  const showModal = () => dispatch(showGetInvolvedModal(true))

  return (
        <div className="Hero">
            <span>
                <img src={size.width <= breakPoint ? HeroCityImg : HeroImg} alt="Hero image" />
                {/* <div className="air-quality-reading">
                    <div className="top-reading">
                        <span className="name-wrapper">
                            <Location />
                            <span className="location-name">Nakawa, Kampala</span>
                        </span>
                        <span className="time-wrapper">
                            <span className="location-time">15:21:01(EAT)</span>
                            <Reload />
                        </span>
                    </div>
                    <div className="divider" />
                    <div className="bottom-reading">
                        <span className="category-wrapper">
                            <div className="category-indicator"><span /></div>
                            <span className="category-text">Good</span>
                        </span>
                        <span className="pollutant-wrapper">
                            <span className="value">12 <sub> µg/m<sup>3</sup></sub></span>
                            <span className="pollutant">
                                <span className="text">PM<sub>2.5</sub></span>
                                <ArrowDown />
                            </span>
                        </span>
                    </div>
                </div> */}
            </span>
            <div className="hero-content">
                <div>
                <p className="hero-title">Clean air for <br />all African cities </p>
                <p className="hero-sub"> <span style={{color:"#135DFF"}}>“9 out of 10 people breathe polluted air”.</span> <br/>We empower communities with accurate, hyperlocal and timely air quality data to drive air pollution mitigation actions.</p>
                <div className="hero-buttons">
                    
                    <Button label="Get Involved" onClick={showModal} />
                    <Button className="button-get-involved btn-disabled" label="Explore data" />
                </div>
                </div>
            </div>
        </div>
  );
};

export default Hero;