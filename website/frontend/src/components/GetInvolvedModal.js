import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from 'assets/svg/close-thin.svg';
import ArrowBackIcon from 'assets/svg/arrowback-thin.svg';
import CheckMailIcon from 'assets/svg/check-mail.svg';
import ChampionIcon from 'assets/svg/Champion.svg';
import DeveloperIcon from 'assets/svg/Developer.svg';
import PartnersIcon from 'assets/svg/Partners.svg';
import PolicyIcon from 'assets/svg/Policy.svg';
import ResearchIcon from 'assets/svg/Research.svg';
import { useGetInvolvedData } from 'reduxStore/GetInvolved/selectors';
import { showGetInvolvedModal, updateGetInvolvedData } from 'reduxStore/GetInvolved/operations';
import { sendInquiryApi } from 'apis';

const categoryMapper = {
  partner: 'partners',
  policymaker: 'policy',
  'community champion': 'champions',
  researcher: 'researchers',
  developer: 'developers',
};

const BoxWrapper = ({ children }) => (
        <div className="GetInvolvedModalWrapper">
            {children}
        </div>
);

const GetInvolvedTab = ({ icon, category, infoText }) => {
  const dispatch = useDispatch();
  const getInvolvedData = useGetInvolvedData();

  const onClick = () => {
    dispatch(updateGetInvolvedData({ category: categoryMapper[category.toLowerCase()], slide: 1 }));
  };
  return (
        <div
          onClick={onClick}
          className={`GetInvolvedTab ${categoryMapper[category.toLowerCase()] === getInvolvedData.category ? 'tab-active' : 'tab-inactive'}`}
        >
            <div className="img-placeholder">{icon}</div>
            <div className="text-holder">
                I’m a <strong>{category}</strong>. <br />
                {infoText}
            </div>
        </div>
  );
};

const GetInvolvedLanding = () => (
        <div>
            <GetInvolvedTab icon={<PartnersIcon />} category="Partner" infoText="Interested in supporting AirQo’s vision" />
            <GetInvolvedTab icon={<PolicyIcon />} category="Policymaker" infoText="Interested in air quality information" />
            <GetInvolvedTab icon={<ChampionIcon />} category="Community Champion" infoText="Interested in raising awareness about air pollution." />
            <GetInvolvedTab icon={<ResearchIcon />} category="Researcher" infoText="Interested in Air Quality data and analytics" />
            <GetInvolvedTab icon={<DeveloperIcon />} category="Developer" infoText="Interested in air quality data API" />
        </div>
);

const GetInvolvedEmail = () => {
  const dispatch = useDispatch();
  const getInvolvedData = useGetInvolvedData();
  const [emailState, setEmailState] = useState(getInvolvedData);
  const [loading, setLoading] = useState(false);

  const handleOnChange = (id) => (event) => {
    setEmailState({ ...emailState, [id]: event.target.value });
  };
  const handleOnCheckboxChange = (event) => {
    setEmailState({ ...emailState, acceptedTerms: event.target.checked });
  };

  const checkAllFilled = () => emailState.firstName && emailState.lastName && emailState.email && emailState.acceptedTerms;

  const onSubmit = async () => {
    if (!checkAllFilled() || loading) return;
    setLoading(true);

    sendInquiryApi({
      fullName: `${emailState.firstName} ${emailState.lastName}`,
      email: emailState.email,
      category: emailState.category,
      message: 'Get involved - Request from the website',
    }).then((data) => {
      dispatch(updateGetInvolvedData({ ...setEmailState, complete: true }));
      setLoading(false);
    }).catch((err) => {
      console.log(err);
      setLoading(false);
    });
  };
  return (
        <div className="form-section">
            <div className="wrapper">
                <form className="register-form">
                    <div className="form-field">
                        <label>First name</label>
                        <input
                          type="text"
                          id="fname"
                          defaultValue={emailState.firstName}
                          onChange={handleOnChange('firstName')}
                          required
                        />
                    </div>
                    <div className="form-field">
                        <label>Last name</label>
                        <input
                          type="text"
                          id="lname"
                          defaultValue={emailState.lastName}
                          onChange={handleOnChange('lastName')}
                          required
                        />
                    </div>
                    <div className="form-field">
                        <label>Email address</label>
                        <input
                          type="email"
                          id="email"
                          defaultValue={emailState.email}
                          onChange={handleOnChange('email')}
                          required
                        />
                    </div>
                    <div className="input-field">
                        <input
                          type="checkbox"
                          defaultChecked={emailState.acceptedTerms}
                          onChange={handleOnCheckboxChange}
                          required
                        />
                        <label>
                            I agree to the <u>Terms of Service</u> and <u>Privacy Policy</u>
                        </label>
                    </div>
                </form>
                <div className="section-button-row">
                    <button
                      className={`register-btn ${checkAllFilled() ? 'btn-active' : 'btn-disabled'}`}
                      onClick={onSubmit}
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </div>

            </div>
        </div>
  );
};

const GetInvolvedRegistryContent = () => {
  const dispatch = useDispatch();
  const getInvolvedData = useGetInvolvedData();

  const hideModal = () => dispatch(showGetInvolvedModal(false));
  const goBack = () => dispatch(updateGetInvolvedData({ slide: getInvolvedData.slide - 1 }));
  return (
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
            <span>
                {getInvolvedData.slide ? <ArrowBackIcon onClick={goBack} /> : <span />}
                <CloseIcon onClick={hideModal} />
            </span>
            {getInvolvedData.slide <= 0 ? <GetInvolvedLanding /> : <GetInvolvedEmail />}
        </div>
    </>
  );
};

const GetInvolvedComplete = () => {
  const dispatch = useDispatch();

  const backToHomePage = () => {
    dispatch(showGetInvolvedModal(false));
  };
  return (
        <div className="complete">
            <div className="content-wrapper">
            <CheckMailIcon />
            <p className="main-text">Check your email for more details.</p>
            <p className="secondary-text">Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
            <button className="btn" onClick={backToHomePage}>Back home</button>
            </div>
        </div>
  );
};

const GetInvolvedModal = () => {
  const dispatch = useDispatch();
  const getInvolvedData = useGetInvolvedData();

  const hideModal = () => dispatch(showGetInvolvedModal(false));

  return (
        <Modal open={getInvolvedData.openModal} onClose={hideModal}>
            <BoxWrapper>
                <Box className="GetInvolvedModal">
                    {!getInvolvedData.complete && <GetInvolvedRegistryContent />}
                    {getInvolvedData.complete && <GetInvolvedComplete />}
                </Box>
            </BoxWrapper>
        </Modal>
  );
};

export default GetInvolvedModal;
