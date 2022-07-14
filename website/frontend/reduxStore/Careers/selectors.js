// take a slice of the application state and return some data based on that
import { useSelector } from 'react-redux';

export const useCareerListingData = () => useSelector((state) => state.careersData.listing);
export const useCareerLoadingData = () => useSelector((state) => state.careersData.loading);
export const useCareerDepartmentsData = () => useSelector((state) => state.careersData.departments);
