// take a slice of the application state and return some data based on that
import { useSelector } from 'react-redux';

export const useSitesData = () => {
  return useSelector((state) => state.siteRegistry.sites);
};

export const useSitesArrayData = () => {
  return useSelector((state) => Object.values(state.siteRegistry.sites));
};

export const useSiteOptionsData = () => {
  return useSelector((state) => Object.values(state.siteRegistry.siteOptions));
};

export const useSitesSummaryData = () => {
  return useSelector((state) => Object.values(state.siteRegistry.sitesSummary));
};

export const useSiteDetailsData = () => {
  return useSelector((state) => state.siteRegistry.siteDetails);
};
