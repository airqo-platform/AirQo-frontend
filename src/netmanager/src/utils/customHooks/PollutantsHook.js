import { useOrgData } from "redux/Join/selectors";

export const usePollutantsOptions = () => {
  const orgData = useOrgData();
  if (orgData.name.toLowerCase() === "airqo") {
    return [
      { value: "pm2_5", label: "PM 2.5" },
      { value: "pm10", label: "PM 10" },
    ];
  }

  return [
    { value: "pm2_5", label: "PM 2.5" },
    { value: "pm10", label: "PM 10" },
    { value: "no2", label: "NO2" },
  ];
};
