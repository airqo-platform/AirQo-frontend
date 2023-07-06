import { useSelector } from 'react-redux';

export const usePressData = () => useSelector((state) => state.pressData.press);
