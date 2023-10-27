import axios from 'axios';
import { GRIDS_URL } from '../urls/deviceRegistry';

export const getAllGridLocationsApi = async () => {
    await axios.get(`${GRIDS_URL}`).then(response => { return response.data })
}