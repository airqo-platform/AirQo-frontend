import { LOAD_HIGHLIGHTS_SUCCESS, LOAD_TAGS_SUCCESS } from "./actions";

const initialState = {
    loading: false,
    highlights: [],
    tags: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LOAD_HIGHLIGHTS_SUCCESS:
            console.log(action.payload);
            return { ...state, highlights: action.payload };

        case LOAD_TAGS_SUCCESS:
            console.log(action.payload);
            return { ...state, tags: action.payload };

        default:
            return state;
    }
}