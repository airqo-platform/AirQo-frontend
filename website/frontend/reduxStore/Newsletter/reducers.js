// eslint-disable-next-line import/named
import { NEWSLETTER_SUBSCRIPTION_SUCCESS, NEWSLETTER_SUBSCRIPTION_FAILURE } from './actions';

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case NEWSLETTER_SUBSCRIPTION_SUCCESS:
      return action.payload;

    case NEWSLETTER_SUBSCRIPTION_FAILURE:
      return action.payload;

    default:
      return state;
  }
}
