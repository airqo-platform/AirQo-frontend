import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { loadNewsletterData } from 'reduxStore/Newsletter/operations';
import { useNewsletterData } from 'reduxStore/Newsletter/selectors';
import { useTranslation } from 'react-i18next';

const NewsletterSection = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const newsletterData = useNewsletterData();
    const handleOnChange = (event) => setEmail(event.target.value);
    const { t } = useTranslation();

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        await dispatch(loadNewsletterData({ email }));
        setLoading(false);
    };

    return (
        <div className="Newsletter">
            <h3>{t("homepage.newsLetter.title")}!</h3>
            <p>{t("homepage.newsLetter.subText")}</p>
            {
                isEmpty(newsletterData)
                && (
                    <form className="newsletter-form">
                        <input
                            type="email"
                            placeholder={t("homepage.newsLetter.placeholder")}
                            className="newsletter-form-input"
                            onChange={handleOnChange}
                        />
                        <button
                            type="submit"
                            className="newsletter-form-btn"
                            onClick={onSubmit}
                        >
                            {t("homepage.newsLetter.button")}{loading && <span>...</span>}
                        </button>

                    </form>
                )
            }
            {
                !isEmpty(newsletterData) && newsletterData.successful
                && (
                    <div className="newsletter-info">
                        <span>👋</span>
                        <span>{t("homepage.newsLetter.subscribed")}...</span>
                    </div>
                )
            }
            {
                !isEmpty(newsletterData) && !newsletterData.successful
                && (
                    <div className="newsletter-info">
                        <span>😢</span>
                        <span>{t("homepage.newsLetter.failed")}</span>
                    </div>
                )
            }

        </div>
    );
};

export default NewsletterSection;
