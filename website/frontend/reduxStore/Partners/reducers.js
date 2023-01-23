import { LOAD_PARTNERS_FAILURE, LOAD_PARTNERS_SUCCESS } from './actions';

const initialState = {
    partners: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LOAD_PARTNERS_SUCCESS:
            return { ...state, partners: action.payload };
        case LOAD_PARTNERS_FAILURE:
            return { ...state, partners: action.payload };
        default:
            return state;
    }
}
