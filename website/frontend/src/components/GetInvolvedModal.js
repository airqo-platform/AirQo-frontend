import React from 'react';
import { Modal, Box } from '@mui/material';

import CloseIcon from 'assets/svg/Close-thin.svg';
import ArrowBackIcon from 'assets/svg/arrowback-thin.svg';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';

const BoxWrapper = ({ children }) => (
        <div className="GetInvolvedModalWrapper">
            {children}
        </div>
);

const GetInvolvedTab = ({ category, infoText }) => (
        <div className="GetInvolvedTab">
            <div className="img-placeholder" />
            <div className="text-holder">
                I’m a <strong>{category}</strong>. <br />
                {infoText}
            </div>
        </div>
);

const GetInvolvedLanding = () => (
        <div>
            <GetInvolvedTab category="Partner" infoText="Interested in supporting AirQo’s vision" />
            <GetInvolvedTab category="Policymaker" infoText="Interested in air quality information" />
            <GetInvolvedTab category="Community Champion" infoText="Interested in raising awareness about air pollution." />
            <GetInvolvedTab category="Researcher" infoText="Interested in Air Quality data and analytics" />
            <GetInvolvedTab category="Developer" infoText="Interested in air quality data API" />
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

const GetInvolvedModal = ({ open, toggleOpen }) => (
        <Modal open={open} onClose={toggleOpen}>
            <BoxWrapper>
                <Box className="GetInvolvedModal">
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
                        {/*<GetInvolvedLanding />*/}
                        <GetInvolvedEmail />
                    </div>
                </Box>
            </BoxWrapper>
        </Modal>
);

export default GetInvolvedModal;
