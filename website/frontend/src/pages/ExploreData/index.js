import React, { useState, useEffect } from 'react';
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
import { useDispatch } from 'react-redux';
import {
  Checkbox, FormControl, FormControlLabel, CircularProgress,
} from '@mui/material';
import { useExploreData } from 'reduxStore/ExploreData/selectors';
import { postExploreDataRequest, updateExploreData } from 'reduxStore/ExploreData/operations';
import { isEmpty, isEqual } from 'underscore';

const CATEGORY_TYPE = {
  researcher: 'researcher',
  environmentalEnthusiasts: 'environmental enthusiasts',
  business: 'business',
  governmentEnthusiasts: 'government enthusiasts',
};

const compareCategory = (value, target) => isEqual(value.toLowerCase(), target.toLowerCase());

export const PageWithImageLayout = ({ imgPath, children }) => {
  const navigate = useNavigate();

  const navigateBack = () => navigate(-1);

  return (
        <div className="ExploreDataWrapper">
            <div className="left-section">
                <img src={imgPath || ManDownloadingApp} width="100%" height="100%" />
            </div>
            <div className="right-section">
                <div className="nav-row">
                    <button onClick={navigateBack}><ArrowBackIcon /></button>
                    <Link to="/"><CloseIcon /></Link>
                </div>
                <div className="content">{children}</div>
            </div>
        </div>
  );
};

export const ExploreFormTemplate = ({ children, onSubmit }) => (
    <form className="create-account-form" onSubmit={onSubmit}>
        {children}
    </form>
);

export const ExploreTemplateFormFieldOption = ({
  formOptionClassName, fieldId, label, inputType, children, fieldClassName, onChange,
}) => (
        <div className={`form-option ${formOptionClassName}`}>
            {label && <label htmlFor={fieldId}>{label}*</label>}
            <input type={inputType} id={fieldId} required className={fieldClassName || 'form-control'} onChange={onChange} /> {children}
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
                    <a target="_blank" href="https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091" rel="noreferrer">
                        <AppleBtn style={{ marginBottom: '40px' }} />
                    </a>
                    <a target="_blank" href="https://play.google.com/store/apps/details?id=com.airqo.app" rel="noreferrer">
                        <GoogleplayBtn />
                    </a>
                </div>
            </div>
        </div>
    </PageWithImageLayout>
);

export const ExploreGetStarted = () => (
    <PageWithImageLayout imgPath={ManExploring}>
        <div className="ExploreGetStarted">
            <div className="brand-icon"><AirQo /></div>
            <h2>Clean air for all African cities</h2>
            <p>Get access to an interactive air quality analytics platform.</p>
            <Link to="/explore-data/get-started/user"><button className="nav-button">Create Account</button></Link>
            <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank" rel="noreferrer">Log in</a></span></small>
        </div>
    </PageWithImageLayout>
);

export const ExploreUserCategory = () => {
  const exploreData = useExploreData();
  const dispatch = useDispatch();
  const [state, _] = useState(exploreData.userType);
  const navigate = useNavigate();

  const handleCategoryChange = (key, secondaryKey) => (e) => {
    // eslint-disable-next-line max-len
    dispatch(updateExploreData({ userType: { ...state, [key]: e.target.checked, [secondaryKey]: false } }));
    e.target.checked && navigate(`/explore-data/get-started/user/${e.target.name}`);
  };

  return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="ExploreGetStartedForm">
                <h2>What best describes you?</h2>
                <p>We will help you get started based on your response</p>
                <FormControl className="radio-field">
                    <FormControlLabel
                      className="radio-field-option"
                      control={
                            <Checkbox checked={state.individual} onChange={handleCategoryChange('individual', 'organization')} name="individual" />
                        }
                      label="Individual"
                    />
                    <FormControlLabel
                      className="radio-field-option"
                      control={
                            <Checkbox checked={state.organization} onChange={handleCategoryChange('organization', 'individual')} name="organisation" />
                        }
                      label="Organisation"
                    />
                </FormControl>
            </div>
        </PageWithImageLayout>
  );
};

