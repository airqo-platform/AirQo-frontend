import { isEmpty } from 'underscore';
import { getAllHighlightsApi, getAllTagsApi } from '../../apis';
import { LOAD_HIGHLIGHTS_FAILURE, LOAD_HIGHLIGHTS_SUCCESS, LOAD_TAGS_FAILURE, LOAD_TAGS_SUCCESS } from './actions';

export const loadHighlightsData = () => async (dispatch) => {
    await getAllHighlightsApi()
        .then((resData) => {
            if (isEmpty(resData || [])) return;
            dispatch({
                type: LOAD_HIGHLIGHTS_SUCCESS,
                payload: resData,
            });
        })
        .catch((err) => {
            dispatch({
                type: LOAD_HIGHLIGHTS_FAILURE,
                payload: err && err.message,
            });
        });
};

export const loadTagsData = () => async (dispatch) => {
    await getAllTagsApi()
        .then((resData) => {
            if (isEmpty(resData || [])) return;
            dispatch({
                type: LOAD_TAGS_SUCCESS,
                payload: resData,
            });
        })
        .catch((err) => {
            dispatch({
                type: LOAD_TAGS_FAILURE,
                payload: err && err.message,
            });
        });
};