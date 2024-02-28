import { useSelector } from 'react-redux';

export const usePublicationsData = () =>
  useSelector((state) => state.publicationsData.publications);

export const usePublicationsLoadingData = () =>
  useSelector((state) => state.publicationsData.loading);
