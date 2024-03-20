import React from 'react';
import ApiSectionImg from "assets/img/ApiSection.png";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ApiSection = () => {
    const { t } = useTranslation();
    return (
        <div className="Apisection">
            <div className="Apisection-details">
                <h3>{t("homepage.apiSection.pill")}</h3>
                <h1>{t("homepage.apiSection.title")}</h1>
                <p>{t("homepage.apiSection.subText")} </p>
                <div className="Apisection-details-btn">
                    <Link to="/products/api">{t("homepage.apiSection.cta")} {'-->'}</Link>
                </div>
            </div>
            <div className="api-section-img">
                <img src={ApiSectionImg} />
            </div>
        </div>
    )
};

export default ApiSection;
