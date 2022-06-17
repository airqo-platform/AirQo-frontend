import { requestDataAccessApi } from "apis";
import { EXPLORE_DATA_REQUEST_SUCCESS } from "./actions";

export const addExploreDataRequest = (data) => async (dispatch) => await requestDataAccessApi(data)
    .then(res=>{
        console.log('User data: ', data);
        dispatch({
            type: EXPLORE_DATA_REQUEST_SUCCESS,
            payload: {
                firstName: data.firstName, 
                lastName: data.lastName, 
                email: data.email, 
                description: data.description, 
                category: data.category, 
                long_organization: data.long_organization, 
                jobTitle: data.jobTitle, 
                website: data.website,
                success: true
            }
        });
    })
    .catch(err => {
        dispatch({
            type: EXPLORE_DATA_REQUEST_FAILURE,
            success: false
        })
    })