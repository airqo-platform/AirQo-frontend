import { EXPLORE_DATA_REQUEST_SUCCESS, EXPLORE_STATE_DATA_SUCCESS } from "./actions";

const initialState = {
    category: null,
    firstName: null,
    lastName: null,
    long_organization: null,
    jobTitle: null,
    email: null,
    success: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case EXPLORE_DATA_REQUEST_SUCCESS:
            return {...state, ...action.payload};
        case EXPLORE_STATE_DATA_SUCCESS:
            return {...state, ...action.payload};
        default:
            return state;
    }
}