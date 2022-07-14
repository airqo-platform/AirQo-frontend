import { useSelector } from "react-redux";

export const useExploreData = () => useSelector((state) => state.exploreData);