import React from 'react';
import { useDispatch } from "react-redux";
import { showGetInvolvedModal } from "reduxStore/GetInvolved/operations";
import engineerImg from  'src/assets/img/highlights/engineer.png'
import GoogleOrgIcon from  'src/assets/img/highlights/google-org.svg'

const MainSection = () => (
    <div className="highlight-main">
        <img src={engineerImg} />
        <div className="main-content">
            <GoogleOrgIcon />
            <div className="title">Google.org Leaders to Watch 2022</div>
            <div className="body">From expanding equity in education to addressing environmental issues, this year’s Leaders to Watch are building a better future for everyone.</div>
            <div className="link"><a href={"https://www.google.org/leaders-to-watch/#engineer-bainomugisha"} target="_blank">Learn more --></a></div>
        </div>
    </div>
)

const SubSection = () => {
    const dispatch = useDispatch();
    const showModal = () => dispatch(showGetInvolvedModal(true))
    return (
        <div className="highlight-sub">
            <div className="content-wrapper blue-bg">
                <div className="title white-color">Explore our digital tools. Learn about the quality of air around
                    you.
                </div>
                <div className="link white-color">Explore data --></div>
            </div>
            <div className="content-wrapper light-blue-bg" onClick={showModal}>
                <div className="title blue-color">Get involved. Learn about ways you can support our vision.</div>
                <div className="link blue-color" onClick={showModal}>Get Involved --></div>
            </div>
        </div>
    )
}

const Highlight = () => (
    <div className="Highlight">
        <MainSection />
        <SubSection />
    </div>
)

export default Highlight;
