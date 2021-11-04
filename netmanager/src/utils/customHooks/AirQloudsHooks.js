import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import { loadAirQloudsData } from "redux/AirQloud/operations";
import { _useAirqloudsData } from "redux/AirQloud/selectors";

export const useAirQloudsData = () => {
  const airqlouds = _useAirqloudsData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isEmpty(airqlouds)) dispatch(loadAirQloudsData());
  }, []);
  return airqlouds;
};

// export const useDashboardSiteOptions = () => {
//   const sites = useDashboardSites();
//
//   const [siteOptions, setSiteOptions] = useState([]);
//   const [loaded, setLoaded] = useState(false);
//
//   useEffect(() => {
//     if (!isEmpty(sites) && !loaded) {
//       setLoaded(true);
//       setSiteOptions(createSiteOptions(sites));
//     }
//   }, [sites]);
//
//   return siteOptions;
// };