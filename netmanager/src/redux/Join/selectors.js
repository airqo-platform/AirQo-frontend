import { useSelector } from "react-redux";

export const useOrgData = () => {
  return useSelector((state) => state.organisation);
};

export const useAuthUser = () => {
  return useSelector((state) => (state.auth && state.auth.user) || {});
};
