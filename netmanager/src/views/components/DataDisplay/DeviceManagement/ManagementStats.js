import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { isEmpty } from 'underscore';
import { useDevicesStatusData, useNetworkUptimeData } from 'redux/DeviceManagement/selectors';
import { loadDevicesStatusData, loadNetworkUptimeData } from 'redux/DeviceManagement/operations';
import { createBarChartData, ApexTimeSeriesData } from 'utils/charts';
import { updateDeviceBackUrl } from 'redux/Urls/operations';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { useDevicesData } from 'redux/DeviceRegistry/selectors';
import {
  ApexChart,
  ChartContainer,
  timeSeriesChartOptions,
  createPieChartOptions
} from 'views/charts';
import { roundToStartOfDay, roundToEndOfDay } from 'utils/dateTime';

import { SortAscendingIcon, SortDescendingIcon } from 'assets/img';
import { useDeviceUptimeLeaderboard, useInitScrollTop } from 'utils/customHooks';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { TextField } from '@material-ui/core';
import RichTooltip from 'views/containers/RichToolTip';
import EditIcon from '@material-ui/icons/Edit';

// css style
import 'chartjs-plugin-annotation';
import 'assets/scss/device-management.sass';
import 'assets/css/device-view.css'; // there are some shared styles here too :)
import { loadUptimeLeaderboardData } from 'redux/DeviceManagement/operations';
import { withPermission } from '../../../containers/PageAccess';

function ManagementStat() {
  useInitScrollTop();
  const history = useHistory();
  const location = useLocation();
  const devicesStatusData = useDevicesStatusData();
  const networkUptimeData = useNetworkUptimeData();
  const leaderboardData = useDeviceUptimeLeaderboard();
  const allDevices = useDevicesData();
  const dispatch = useDispatch();
  const [devicesUptime, setDevicesUptime] = useState([]);
  const [devicesUptimeDescending, setDevicesUptimeDescending] = useState(true);
  const [pieChartStatusValues, setPieChartStatusValues] = useState([]);
  const [networkUptimeDataset, setNetworkUptimeDataset] = useState({
    bar: { label: [], data: [] },
    line: { label: [], data: [] }
  });
  const [leaderboardDateMenu, toggleLeaderboardDateMenu] = useState(false);
  const [leaderboardDateRange, setLeaderboardDateRange] = useState('1');

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
      const device_data = allDevices[data.device_name] || {};
      let { long_name, isActive } = device_data;

      long_name = long_name || data.device_name;

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
    if (isEmpty(devicesStatusData)) {
      dispatch(
        loadDevicesStatusData({
          startDate: roundToStartOfDay(new Date().toISOString()).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString(),
          limit: 1
        })
      );
    }
    if (isEmpty(networkUptimeData)) {
      dispatch(
        loadNetworkUptimeData({
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(3, 'days').toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString()
        })
      );
    }

    if (isEmpty(leaderboardData)) {
      dispatch(
        loadUptimeLeaderboardData({
          startDate: roundToStartOfDay(new Date().toISOString()).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString()
        })
      );
    }

    if (isEmpty(allDevices)) dispatch(loadDevicesData());

    dispatch(updateDeviceBackUrl(location.pathname));
  }, []);

  useEffect(() => {
    let lineLabel = [];
    let lineData = [];
    if (isEmpty(networkUptimeData)) {
      return;
    }
    networkUptimeData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    networkUptimeData.map((val) => {
      lineLabel.push(val.created_at);
      lineData.push(parseFloat(val.uptime).toFixed(2));
    });

    const barChartData = createBarChartData(networkUptimeData.reverse(), 'uptime');

    setNetworkUptimeDataset({
      line: { label: lineLabel, data: lineData },
      bar: { label: barChartData.label, data: barChartData.data }
    });
  }, [networkUptimeData]);

  useEffect(() => {
    if (isEmpty(devicesStatusData)) {
      return;
    }
    setPieChartStatusValues([
      devicesStatusData.count_of_offline_devices,
      devicesStatusData.count_of_online_devices
    ]);
  }, [devicesStatusData]);

  useEffect(() => {
    if (isEmpty(leaderboardData)) {
      return;
    }
    setDevicesUptime(patchLeaderboardData(leaderboardData));
    setDevicesUptimeDescending(true);
  }, [leaderboardData, allDevices]);

  const series = [
    {
      name: 'uptime',
      data: ApexTimeSeriesData(networkUptimeDataset.line.label, networkUptimeDataset.line.data)
    }
  ];

  const updateLeaderboardDateRange = (e) => {
    e.preventDefault();
    const { value } = e.target;

    setLeaderboardDateRange(value);

    if (value === '1') {
      dispatch(
        loadUptimeLeaderboardData({
          startDate: roundToStartOfDay(new Date().toISOString()).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString()
        })
      );
    } else {
      dispatch(
        loadUptimeLeaderboardData({
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(parseInt(value), 'days').toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString()
        })
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className={'container-wrapper'}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ApexChart
            options={timeSeriesChartOptions({
              stroke: {
                width: 1.5
              }
            })}
            title={'Network uptime'}
            series={series}
            lastUpdated={networkUptimeData.length > 0 && networkUptimeData[0].created_at}
            type="area"
            blue
          />
          <ApexChart
            options={createPieChartOptions(['#FF2E2E', '#00A300'], ['Offline', 'Online'])}
            series={pieChartStatusValues}
            title={'online status'}
            lastUpdated={devicesStatusData.created_at}
            type="pie"
            green
            centerItems
            disableController
          />

          <ChartContainer
            title={`Leaderboard in the last ${
              leaderboardDateRange === '1' ? '24 hours' : `${leaderboardDateRange} days`
            }`}
            controller={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {devicesUptimeDescending ? (
                  <SortAscendingIcon onClick={handleSortIconClick} style={{ fill: 'white' }} />
                ) : (
                  <SortDescendingIcon onClick={handleSortIconClick} style={{ fill: 'white' }} />
                )}
                <RichTooltip
                  content={
                    <div style={{ width: '200px' }}>
                      <TextField
                        id="range"
                        select
                        fullWidth
                        label="Range"
                        value={
                          leaderboardDateRange === '1' ? 'Last 24 hours' : leaderboardDateRange
                        }
                        style={{ marginTop: '15px' }}
                        onChange={updateLeaderboardDateRange}
                        SelectProps={{
                          native: true,
                          style: { width: '100%', height: '40px' }
                        }}
                        variant="outlined"
                      >
                        <option value={'1'}>Last 24 hours</option>
                        <option value={'2'}>Last 2 days</option>
                        <option value={'3'}>Last 3 days</option>
                        <option value={'4'}>Last 4 days</option>
                        <option value={'5'}>Last 5 days</option>
                      </TextField>
                    </div>
                  }
                  open={leaderboardDateMenu}
                  onClose={() => toggleLeaderboardDateMenu(false)}
                  placement="bottom-end"
                >
                  <EditIcon onClick={() => toggleLeaderboardDateMenu(!leaderboardDateMenu)} />
                </RichTooltip>
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
                  uptime >= 80
                    ? 'uptime-success'
                    : uptime >= 50
                    ? 'uptime-warning'
                    : 'uptime-danger';
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
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default withPermission(ManagementStat, 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
