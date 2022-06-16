import { useSelector } from "react-redux";

export const useExploreUserData = () => useSelector((state) => state.exploreData);