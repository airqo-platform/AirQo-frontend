import React from 'react';
import useWindowSize from 'utils/customHooks';
import HeroCityImg from 'icons/homepage/hero-city.png';
import HeroCityLargeImg from 'icons/homepage/hero-city-full.png';

const breakPoint = 580;

const Button = ({ className, label }) => <button className={className || 'button-hero'}>{label}</button>;

const Hero = () => {
  const size = useWindowSize();

  return (
        <div className="Hero">
            <img src={size.width <= breakPoint ? HeroCityImg : HeroCityLargeImg} alt="Hero image" />
            <div className="hero-content">
                <div>
                <p className="hero-title">Clean air for <br />all African Cities </p>
                <p className="hero-sub">We empower communities with accurate, hyperlocal and timely air quality data to
                    drive air pollution mitigation actions.
                </p>
                <div className="hero-buttons">
                    <Button label="Request demo" />
                    <Button className="button-get-involved" label="Get Involved" />
                </div>
                </div>
            </div>
        </div>
  );
};

export default Hero;
