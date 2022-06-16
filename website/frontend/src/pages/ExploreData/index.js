import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import ManExploring from 'assets/img/explore/get-started-explore.png';
import RegistrationCompleteSvg from 'assets/svg/explore/registration_complete_svg.svg';

export const PageWithImageLayout = ({imgPath, children}) => (
    <div className="ExploreDataWrapper">
        <div className="left-section">
            <img src={ imgPath || ManDownloadingApp } width="100%" height="100%" />
        </div>
        <div className="right-section">
            <div className="nav-row">
                <Link to="/explore-data"><ArrowBackIcon /></Link>
                <Link to="/"><CloseIcon /></Link>
            </div>
            <div className="content">{children}</div>
        </div>
    </div>
);

export const ExploreFormTemplate = ({children}) => (
    <form className="create-account-form">
        {children}
    </form>
);

export const ExploreTemplateFormFieldOption = ({formOptionClassName, fieldId, label, inputType, children, fieldClassName}) => (
    <div className={`form-option ${formOptionClassName}`}>
        {label && <label htmlFor={fieldId}>{label}*</label>}
        <input type={inputType} id={fieldId} required className={fieldClassName ? fieldClassName : "form-control"} /> {children}
    </div>
);

export const ExploreApp = () => (
    <PageWithImageLayout>
        <div className="ExploreApp">
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
    </PageWithImageLayout>   
);

export const ExploreGetStarted = () => (
    <PageWithImageLayout imgPath={ManExploring}>
        <div className="GetStarted">
            <div className="brand-icon"><AirQo /></div>
            <h2>Clean air for all African cities</h2>
            <p>Get access to an interactive air quality analytics platform.</p>
            <Link to="/explore-data/get-started/user"><button className="nav-button">Create Account</button></Link>
            <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
        </div>  
    </PageWithImageLayout>
);

export const ExploreUserCategory = () => {
    const [userCategory, setUserCategory] = useState(null);

    const handleCategory = (category) => {
        document.getElementById
        console.log(category);
    }
    
    
    return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="GetStartedForm">
                <h2>What best describes you?</h2>
                <p>We will help you get started based on your response</p>
                <div className="radio-field">
                    <div className="radio-field-option">
                        <input type="checkbox" name="user_category" value="Individual" onChange={handleCategory("Individual")} /> Individual
                    </div>
                    <div className="radio-field-option">
                        <input type="checkbox" name="user_category" value="Organisation" onChange={handleCategory("Organisation")} /> Organisation
                    </div>
                </div>   
            </div>
        </PageWithImageLayout>
    );
}
export const ExploreUserProfessionType = () => (
    <PageWithImageLayout imgPath={ManExploring}>
        <div className="GetStartedForm">
            <h2>What best describes you?</h2>
            <p>We will help you get started based on your response</p>
            <div className="radio-field">
                <div className="radio-field-option">
                    <Link to="/explore-data/get-started/user/register">
                        <input type="checkbox" name="description1" /> Researcher
                    </Link>
                </div>
                <div className="radio-field-option">
                    <Link to="/explore-data/get-started/user/register">
                        <input type="checkbox" name="description1" /> Environmental enthusiasts
                    </Link>
                </div>
            </div>  
        </div>
    </PageWithImageLayout>
);

export const ExploreOrganisationType = () => (
    <PageWithImageLayout imgPath={ManExploring}>
        <div className="GetStartedForm">
            <h2>What best describes you?</h2>
            <p>We will help you get started based on your response</p>
            <div className="radio-field">
                <div className="radio-field-option">
                    <Link to="/explore-data/get-started/user/register-business">
                        <input type="checkbox" name="description1" /> Business
                    </Link>
                    <Link to="/explore-data/get-started/user/register-organisation">
                        <input type="checkbox" name="description1" /> Government enthusiasts
                    </Link>
                </div>
            </div>  
        </div>
    </PageWithImageLayout>
);

export const ExploreUserRegistry = () => {
    let navigationHistory = useNavigate();
    const registerOrganisation = () => {
        console.log(navigationHistory(-1));
    }

    return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="ExploreFormWrapper">
                <h2>Create your AirQo account</h2>
                <ExploreFormTemplate>
                    <ExploreTemplateFormFieldOption label="First name" inputType="text" fieldId="firstName" />
                    <ExploreTemplateFormFieldOption label="Last name" inputType="text" fieldId="lastName" />
                    <ExploreTemplateFormFieldOption label="Email address" inputType="email" fieldId="emailAddress" />
                    <ExploreTemplateFormFieldOption inputType="checkbox" fieldId="tos" radioOption fieldClassName="tos" formOptionClassName="tos">
                        I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </ExploreTemplateFormFieldOption>
                    <button className="nav-button" onClick={registerOrganisation}>Create Account</button>
                    <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
                </ExploreFormTemplate>
            </div>
        </PageWithImageLayout>
    );
}
export const ExploreBusinessRegistry = () => (
    <PageWithImageLayout imgPath={ManExploring}>
        <div className="ExploreFormWrapper">
            <h2>Details about your business</h2>
            <ExploreFormTemplate>
                <ExploreTemplateFormFieldOption label="Business name" inputType="text" fieldId="businessName" />
                <ExploreTemplateFormFieldOption label="Your position" inputType="text" fieldId="position" />
                <ExploreTemplateFormFieldOption label="Email address" inputType="email" fieldId="emailAddress" />
                <ExploreTemplateFormFieldOption inputType="checkbox" fieldId="tos" radioOption fieldClassName="tos" formOptionClassName="tos">
                    I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                </ExploreTemplateFormFieldOption>
                <Link to="/explore-data/get-started/account/check-mail"><button className="nav-button">Create Account</button></Link>
                <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
            </ExploreFormTemplate>
        </div>
    </PageWithImageLayout>
);

export const ExploreOrganisationRegistry = () => (
    <PageWithImageLayout imgPath={ManExploring}>
        <div className="ExploreFormWrapper">
            <h2>Details about your business</h2>
            <ExploreFormTemplate>
                <ExploreTemplateFormFieldOption label="Organisation name" inputType="text" fieldId="orgName" />
                <ExploreTemplateFormFieldOption label="Your position" inputType="text" fieldId="position" />
                <ExploreTemplateFormFieldOption label="Email address" inputType="email" fieldId="emailAddress" />
                <ExploreTemplateFormFieldOption inputType="checkbox" fieldId="tos" radioOption fieldClassName="tos" formOptionClassName="tos">
                    I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                </ExploreTemplateFormFieldOption>
                <Link to="/explore-data/get-started/account/check-mail"><button className="nav-button">Create Account</button></Link>
                <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank">Log in</a></span></small>
            </ExploreFormTemplate>
        </div>
    </PageWithImageLayout>
);

export const ExploreRegistryConfirmation = () => (
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