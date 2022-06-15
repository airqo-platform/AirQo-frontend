import React from 'react';
import { Modal, Box } from '@mui/material';

import CloseIcon from 'assets/svg/Close-thin.svg';
import ArrowBackIcon from 'assets/svg/arrowback-thin.svg';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
                        <div>
                            <GetInvolvedTab category="Partner" infoText="Interested in supporting AirQo’s vision" />
                            <GetInvolvedTab category="Policymaker" infoText="Interested in air quality information" />
                            <GetInvolvedTab category="Community Champion" infoText="Interested in raising awareness about air pollution." />
                            <GetInvolvedTab category="Researcher" infoText="Interested in Air Quality data and analytics" />
                            <GetInvolvedTab category="Developer" infoText="Interested in air quality data API" />
                        </div>
                    </div>
                </Box>
            </BoxWrapper>
        </Modal>
);

export default GetInvolvedModal;
