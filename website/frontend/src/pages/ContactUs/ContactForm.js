import React, { useState } from 'react';
import ContactUs from '.';
import { useInitScrollTop } from 'utilities/customHooks';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch } from 'react-redux';
import { postContactUsInquiry } from 'reduxStore/ContactUs/operations';
import { useInquiryData } from 'reduxStore/ContactUs/selectors';
import { isEmpty } from 'underscore';
import { useTranslation, Trans } from 'react-i18next';

const ContactForm = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const history = useNavigate();
  const dispatch = useDispatch();
  const inquiryData = useInquiryData();
  const [loading, setLoading] = useState(false);
  const [fullName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const category = 'general';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await dispatch(postContactUsInquiry({ fullName, email, message, category }));
    setLoading(false);
    console.log(inquiryData.success);
    !isEmpty(inquiryData) && inquiryData.success && history('/contact/sent');
  };

  return (
    <ContactUs arrow={<ArrowBackIcon />}>
      {isEmpty(inquiryData) && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>{t('about.contactUs.form.name')}</label>
            <br />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>{t('about.contactUs.form.email')}</label>
            <br />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>{t('about.contactUs.form.message')}</label>
            <br />
            <textarea
              type="text"
              rows="8"
              cols="30"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="checkpoint">
            <input type="checkbox" required />
            <label>
              <Trans i18nKey="about.contactUs.form.terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </Trans>
            </label>
          </div>
          <button type="submit" className="submit-button">
            {t('about.contactUs.form.cta')}
            {loading && <span>...</span>}
          </button>
        </form>
      )}
    </ContactUs>
  );
};

export default ContactForm;
