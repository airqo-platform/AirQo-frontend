import { useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import { isEmpty } from "underscore";
import { loadUptimeLeaderboardData } from "redux/DeviceManagement/operations";
import { useUptimeLeaderboardData } from "redux/DeviceManagement/selectors";
import { roundToEndOfDay, roundToStartOfDay } from "../dateTime";

export const useDeviceUptimeLeaderboard = () => {
  const leaderboard = useUptimeLeaderboardData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isEmpty(leaderboard))
      dispatch(
        loadUptimeLeaderboardData({
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(28, "days").toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString(),
        })
      );
  }, []);

  return leaderboard;
};
