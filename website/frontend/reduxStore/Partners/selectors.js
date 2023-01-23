import { useSelector } from 'react-redux';

export const usePartnersData = () => useSelector((state) => state.partnersData.partners);
