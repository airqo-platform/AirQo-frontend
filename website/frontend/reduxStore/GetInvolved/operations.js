import {
  GET_INVOLVED_REGISTRATION_SUCCESS,
  GET_INVOLVED_REGISTRATION_FAILURE,
  SHOW_GET_INVOLVED_MODAL_SUCCESS,
  SHOW_GET_INVOLVED_MODAL_FAILURE,
  UPDATE_GET_INVOLVED_DATA_SUCCESS,
  UPDATE_GET_INVOLVED_DATA_FAILURE,
} from './actions';

export const showGetInvolvedModal = (openModal) => (dispatch) => {
  dispatch({
    type: SHOW_GET_INVOLVED_MODAL_SUCCESS,
    payload: { openModal },
  });
};

export const updateGetInvolvedData = (data) => (dispatch) => {
  dispatch({
    type: UPDATE_GET_INVOLVED_DATA_SUCCESS,
    payload: data,
  });
};

// export const loadNewsletterData = (data) => async (dispatch) => await newsletterSubscriptionApi(data)
//   .then(() => {
//     dispatch({
//       type: NEWSLETTER_SUBSCRIPTION_SUCCESS,
//       payload: { email: data.email, successful: true },
//     });
//   })
//   .catch(() => {
//     dispatch({
//       type: NEWSLETTER_SUBSCRIPTION_FAILURE,
//       payload: { successful: false },
//     });
//   });
