/* eslint-disable */
import {
    SET_CURRENT_USER,
    USER_LOADING,
    UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_FAILED,
    UPDATE_PASSWORD_SUCCESS,
    REGISTRATION_SUCCESS,
    UPDATE_AUTHENTICATED_USER_SUCCESS,
    UPDATE_AUTHENTICATED_USER_REQUEST,
    UPDATE_AUTHENTICATED_USER_FAILED
} from '../types';

const isEmpty = require('is-empty');

const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false,
    updating: false,
    registered: false
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
                updating: false,
                user: action.payload
            };
        case REGISTRATION_SUCCESS:
            return {
                ...state,
                registered: true
            };
        case UPDATE_AUTHENTICATED_USER_SUCCESS:
            return {
                ...state,
                user: action.payload,
                updating: false
            };
        case UPDATE_AUTHENTICATED_USER_FAILED:
            return {
                ...state,
                updating: false
            };
        case UPDATE_AUTHENTICATED_USER_REQUEST:
            return {
                ...state,
                updating: true
            };
        default:
            return state;
    }
}