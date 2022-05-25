import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ApiSectionImg from "assets/img/api-img.png";
// import ApiSectionSm from "assets/img/api_section_mobile.svg";

const ApiSection = () => (
    <div className="Apisection">
        <div className="Apisection-details">
            <h3>Air Quality API</h3>
            <h1>Integrate your products with our air quality API</h1>
            <p>We deliver the fast, reliable, and hyper-accurate air quality data you need, with the flexibility to integrate this data source with your applications, systems and a wide range of tools.</p>
            {/* <div className="Apisection-details-btn">
                <a href=''>Read doc <ArrowForwardIcon className="Apisection-icon"/></a>
            </div> */}
        </div>
        <img src={ApiSectionImg} width={"100%"} height={"100%"} alt="API section image" />
        <div className="api-section-mobile">
            {/* <ApiSectionSm width={"100%"} /> */}
        </div>
    </div>
);

export default ApiSection;
