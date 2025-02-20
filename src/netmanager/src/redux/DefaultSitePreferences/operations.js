import {
  getDefaultSelectedSitesApi,
  setDefaultSelectedSitesApi,
  deleteDefaultSelectedSiteApi,
  updateDefaultSelectedSiteApi
} from 'views/apis/authService';
import {
  loadDefaultSitesSuccess,
  loadDefaultSitesFailure,
  setDefaultSitesSuccess,
  setDefaultSitesFailure,
  deleteDefaultSiteSuccess,
  deleteDefaultSiteFailure,
  updateDefaultSiteSuccess,
  updateDefaultSiteFailure
} from './actions';

export const loadDefaultSites = () => async (dispatch) => {
  try {
    const response = await getDefaultSelectedSitesApi();
    if (response && response.selected_sites) {
      dispatch(loadDefaultSitesSuccess(response.selected_sites));
      return response.selected_sites;
    } else {
      dispatch(loadDefaultSitesSuccess([]));
      return [];
    }
  } catch (error) {
    dispatch(loadDefaultSitesFailure(error));
    throw error;
  }
};

export const setDefaultSites = (sites) => async (dispatch) => {
  try {
    await setDefaultSelectedSitesApi(sites);
    dispatch(setDefaultSitesSuccess(sites));
    return sites;
  } catch (error) {
    dispatch(setDefaultSitesFailure(error));
    throw error;
  }
};

export const deleteDefaultSite = (siteId) => async (dispatch) => {
  try {
    await deleteDefaultSelectedSiteApi(siteId);
    dispatch(deleteDefaultSiteSuccess(siteId));
    return siteId;
  } catch (error) {
    dispatch(deleteDefaultSiteFailure(error));
    throw error;
  }
};

export const updateDefaultSite = (siteId, siteData) => async (dispatch) => {
  try {
    await updateDefaultSelectedSiteApi(siteId, siteData);
    dispatch(updateDefaultSiteSuccess({ site_id: siteId, ...siteData }));
    return { site_id: siteId, ...siteData };
  } catch (error) {
    dispatch(updateDefaultSiteFailure(error));
    throw error;
  }
};
