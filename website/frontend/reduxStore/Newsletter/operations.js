import { newsletterSubscriptionApi } from 'apis';
import {
  NEWSLETTER_SUBSCRIPTION_SUCCESS,
  NEWSLETTER_SUBSCRIPTION_FAILURE,
} from './actions';

export const loadNewsletterData = (data) => async (dispatch) => await newsletterSubscriptionApi(data)
  .then(() => {
    dispatch({
      type: NEWSLETTER_SUBSCRIPTION_SUCCESS,
      payload: { email: data.email, successful: true },
    });
  })
  .catch(() => {
    dispatch({
      type: NEWSLETTER_SUBSCRIPTION_FAILURE,
      payload: { successful: false },
    });
  });
