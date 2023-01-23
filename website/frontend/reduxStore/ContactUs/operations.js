import { INQUIRY_SUCCESS, INQUIRY_FAILURE } from './actions';
import { contactUsApi } from 'apis';


export const postContactUsInquiry = (data) => async (dispatch) => await contactUsApi(data)
    .then(() => {
        dispatch({
            type: INQUIRY_SUCCESS,
            payload: { 
                fullName: data.fullName,
                email: data.email, 
                message: data.message,
                category: data.category,
                success: true
            },
        });
    })
    .catch(() => {
        dispatch({
            type: INQUIRY_FAILURE,
            success: false
        });
    });
