import React from 'react';
import useWindowSize from 'utils/customHooks';
import HeroCityImg from 'icons/homepage/hero-city.png';
import HeroCityLargeImg from 'icons/homepage/hero-city-full.png';
import HeroImg from 'assets/img/hero-img.png';
import Location from 'icons/homepage/hero/location.svg';
import Reload from 'icons/homepage/hero/reload.svg';
import ArrowDown from 'icons/homepage/hero/arrow-down.svg';
import { Link } from 'react-router-dom';

const breakPoint = 580;

const Button = ({ className, label, path, externalLink }) => {
    return(
        externalLink ? <a style={{ textDecoration:"none", color:"#fff" }} className={'button-hero'} href={path}>{label}</a> : <Link to={path}><button className={className}>{label}</button></Link>
    );
}

const Hero = () => {
  const size = useWindowSize();

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
                    <Button label="Explore data" path="https://platform.airqo.net/request-access?tenant=airqo" externalLink />
                    <Button className="button-get-involved" label="Get Involved" path="/get-involved" />
                </div>
                </div>
            </div>
        </div>
  );
};

export default Hero;