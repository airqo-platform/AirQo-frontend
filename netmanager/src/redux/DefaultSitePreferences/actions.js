export const LOAD_DEFAULT_SITES_SUCCESS = 'LOAD_DEFAULT_SITES_SUCCESS';
export const LOAD_DEFAULT_SITES_FAILURE = 'LOAD_DEFAULT_SITES_FAILURE';

export const SET_DEFAULT_SITES_SUCCESS = 'SET_DEFAULT_SITES_SUCCESS';
export const SET_DEFAULT_SITES_FAILURE = 'SET_DEFAULT_SITES_FAILURE';

export const DELETE_DEFAULT_SITE_SUCCESS = 'DELETE_DEFAULT_SITE_SUCCESS';
export const DELETE_DEFAULT_SITE_FAILURE = 'DELETE_DEFAULT_SITE_FAILURE';

export const UPDATE_DEFAULT_SITE_SUCCESS = 'UPDATE_DEFAULT_SITE_SUCCESS';
export const UPDATE_DEFAULT_SITE_FAILURE = 'UPDATE_DEFAULT_SITE_FAILURE';

export const loadDefaultSitesSuccess = (sites) => ({
  type: LOAD_DEFAULT_SITES_SUCCESS,
  payload: sites
});

export const loadDefaultSitesFailure = (error) => ({
  type: LOAD_DEFAULT_SITES_FAILURE,
  payload: error
});

export const setDefaultSitesSuccess = (sites) => ({
  type: SET_DEFAULT_SITES_SUCCESS,
  payload: sites
});

export const setDefaultSitesFailure = (error) => ({
  type: SET_DEFAULT_SITES_FAILURE,
  payload: error
});

export const deleteDefaultSiteSuccess = (siteId) => ({
  type: DELETE_DEFAULT_SITE_SUCCESS,
  payload: siteId
});

export const deleteDefaultSiteFailure = (error) => ({
  type: DELETE_DEFAULT_SITE_FAILURE,
  payload: error
});

export const updateDefaultSiteSuccess = (site) => ({
  type: UPDATE_DEFAULT_SITE_SUCCESS,
  payload: site
});

export const updateDefaultSiteFailure = (error) => ({
  type: UPDATE_DEFAULT_SITE_FAILURE,
  payload: error
});
