import { EXPLORE_DATA_REQUEST_SUCCESS, SET_USER_ORGANISATION_SUCCESS } from "./actions";

const initialState = {}

export default function (state = initialState, action) {
    switch (action.type) {
        case EXPLORE_DATA_REQUEST_SUCCESS:
            return {...state, ...action.payload};
        case SET_USER_ORGANISATION_SUCCESS:
            return {...state, ...action.payload};
        default:
            return state;
    }
}