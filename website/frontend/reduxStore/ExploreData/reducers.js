import { EXPLORE_DATA_USER_REGISTRATION_SUCCESS, EXPLORE_DATA_USER_ORGANISATION_REGISTRATION_SUCCESS } from "./actions";

const initialState = {
    firstName: null, 
    lastName: null, 
    email: null, 
    description: null, 
    category: null, 
    long_organization: null, 
    jobTitle: null, 
    website: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case EXPLORE_DATA_USER_REGISTRATION_SUCCESS:
            return {...state, ...action.payload};
        case EXPLORE_DATA_USER_ORGANISATION_REGISTRATION_SUCCESS:
            return {...state, ...action.payload};
        default:
            return state;
    }
}