export const ExploreUserProfessionType = () => {
  const exploreData = useExploreData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCategoryChange = (e) => {
    if (e.target.checked) {
      dispatch(updateExploreData({ category: e.target.name }));
      navigate('/explore-data/get-started/user/register');
    }
  };

  return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="ExploreGetStartedForm">
                <h2>What best describes you?</h2>
                <p>We will help you get started based on your response</p>
                <FormControl className="radio-field">
                    <FormControlLabel
                      className="radio-field-option"
                      control={
                            <Checkbox checked={compareCategory(exploreData.category, CATEGORY_TYPE.researcher)} onChange={handleCategoryChange} name="researcher" />
                        }
                      label="Researcher"
                    />
                    <FormControlLabel
                      className="radio-field-option"
                      control={
                            <Checkbox checked={compareCategory(exploreData.category, CATEGORY_TYPE.environmentalEnthusiasts)} onChange={handleCategoryChange} name="environmental enthusiasts" />
                        }
                      label="Environmental enthusiasts"
                    />
                </FormControl>
            </div>
        </PageWithImageLayout>
  );
};

export const ExploreOrganisationType = () => {
  const exploreData = useExploreData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCategoryChange = (e) => {
    if (e.target.checked) {
      dispatch(updateExploreData({ category: e.target.name }));
      navigate('/explore-data/get-started/user/register');
    }
  };

  return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="ExploreGetStartedForm">
                <h2>What best describes you?</h2>
                <p>We will help you get started based on your response</p>
                <FormControl className="radio-field">
                    <FormControlLabel
                      className="radio-field-option"
                      control={
                            <Checkbox checked={compareCategory(exploreData.category, CATEGORY_TYPE.business)} onChange={handleCategoryChange} name="business" />
                        }
                      label="Business"
                    />
                    <FormControlLabel
                      className="radio-field-option"
                      control={
                            <Checkbox checked={compareCategory(exploreData.category, CATEGORY_TYPE.governmentEnthusiasts)} onChange={handleCategoryChange} name="government enthusiasts" />
                        }
                      label="Government enthusiasts"
                    />
                </FormControl>
            </div>
        </PageWithImageLayout>
  );
};

export const ExploreUserRegistry = () => {
  const navigate = useNavigate();
  const exploreData = useExploreData();
  const dispatch = useDispatch();
  const [exploreDataLocal, setExploreDataLocal] = useState(exploreData);
  const [loading, setLoading] = useState(false);

  const handleChange = (id) => (e) => setExploreDataLocal({ ...exploreDataLocal, [id]: e.target.value });

  const registerOrganisation = async (e) => {
    e.preventDefault();

    // console.log("Local state:", exploreDataLocal);

    if (exploreDataLocal.category === 'business') {
      navigate('/explore-data/get-started/user/register/business');
    } else if (exploreDataLocal.category === 'government enthusiasts') {
      navigate('/explore-data/get-started/user/register/organisation');
    } else {
      setLoading(true);
      await dispatch(postExploreDataRequest({
        ...exploreDataLocal,
        long_organization: exploreDataLocal.category,
        jobTitle: exploreDataLocal.category,
        website: 'airqo.net',
        description: 'Request Access to Data',
      }));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEmpty(exploreDataLocal.category)) {
      navigate('/explore-data/get-started/user');
    }
  }, [exploreDataLocal]);

  return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="ExploreFormWrapper">
                <h2>Create your AirQo account</h2>
                <ExploreFormTemplate onSubmit={registerOrganisation}>
                    <ExploreTemplateFormFieldOption label="First name" inputType="text" fieldId="firstName" onChange={handleChange('firstName')} />
                    <ExploreTemplateFormFieldOption label="Last name" inputType="text" fieldId="lastName" onChange={handleChange('lastName')} />
                    {exploreDataLocal.category === 'researcher' && <ExploreTemplateFormFieldOption label="Email address" inputType="email" fieldId="email" onChange={handleChange('email')} />}
                    {exploreDataLocal.category === 'environmental enthusiasts' && <ExploreTemplateFormFieldOption label="Email address" inputType="email" fieldId="emailAddress" onChange={handleChange('email')} />}
                    <ExploreTemplateFormFieldOption inputType="checkbox" fieldId="tos" radioOption fieldClassName="tos" formOptionClassName="tos">
                        I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </ExploreTemplateFormFieldOption>
                    <button className="nav-button" type="submit" onSubmit={registerOrganisation}>{ loading ? <CircularProgress /> : 'Create Account' }</button>
                    <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank" rel="noreferrer">Log in</a></span></small>
                </ExploreFormTemplate>
            </div>
        </PageWithImageLayout>
  );
};

