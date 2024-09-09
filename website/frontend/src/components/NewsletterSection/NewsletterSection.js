import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { loadNewsletterData } from 'reduxStore/Newsletter';
import { useTranslation } from 'react-i18next';

const NewsletterSection = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const newsletterData = useSelector((state) => state.newsletter);
  const { t } = useTranslation();

  console.info(newsletterData);

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await dispatch(loadNewsletterData(formData));
    setLoading(false);
  };

  return (
    <section className="Newsletter">
      <h3>{t('homepage.newsLetter.title')}!</h3>
      <p>{t('homepage.newsLetter.subText')}</p>
      {isEmpty(newsletterData) && (
        <form onSubmit={onSubmit} className="newsletter-form">
          <div
            style={{
              display: 'flex',
              width: '100%'
            }}>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleOnChange}
              className="newsletter-form-input"
              placeholder={t('homepage.newsLetter.firstNamePlaceholder')}
              required
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleOnChange}
              className="newsletter-form-input"
              placeholder={t('homepage.newsLetter.lastNamePlaceholder')}
              required
            />
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%'
            }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleOnChange}
              className="newsletter-form-input"
              placeholder={t('homepage.newsLetter.emailPlaceholder')}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="newsletter-form-btn">
            {t('homepage.newsLetter.button')}
            {loading && <span>...</span>}
          </button>
        </form>
      )}
      {!isEmpty(newsletterData) && newsletterData.successful && (
        <div className="newsletter-info">
          <span>👋</span>
          <span>{t('homepage.newsLetter.subscribed')}...</span>
        </div>
      )}
      {!isEmpty(newsletterData) && !newsletterData.successful && (
        <div className="newsletter-info">
          <span>😢</span>
          <span>{t('homepage.newsLetter.failed')}</span>
        </div>
      )}
    </section>
  );
};

export default NewsletterSection;
