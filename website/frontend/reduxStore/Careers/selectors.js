// take a slice of the application state and return some data based on that
import { useSelector } from 'react-redux';

export const useCareerListingData = () => useSelector((state) => state.careersData.listing);
