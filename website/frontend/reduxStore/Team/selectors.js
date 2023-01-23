// take a slice of the application state and return some data based on that
import { useSelector } from 'react-redux';

export const useTeamData = () => useSelector((state) => state.teamData.team);
export const useTeamLoadingData = () => useSelector((state) => state.teamData.loading);
