import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { showGetInvolvedModal, updateGetInvolvedData } from 'reduxStore/GetInvolved';
import { sendInquiryApi } from 'apis';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

const categoryMapper = {
  partner: 'partners',
  policymaker: 'policy',
  'community champion': 'champions',
  researcher: 'researchers',
  developer: 'developers'
};

const BoxWrapper = React.forwardRef(({ children }, ref) => (
  <div ref={ref} className="GetInvolvedModalWrapper">
    {children}
  </div>
));

const GetInvolvedTab = ({ icon, category, infoText }) => {
  const dispatch = useDispatch();
  const { category: selectedCategory } = useSelector((state) => state.getInvolved);
  const { t } = useTranslation();

  const onClick = () => {
    dispatch(updateGetInvolvedData({ category: categoryMapper[category.toLowerCase()], slide: 1 }));
  };

  return (
    <div
      onClick={onClick}
      className={`GetInvolvedTab ${
        categoryMapper[category.toLowerCase()] === selectedCategory ? 'tab-active' : 'tab-inactive'
      }`}>
      <div className="img-placeholder">{icon}</div>
      <div className="text-holder">
        I'm a <strong>{category}</strong>. <br />
        {infoText}
      </div>
    </div>
  );
};

const GetInvolvedLanding = () => {
  const { t } = useTranslation();
  const categories = [
    { icon: <PartnersIcon />, key: 'first' },
    { icon: <PolicyIcon />, key: 'second' },
    { icon: <ChampionIcon />, key: 'third' },
    { icon: <ResearchIcon />, key: 'fourth' },
    { icon: <DeveloperIcon />, key: 'fifth' }
  ];

  return (
    <div>
      {categories.map(({ icon, key }) => (
        <GetInvolvedTab
          key={key}
          icon={icon}
          category={t(`getInvolvedModal.cards.${key}.category`)}
          infoText={t(`getInvolvedModal.cards.${key}.infoText`)}
        />
      ))}
    </div>
  );
};

const GetInvolvedEmail = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const getInvolvedData = useSelector((state) => state.getInvolved);
  const [emailState, setEmailState] = useState(getInvolvedData);
  const [loading, setLoading] = useState(false);

  const handleOnChange = (id) => (event) => {
    setEmailState((prev) => ({ ...prev, [id]: event.target.value }));
  };

  const handleOnCheckboxChange = (event) => {
    setEmailState((prev) => ({ ...prev, acceptedTerms: event.target.checked }));
  };

  const checkAllFilled = () =>
    emailState.firstName && emailState.lastName && emailState.email && emailState.acceptedTerms;

  const onSubmit = async () => {
    if (!checkAllFilled() || loading) return;
    setLoading(true);

    try {
      await sendInquiryApi({
        fullName: `${emailState.firstName} ${emailState.lastName}`,
        email: emailState.email,
        category: emailState.category,
        message: 'Get involved - Request from the website'
      });
      dispatch(updateGetInvolvedData({ ...emailState, complete: true }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <div className="wrapper">
        <form className="register-form">
          {['firstName', 'lastName', 'email'].map((field) => (
            <div key={field} className="form-field">
              <label>{t(`getInvolvedModal.form.${field}`)}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                id={field}
                value={emailState[field] || ''}
                onChange={handleOnChange(field)}
                required
              />
            </div>
          ))}
          <div className="input-field">
            <input
              type="checkbox"
              checked={emailState.acceptedTerms}
              onChange={handleOnCheckboxChange}
              required
            />
            <label>
              <Trans i18nKey="getInvolvedModal.form.terms">
                I agree to the <Link to="/legal">Terms of Service</Link> and{' '}
                <Link to="/legal">Privacy Policy</Link>
              </Trans>
            </label>
          </div>
        </form>
        <div className="section-button-row">
          <button
            className={`register-btn ${checkAllFilled() ? 'btn-active' : 'btn-disabled'}`}
            onClick={onSubmit}>
            {loading ? t('getInvolvedModal.form.cta.sending') : t('getInvolvedModal.form.cta.send')}
          </button>
        </div>
      </div>
    </div>
  );
};

const GetInvolvedRegistryContent = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slide } = useSelector((state) => state.getInvolved);

  const hideModal = () => dispatch(showGetInvolvedModal({ openModal: false }));
  const goBack = () => dispatch(updateGetInvolvedData({ slide: slide - 1 }));

  return (
    <>
      <div className="banner">
        <div>
          <div className="section-nav">
            <h5>{t('getInvolvedModal.banner.breadCrumb.home')}</h5>
            <ArrowForwardIosIcon className="icon" />
            <h5 style={{ opacity: '0.5' }}>
              {t('getInvolvedModal.banner.breadCrumb.getInvolved')}
            </h5>
          </div>
          <h1 className="section-title">
            <Trans i18nKey="getInvolvedModal.banner.title">
              How would you like to <br />
              engage with us?
            </Trans>
          </h1>
          <p className="banner-content">{t('getInvolvedModal.banner.subText')}</p>
        </div>
      </div>
      <div className="content">
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: slide > 0 ? 'space-between' : 'flex-end',
            cursor: 'pointer'
          }}>
          {slide > 0 && <ArrowBackIcon onClick={goBack} />}
          <CloseIcon onClick={hideModal} />
        </div>
        {slide <= 0 ? <GetInvolvedLanding /> : <GetInvolvedEmail />}
      </div>
    </>
  );
};

const GetInvolvedComplete = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const backToHomePage = () => {
    dispatch(showGetInvolvedModal({ openModal: false }));
  };

  return (
    <div className="complete">
      <div className="content-wrapper">
        <CheckMailIcon />
        <p className="main-text">{t('getInvolvedModal.complete.title')}</p>
        <p className="secondary-text">{t('getInvolvedModal.complete.subText')}</p>
        <button className="btn" onClick={backToHomePage}>
          {t('getInvolvedModal.complete.cta')}
        </button>
      </div>
    </div>
  );
};

const GetInvolvedModal = () => {
  const { openModal, complete } = useSelector((state) => state.getInvolved);
  const dispatch = useDispatch();

  const hideModal = () => dispatch(showGetInvolvedModal({ openModal: false }));

  return (
    <Modal open={openModal} onClose={hideModal}>
      <BoxWrapper tabIndex={-1}>
        <Box className="GetInvolvedModal">
          {complete ? <GetInvolvedComplete /> : <GetInvolvedRegistryContent />}
        </Box>
      </BoxWrapper>
    </Modal>
  );
};

export default GetInvolvedModal;
