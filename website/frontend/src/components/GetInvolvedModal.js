import React from 'react';
import { Modal, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';
import CloseIcon from 'assets/svg/Close-thin.svg';
import ArrowBackIcon from 'assets/svg/arrowback-thin.svg';
import CheckMailIcon from 'assets/svg/check-mail.svg';
import ChampionIcon from 'assets/svg/Champion.svg';
import DeveloperIcon from 'assets/svg/Developer.svg';
import PartnersIcon from 'assets/svg/Partners.svg';
import PolicyIcon from 'assets/svg/Policy.svg';
import ResearchIcon from 'assets/svg/Research.svg';

const BoxWrapper = ({ children }) => (
        <div className="GetInvolvedModalWrapper">
            {children}
        </div>
);

const GetInvolvedTab = ({ icon, category, infoText }) => (
        <div className="GetInvolvedTab">
            <div className="img-placeholder">{icon}</div>
            <div className="text-holder">
                I’m a <strong>{category}</strong>. <br />
                {infoText}
            </div>
        </div>
);

const GetInvolvedLanding = () => (
        <div>
            <GetInvolvedTab icon={<PartnersIcon />} category="Partner" infoText="Interested in supporting AirQo’s vision" />
            <GetInvolvedTab icon={<PolicyIcon />} category="Policymaker" infoText="Interested in air quality information" />
            <GetInvolvedTab icon={<ChampionIcon />} category="Community Champion" infoText="Interested in raising awareness about air pollution." />
            <GetInvolvedTab icon={<ResearchIcon />} category="Researcher" infoText="Interested in Air Quality data and analytics" />
            <GetInvolvedTab icon={<DeveloperIcon />} category="Developer" infoText="Interested in air quality data API" />
        </div>
);

const GetInvolvedEmail = () => (
        <div className="form-section">
            <div className="wrapper">
                <form className="register-form">
                    <div className="form-field">
                        <label>First name</label>
                        <input type="text" id="fname" required />
                    </div>
                    <div className="form-field">
                        <label>Last name</label>
                        <input type="text" id="lname" required />
                    </div>
                    <div className="form-field">
                        <label>Email address</label>
                        <input type="email" id="email" required />
                    </div>
                    <div className="input-field">
                        <input type="checkbox" required />
                        <label>
                            I agree to the <u>Terms of Service</u> and <u>Privacy Policy</u>
                        </label>
                    </div>
                </form>
                <div className="section-button-row">
                    <Link to="/get-involved/check-mail" style={{ textDecoration: 'none' }}>
                        <a className="register-btn btn-disabled btn-active" type="button">Create account</a>
                    </Link>
                </div>

            </div>
        </div>
);

const GetInvolvedRegistryContent = () => (
    <>
       <div className="banner">
            <div>
             <div className="section-nav">
                <h5>Home</h5>
                <ArrowForwardIosIcon className="icon" />
                <h5 style={{ opacity: '0.5' }}>Get Involved</h5>
             </div>
            <h1 className="section-title">How would you like to <br />engage with us?</h1>
            <p className="banner-content">Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
            </div>
       </div>
        <div className="content">
            <span><ArrowBackIcon /><CloseIcon /></span>
            <GetInvolvedLanding />
            {/* <GetInvolvedEmail /> */}
        </div>
    </>
);

const GetInvolvedComplete = () => (
        <div className="complete">
            <div className="content-wrapper">
            <CheckMailIcon />
            <p className="main-text">Check your email for more details.</p>
            <p className="secondary-text">Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
            <button className="btn">Back home</button>
            </div>
        </div>
);

const GetInvolvedModal = ({ open, toggleOpen }) => (
        <Modal open={open} onClose={toggleOpen}>
            <BoxWrapper>
                <Box className="GetInvolvedModal">
                    {/* <GetInvolvedRegistryContent /> */}
                    <GetInvolvedComplete />
                </Box>
            </BoxWrapper>
        </Modal>
);

export default GetInvolvedModal;
