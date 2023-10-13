import React, { useEffect, useState } from 'react';
import { ChartContainer } from 'views/charts';
import { useAirqloudUptimeData } from 'redux/DeviceManagement/selectors';
import { SortAscendingIcon, SortDescendingIcon } from 'assets/img';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'underscore';
import { useDevicesData } from 'redux/DeviceRegistry/selectors';

const AirqloudUptimeLeaderboard = () => {
  const history = useHistory();
  const allDevices = useDevicesData();
  const airqloudUptimeData = useAirqloudUptimeData();
  const [airqloudUptimeLoading, setAirqloudUptimeLoading] = useState(false);
  const [devicesUptime, setDevicesUptime] = useState([]);
  const [devicesUptimeDescending, setDevicesUptimeDescending] = useState(true);

  console.log(airqloudUptimeData);

  const sortLeaderBoardData = (leaderboardData) => {
    const sortByName = (device1, device2) => {
      if (device1.long_name.toLowerCase() > device2.long_name.toLowerCase()) return 1;
      if (device1.long_name.toLowerCase() < device2.long_name.toLowerCase()) return -1;
      return 0;
    };

    // reverse sorting
    return leaderboardData.sort((device1, device2) => {
      if (device1.uptime < device2.uptime) return 1;
      if (device1.uptime > device2.uptime) return -1;
      return sortByName(device1, device2);
    });
  };

  const patchLeaderboardData = (leaderboardData) => {
    if (isEmpty(allDevices)) return [];
    const patched = [];

    leaderboardData.map((data) => {
      const device_data = allDevices[data.device] || {};
      let { long_name, isActive } = device_data;

      long_name = long_name || data.device;

      if (isActive) {
        patched.push({ ...data, long_name });
      }
    });

    return sortLeaderBoardData(patched);
  };

  const handleSortIconClick = () => {
    setDevicesUptime(devicesUptime.reverse());
    setDevicesUptimeDescending(!devicesUptimeDescending);
  };

  useEffect(() => {
    setAirqloudUptimeLoading(true);
    if (isEmpty(airqloudUptimeData.devices)) {
      setDevicesUptime([]);
      setAirqloudUptimeLoading(false);
      return;
    }
    setDevicesUptime(patchLeaderboardData(airqloudUptimeData.devices));
    setDevicesUptimeDescending(true);

    setTimeout(() => {
      setAirqloudUptimeLoading(false);
    }, 5000);
  }, [airqloudUptimeData, allDevices]);

  return (
    <ChartContainer
      title={`Health status leaderboard ${
        !isEmpty(airqloudUptimeData) ? `for ${airqloudUptimeData.airqloud_name}` : ''
      }`}
      loading={airqloudUptimeLoading}
      controller={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {devicesUptimeDescending ? (
            <SortAscendingIcon onClick={handleSortIconClick} style={{ fill: 'white' }} />
          ) : (
            <SortDescendingIcon onClick={handleSortIconClick} style={{ fill: 'white' }} />
          )}
        </div>
      }
      blue
    >
      <div style={{ overflow: 'auto', height: '100%' }}>
        <div className={`m-device-uptime-row uptime-table-header`}>
          <span>device name</span>
          <span>downtime (%)</span>
          <span>uptime (%)</span>
        </div>
        {devicesUptime.map(({ long_name, device_name, uptime }, index) => {
          uptime = uptime <= 100 ? uptime : 100;
          const style =
            uptime >= 80 ? 'uptime-success' : uptime >= 50 ? 'uptime-warning' : 'uptime-danger';
          return (
            <div
              className={`m-device-uptime-row`}
              key={`device-${device_name}-${index}`}
              onClick={() => history.push(`/device/${device_name}/overview`)}
            >
              <span>{long_name}</span>
              <span>{(100 - uptime).toFixed(2)}</span>
              <span className={`${style}`}>{uptime.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
};

export default AirqloudUptimeLeaderboard;
