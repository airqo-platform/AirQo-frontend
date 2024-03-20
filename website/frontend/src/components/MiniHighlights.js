import React from 'react';
import { useDispatch } from "react-redux";
import { showGetInvolvedModal } from "reduxStore/GetInvolved/operations";
import engineerImg from 'src/assets/img/highlights/engineer.png'
import GoogleOrgIcon from 'src/assets/img/highlights/google-org.svg'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainSection = () => {
    const { t } = useTranslation();
    return (
        <div className="highlight-main">
            <img src={engineerImg} />
            <div className="main-content">
                <GoogleOrgIcon />
                <div className="title">{t("homepage.ctaSection.leaders.title")}</div>
                <div className="body">{t("homepage.ctaSection.leaders.subText")}</div>
                <div className="link"><a href={"https://www.google.org/leaders-to-watch/#engineer-bainomugisha"} target="_blank">{t("homepage.ctaSection.leaders.cta")} {'-->'}</a></div>
            </div>
        </div>
    )
}

const SubSection = () => {
    const dispatch = useDispatch();
    const showModal = () => dispatch(showGetInvolvedModal(true));

    const { t } = useTranslation();

    return (
        <div className="highlight-sub">
            <div className="content-wrapper blue-bg">
                <div className="title white-color">{t("homepage.ctaSection.explore.title")}
                </div>
                <div className="link white-color"><Link to="/explore-data"><span>{t("homepage.ctaSection.explore.cta")} {'-->'}</span></Link></div>
            </div>
            <div className="content-wrapper light-blue-bg" onClick={showModal}>
                <div className="title blue-color">{t("homepage.ctaSection.involved.title")}</div>
                <div className="link blue-color" onClick={showModal}>{t("homepage.ctaSection.involved.cta")}{'-->'}</div>
            </div>
        </div>
    )
}

const MiniHighlights = () => {
    return (
        <div className="Highlight">
            <MainSection />
            <SubSection />
        </div>
    )
}

export default MiniHighlights;
