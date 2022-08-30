import React from 'react';
import ApiSectionImg from "assets/img/ApiSection.png";

const ApiSection = () => (
    <div className="Apisection">
        <div className="Apisection-details">
            <h3>Air Quality API</h3>
            <h1>Amplify air quality impact through our API</h1>
            <p>Are you a developer? We invite you to leverage our open-air quality data on your App </p>
            <div className="Apisection-details-btn">
                <a href="https://docs.airqo.net/airqo-rest-api-documentation/" target="_blank">Get Started {'-->'}</a>
            </div>
        </div>
        <div className="api-section-img">
            <img src={ApiSectionImg}/>
        </div>
    </div>
);

export default ApiSection;
