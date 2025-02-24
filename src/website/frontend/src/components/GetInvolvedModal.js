import React, { useState, useEffect } from 'react';
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
import { sendInquiryApi } from '../../apis';
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

const GetInvolvedTab = ({ icon, category, infoText, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={() => onSelect(categoryMapper[category.toLowerCase()])}
      className="GetInvolvedTab tab-inactive">
      <div className="img-placeholder">{icon}</div>
      <div className="text-holder">
        I'm a <strong>{category}</strong>. <br />
        {infoText}
      </div>
    </div>
  );
};

const GetInvolvedLanding = ({ onCategorySelect }) => {
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
          onSelect={onCategorySelect}
        />
      ))}
    </div>
  );
};

const GetInvolvedEmail = ({ emailState, onInputChange, onSubmit, loading }) => {
  const { t } = useTranslation();

  const checkAllFilled = () =>
    emailState.firstName && emailState.lastName && emailState.email && emailState.acceptedTerms;

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
                onChange={(e) => onInputChange(field, e.target.value)}
                required
              />
            </div>
          ))}

          <div className="input-field">
            <input
              type="checkbox"
              checked={emailState.acceptedTerms}
              onChange={(e) => onInputChange('acceptedTerms', e.target.checked)}
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

const GetInvolvedComplete = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="complete">
      <div className="content-wrapper">
        <CheckMailIcon />
        <p className="main-text">{t('getInvolvedModal.complete.title')}</p>
        <p className="secondary-text">{t('getInvolvedModal.complete.subText')}</p>
        <button className="btn" onClick={onClose}>
          {t('getInvolvedModal.complete.cta')}
        </button>
      </div>
    </div>
  );
};

const GetInvolvedModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { openModal } = useSelector((state) => state.getInvolved);
  const [slide, setSlide] = useState(0);
  const [category, setCategory] = useState('');
  const [emailState, setEmailState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    acceptedTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (openModal) {
      setSlide(0);
      setCategory('');
      setEmailState({
        firstName: '',
        lastName: '',
        email: '',
        acceptedTerms: false
      });
      setComplete(false);
    }
  }, [openModal]);

  const hideModal = () => dispatch(showGetInvolvedModal({ openModal: false }));

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setSlide(1);
  };

  const handleInputChange = (field, value) => {
    setEmailState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !emailState.firstName ||
      !emailState.lastName ||
      !emailState.email ||
      !emailState.acceptedTerms ||
      loading
    )
      return;
    setLoading(true);

    try {
      await sendInquiryApi({
        fullName: `${emailState.firstName} ${emailState.lastName}`,
        email: emailState.email,
        category: category,
        message: 'Get involved - Request from the website'
      });
      setComplete(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (complete) {
      return <GetInvolvedComplete onClose={hideModal} />;
    }

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
            {slide > 0 && <ArrowBackIcon onClick={() => setSlide(0)} />}
            <CloseIcon onClick={hideModal} />
          </div>
          {slide === 0 ? (
            <GetInvolvedLanding onCategorySelect={handleCategorySelect} />
          ) : (
            <GetInvolvedEmail
              emailState={emailState}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <Modal open={openModal} onClose={hideModal}>
      <BoxWrapper tabIndex={-1}>
        <Box className="GetInvolvedModal">{renderContent()}</Box>
      </BoxWrapper>
    </Modal>
  );
};

export default GetInvolvedModal;
