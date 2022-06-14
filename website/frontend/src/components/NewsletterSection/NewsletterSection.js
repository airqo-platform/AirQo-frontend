import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { loadNewsletterData } from 'reduxStore/Newsletter/operations';
import { useNewsletterData } from 'reduxStore/Newsletter/selectors';

const NewsletterSection = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const newsletterData = useNewsletterData();
  const handleOnChange = (event) => setEmail(event.target.value);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await dispatch(loadNewsletterData({ email }));
    setLoading(false);
  };

  return (
        <div className="Newsletter">
            <h3>Get air quality updates!</h3>
            <p>Subscribe to our newsletter and learn about the air quality you are breathing</p>
            {
                isEmpty(newsletterData)
                    && (
                        <form className="newsletter-form">
                            <input
                              type="email"
                              placeholder="Enter your email"
                              className="newsletter-form-input"
                              onChange={handleOnChange}
                            />
                            <button
                              type="submit"
                              className="newsletter-form-btn"
                              onClick={onSubmit}
                            >
                                Subscribe{loading && <span>...</span>}
                            </button>

                        </form>
                    )
            }
            {
                !isEmpty(newsletterData) && newsletterData.successful
                    && (
                        <div className="newsletter-info">
                            <span>👋</span>
                            <span>Thanks for joining...</span>
                        </div>
                    )
            }
            {
                !isEmpty(newsletterData) && !newsletterData.successful
                    && (
                        <div className="newsletter-info">
                            <span>😢</span>
                            <span>Oops! Something went wrong. Please try again!</span>
                        </div>
                    )
            }

        </div>
  );
};

export default NewsletterSection;
