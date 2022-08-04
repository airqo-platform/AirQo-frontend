import { useSelector } from "react-redux";

export const useHighlightsData = () => useSelector((state) => state.highlightsData.highlights);
export const useTagsData = () => useSelector((state) => state.highlightsData.tags);