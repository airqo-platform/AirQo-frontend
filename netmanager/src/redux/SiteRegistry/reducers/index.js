import { combineReducers } from 'redux';
import sites from './sites';
import siteOptions from './siteOptions';
import sitesSummary from './sitesSummary';

export default combineReducers({
  sites,
  siteOptions,
  sitesSummary
});