export const ExploreBusinessRegistry = () => {
  const navigate = useNavigate();
  const exploreData = useExploreData();
  const dispatch = useDispatch();
  const [exploreDataLocal, setExploreDataLocal] = useState(exploreData);
  const [loading, setLoading] = useState(false);

  const handleChange = (id) => (e) => setExploreDataLocal({ ...exploreDataLocal, [id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    await dispatch(addExploreDataRequest({
      ...exploreDataLocal, long_organization: exploreDataLocal.business, jobTitle: exploreDataLocal.position, website: 'airqo.net', description: 'Request Access to Data',
    }));

    setLoading(false);
    navigate('/explore-data/get-started/user/check-mail');
  };

  useEffect(() => {
    if (isEmpty(exploreDataLocal.category)) {
      navigate('/explore-data/get-started/user');
    }
  }, [exploreDataLocal]);

  return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="ExploreFormWrapper">
                <h2>Details about your business</h2>
                <ExploreFormTemplate onSubmit={handleSubmit}>
                    <ExploreTemplateFormFieldOption label="Business name" inputType="text" fieldId="businessName" onChange={handleChange('business')} />
                    <ExploreTemplateFormFieldOption label="Your position" inputType="text" fieldId="position" onChange={handleChange('position')} />
                    <ExploreTemplateFormFieldOption label="Email address" inputType="email" fieldId="emailAddress" onChange={handleChange('email')} />
                    <ExploreTemplateFormFieldOption inputType="checkbox" fieldId="tos" radioOption fieldClassName="tos" formOptionClassName="tos">
                        I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </ExploreTemplateFormFieldOption>
                    <button type="submit" className="nav-button">{ loading ? <CircularProgress /> : 'Create Account' }</button>
                    <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank" rel="noreferrer">Log in</a></span></small>
                </ExploreFormTemplate>
            </div>
        </PageWithImageLayout>
  );
};

export const ExploreOrganisationRegistry = () => {
  const navigate = useNavigate();
  const exploreData = useExploreData();
  const dispatch = useDispatch();
  const [exploreDataLocal, setExploreDataLocal] = useState(exploreData);
  const [loading, setLoading] = useState(false);

  const handleChange = (id) => (e) => setExploreDataLocal({ ...exploreDataLocal, [id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    await dispatch(addExploreDataRequest({
      ...exploreDataLocal, long_organization: exploreDataLocal.business, jobTitle: exploreDataLocal.position, website: 'airqo.net', description: 'Request Access to Data',
    }));

    setLoading(false);
    navigate('/explore-data/get-started/user/check-mail');
  };

  useEffect(() => {
    if (isEmpty(exploreDataLocal.category)) {
      navigate('/explore-data/get-started/user');
    }
  }, [exploreDataLocal]);

  return (
        <PageWithImageLayout imgPath={ManExploring}>
            <div className="ExploreFormWrapper">
                <h2>Details about your business</h2>
                <ExploreFormTemplate onSubmit={handleSubmit}>
                    <ExploreTemplateFormFieldOption label="Organisation name" inputType="text" fieldId="orgName" onChange={handleChange('business')} />
                    <ExploreTemplateFormFieldOption label="Your position" inputType="text" fieldId="position" onChange={handleChange('position')} />
                    <ExploreTemplateFormFieldOption label="Email address" inputType="email" fieldId="emailAddress" onChange={handleChange('email')} />
                    <ExploreTemplateFormFieldOption inputType="checkbox" fieldId="tos" radioOption fieldClassName="tos" formOptionClassName="tos">
                        I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </ExploreTemplateFormFieldOption>
                    <button className="nav-button" type="submit">{ loading ? <CircularProgress /> : 'Create Account' }</button>
                    <small>Already have an account?<span><a href="https://staging-platform.airqo.net/" target="_blank" rel="noreferrer">Log in</a></span></small>
                </ExploreFormTemplate>
            </div>
        </PageWithImageLayout>
  );
};
export const ExploreRegistryConfirmation = () => (
    <div className="ConfirmExploreDataMail">
        <RegistrationCompleteSvg className="registration_svg" />
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
                        <div className="img-2"><AirqualityPlatform /></div>
                    </div>
                    <h6>An interactive air quality analytics platform</h6>
                    <Link to="/explore-data/get-started"><button className="nav-button">Air Quality Dashboard</button></Link>
                </div>
            </div>
        </div>
    </div>
);

export default ExploreData;
