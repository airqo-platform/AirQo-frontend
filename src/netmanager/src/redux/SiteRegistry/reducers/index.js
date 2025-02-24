import { combineReducers } from 'redux';
import sites from './sites';
import siteOptions from './siteOptions';
import sitesSummary from './sitesSummary';
import siteDetails from './siteDetails';

export default combineReducers({
  sites,
  siteOptions,
  sitesSummary,
  siteDetails
});
