import { useSelector } from "react-redux";

export const useOrgData = () => {
  return useSelector((state) => state.organisation);
};
