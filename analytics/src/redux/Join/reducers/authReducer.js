import {
    SET_CURRENT_USER,
    USER_LOADING,
    UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_FAILED,
    UPDATE_PASSWORD_SUCCESS
} from "../types";

const isEmpty = require("is-empty");

const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false,
    passwordUpdated: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                isAuthenticated: !isEmpty(action.payload),
                user: action.payload
            };
        case USER_LOADING:
            return {
                ...state,
                loading: true
            };
        case UPDATE_PASSWORD_SUCCESS:
            return {
                ...state,
                passwordUpdated: true,
                user: action.payload
            }
        default:
            return state;
    }
}