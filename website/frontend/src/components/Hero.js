import React from 'react';
import HeroCity from 'icons/homepage/hero-city.png';

const Button = ({ className, label }) => <button className={className || 'button-hero'}>{label}</button>;

const Hero = () => (
        <div className="Hero">
            <img src={HeroCity} alt="Hero image" />
            <p className="hero-title">Clean air for all African Cities </p>
            <p className="hero-sub">We empower communities with accurate, hyperlocal and timely air quality data to drive air pollution mitigation actions.</p>
            <div>
                <Button label="Request a demo" />
                <Button className="button-signin" label="Sign in" />
            </div>
        </div>
);

export default Hero;
