import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { isEmpty } from "underscore";
import { useDashboardSitesData } from "redux/Dashboard/selectors";
import { loadSites } from "redux/Dashboard/operations";
import { createSiteOptions } from "utils/sites";

export const useDashboardSites = () => {
  const sites = useDashboardSitesData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isEmpty(sites)) {
      dispatch(loadSites());
    }
  }, []);
  return sites;
};

export const useDashboardSiteOptions = () => {
  const sites = useDashboardSites();

  const [siteOptions, setSiteOptions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isEmpty(sites) && !loaded) {
      setLoaded(true);
      setSiteOptions(createSiteOptions(sites));
    }
  }, [sites]);

  return siteOptions;
};
