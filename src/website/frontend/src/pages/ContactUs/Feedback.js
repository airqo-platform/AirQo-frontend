import React from 'react';
import FeedbackImg from 'assets/img/Feedback.png';
import { Link } from 'react-router-dom';
import { useInitScrollTop } from 'utilities/customHooks';
import { useTranslation, Trans } from 'react-i18next';

const Feedback = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  return (
    <div className="contactus-feedback">
      <div>
        <img src={FeedbackImg} alt="Thank you for your feedback" />
      </div>
      <h2>
        <Trans i18nKey="about.contactUs.feedBack.text">
          Thanks for reaching out. <br />
          We’ll get back to you!
        </Trans>
      </h2>
      <button>
        <Link to="/">{t('about.contactUs.feedBack.cta')}</Link>
      </button>
    </div>
  );
};

export default Feedback;
