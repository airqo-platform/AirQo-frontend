import {
  UPDATE_USER_PREFERENCE_SUCCESS,
  UPDATE_USER_PREFERENCE_FAILURE,
} from "./actions";

export const updateUserPreference = (preferenceKey, newValue) => (
  dispatch,
  getState
) => {
  const userPreferenceState = getState().userPreference;
  dispatch({
    type: UPDATE_USER_PREFERENCE_SUCCESS,
    payload: {
      ...userPreferenceState,
      [preferenceKey]: {
        ...(userPreferenceState[preferenceKey] || {}),
        ...newValue,
      },
    },
  });
};
