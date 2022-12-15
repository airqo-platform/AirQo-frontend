// take a slice of the application state and return some data based on that
import { useSelector } from 'react-redux';

export const useBoardData = () => useSelector((state) => state.boardData.board);
export const useBoardLoadingData = () => useSelector((state) => state.boardData.loading);
