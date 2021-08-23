import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { isEmpty } from "underscore";
import { useDashboardSitesData } from "redux/Dashboard/selectors";
import { loadSites } from "redux/Dashboard/operations";

export const useDashboardSites = () => {
  const sites = useDashboardSitesData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isEmpty(sites)) dispatch(loadSites());
  }, []);

  return sites;
};

