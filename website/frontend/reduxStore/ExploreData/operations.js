import { requestDataAccessApi } from "apis";
import { EXPLORE_DATA_REQUEST_SUCCESS, EXPLORE_STATE_DATA_SUCCESS, EXPLORE_DATA_REQUEST_FAILURE } from "./actions";

export const addExploreDataRequest = (data) => async (dispatch) => await requestDataAccessApi({data})
    .then(res=>{
        console.log('User data: ', data);
        dispatch({
            type: EXPLORE_DATA_REQUEST_SUCCESS,
            payload: {...data, success: true}
        });
    })
    .catch(err => {
        console.log(err);
        dispatch({
            type: EXPLORE_DATA_REQUEST_FAILURE,
        })
    });

export const postStateData = (data) => (dispatch) =>  {
    console.log(data);
    return dispatch({
        type: EXPLORE_STATE_DATA_SUCCESS,
        payload: {...data, success: true}
    });
}