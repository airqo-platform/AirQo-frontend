import axios from 'axios';
import { GRIDS_URL } from '../urls/deviceRegistry';

export const getAllGridLocationsApi = async () => {
    try{
        const response = await axios.get(`${GRIDS_URL}`);
        return response.data
    }
    catch(error){
        throw error;
    }
}