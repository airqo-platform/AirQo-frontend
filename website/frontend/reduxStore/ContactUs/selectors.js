import { useSelector } from 'react-redux';

export const useInquiryData = () => useSelector((state) => state.inquiry);