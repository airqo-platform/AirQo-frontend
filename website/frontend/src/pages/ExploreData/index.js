import React from 'react';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AirQo from 'icons/nav/AirQo';
import AppleBtn from 'assets/svg/apple-btn.svg';
import GoogleplayBtn from 'assets/svg/google-play-btn.svg';
import QRcode from 'assets/svg/QR code.svg';
import MobileApp from 'assets/svg/explore/discover-air-quality.svg';
import AirqualityPlatform from 'assets/svg/explore/air-quality-platform.svg';
import ManDownloadingApp from 'assets/img/explore/man-download-app.png';
import ManExploring from 'assets/img/explore/get-started-explore.png';import RegistrationCompleteSvg from 'assets/svg/explore/registration_complete_svg.svg';

export const DownloadApp = () => (
    <div className="DownloadApp">
        <div className="left-section">
            <img src={ManDownloadingApp} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <div className="brand-icon"><AirQo /></div>
                <h2>Get the AirQo app</h2>
                <p>Discover the quality of air you are breathing.</p>
                <div className="wrapper">
                    <QRcode />
                    <hr />
                    <div className="btn-group">
                        <a target="_blank" href="https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091">
                            <AppleBtn style={{marginBottom:"40px"}} />
                        </a>
                        <a target="_blank" href="https://play.google.com/store/apps/details?id=com.airqo.app">
                            <GoogleplayBtn />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const GetStarted = () => (
    <div className="GetStarted">
        <div className="left-section">
            <img src={ManExploring} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <div className="brand-icon"><AirQo /></div>
                <h2>Clean air for all African cities</h2>
                <p>Get access to an interactive air quality analytics platform.</p>
                <Link to="/explore-data/get-started/account"><button className="nav-button">Create Account</button></Link>
                <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
            </div>
        </div>
    </div>
);

export const GetStartedForm = () => (
    <div className="GetStartedForm">
        <div className="left-section">
            <img src={ManExploring} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data/get-started"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <h2>What best describes you?</h2>
                <p>We will help you get started based on your response</p>
                <div className="radio-field">
                    <div className="radio-field-option">
                    <Link to="/explore-data/get-started/account/individual">
                        <input type="checkbox" name="description1" /> Individual
                    </Link>
                    </div>
                    <div className="radio-field-option">
                        <Link to="/explore-data/get-started/account/institution">
                            <input type="checkbox" name="description1" /> Organisation
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const IndividualForm = () => (
    <div className="GetStartedForm">
        <div className="left-section">
            <img src={ManExploring} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data/get-started"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <h2>What best describes you?</h2>
                <p>We will help you get started based on your response</p>
                <div className="radio-field">
                    <div className="radio-field-option">
                    <Link to="/explore-data/get-started/account/register">
                        <input type="checkbox" name="description1" /> Researcher
                    </Link>
                    </div>
                    <div className="radio-field-option">
                        <input type="checkbox" name="description1" /> Environmental enthusiasts
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const InstitutionForm = () => (
    <div className="GetStartedForm">
        <div className="left-section">
            <img src={ManExploring} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data/get-started"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <h2>What best describes you?</h2>
                <p>We will help you get started based on your response</p>
                <div className="radio-field">
                    <div className="radio-field-option">
                    <Link to="/explore-data/get-started/account/register">
                        <input type="checkbox" name="description1" /> Business
                    </Link>
                    </div>
                    <div className="radio-field-option">
                        <input type="checkbox" name="description1" /> Government enthusiasts
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const CreateAccountForm = () => (
    <div className="CreateAccountForm">
        <div className="left-section">
            <img src={ManExploring} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data/get-started"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <h2>Create your AirQo account</h2>
                <form className="create-account-form">
                    <div className="form-option">
                        <label htmlFor="firstName">First name*</label>
                        <input type="text" id="firstName" required className="form-control" />
                    </div>
                    <div className="form-option">
                        <label htmlFor="lastName">Last name*</label>
                        <input type="text" id="lastName" required className="form-control" />
                    </div>
                    <div className="form-option">
                        <label htmlFor="emailAddress">Email address*</label>
                        <input type="email" id="emailAddress" required className="form-control" />
                    </div>
                    <div className="form-option tos">
                        <input type="radio" name="tos" required /> I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </div>
                    <Link to="/explore-data/get-started/account/check-mail"><button className="nav-button">Create Account</button></Link>
                    <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
                </form>
            </div>
        </div>
    </div>
);

export const RegisterBusinessForm = () => (
    <div className="CreateAccountForm">
        <div className="left-section">
            <img src={ManExploring} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data/get-started"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <h2>Details about your business</h2>
                <form className="create-account-form">
                    <div className="form-option">
                        <label htmlFor="businessName">Business name*</label>
                        <input type="text" id="firstName" required className="form-control" />
                    </div>
                    <div className="form-option">
                        <label htmlFor="position">Your position*</label>
                        <input type="text" id="lastName" required className="form-control" />
                    </div>
                    <div className="form-option">
                        <label htmlFor="emailAddress">Email address*</label>
                        <input type="email" id="emailAddress" required className="form-control" />
                    </div>
                    <div className="form-option tos">
                        <input type="radio" name="tos" required /> I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </div>
                    <Link to="/explore-data/get-started/account/check-mail"><button className="nav-button">Create Account</button></Link>
                    <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
                </form>
            </div>
        </div>
    </div>
);

export const RegisterOrganisationForm = () => (
    <div className="CreateAccountForm">
        <div className="left-section">
            <img src={ManExploring} width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data/get-started"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">
                <h2>Details about your organisation</h2>
                <form className="create-account-form">
                    <div className="form-option">
                        <label htmlFor="orgName">Organisation name*</label>
                        <input type="text" id="orgName" required className="form-control" />
                    </div>
                    <div className="form-option">
                        <label htmlFor="orgPosition">Position*</label>
                        <input type="text" id="lastName" required className="form-control" />
                    </div>
                    <div className="form-option">
                        <label htmlFor="emailAddress">Email address*</label>
                        <input type="email" id="emailAddress" required className="form-control" />
                    </div>
                    <div className="form-option tos">
                        <input type="radio" name="tos" required /> I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </div>
                    <Link to="/explore-data/get-started/account/check-mail"><button className="nav-button">Create Account</button></Link>
                    <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
                </form>
            </div>
        </div>
    </div>
);

export const ConfirmExploreDataMail = () => (
    <div className="ConfirmExploreDataMail">
        <RegistrationCompleteSvg />
        <div className="content">
            <h2>Check your email for more details.</h2>
            <p>Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
        </div>
        <Link to="/"><button className="nav-button">Back home</button></Link>
    </div>
);

const ExploreData = () => (
    <div className="ExploreData">
        <div className="left-section">
            <div className="nav">
                <Link to="/"><h3>Home</h3></Link><ArrowForwardIosIcon className="icon" /><h3 className="blur-text">Explore Data</h3>
            </div>
            <div className="content">
                <h2>Visualise air quality information.</h2>
                <p>Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard or mobile app.</p>
            </div>
        </div>
        <div className="right-section">
            <div className="nav-icon"><Link to="/"><CloseIcon /></Link></div>
            <div className="nav">
                <div className="nav-option">
                    <div className="img-wrapper"><div className="img-1"><MobileApp /></div></div>
                    <h6>Discover the quality of air you are breathing.</h6>
                    <Link to="/explore-data/download-apps"><button className="nav-button">Download App</button></Link>
                </div>
                <div className="nav-option">
                    <div className="img-wrapper">
                        <div className="img-2"><AirqualityPlatform /></div></div>
                    <h6>An interactive air quality analytics platform</h6>
                    <Link to="/explore-data/get-started"><button className="nav-button">Air Quality Dashboard</button></Link>
                </div>
            </div>
        </div>
    </div>
);

export default ExploreData;
