// eslint-disable-next-line import/named
import { INQUIRY_SUCCESS, INQUIRY_FAILURE } from './actions';

const initialState = {};

export default function (state = initialState, action) {
    switch (action.type) {
        case INQUIRY_SUCCESS:
            return action.payload;

        case INQUIRY_FAILURE:
            return action.payload;

        default:
            return state;
    }
}
