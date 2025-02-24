import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { TableContainer, Table, TableBody, TableCell, TableRow } from '@material-ui/core';

import 'chartjs-plugin-annotation';
import { isEmpty } from 'underscore';
import { loadDeviceMaintenanceLogs } from 'redux/DeviceRegistry/operations';
import { useDeviceLogsData } from 'redux/DeviceRegistry/selectors';
import { ChartContainer } from 'views/charts';
import DeviceDetails from './DeviceDetails';
import DeviceLocation from './DeviceLocation';
import DeviceQRCode from './DeviceQRCode';
import DeviceOverviewCharts from './DeviceOverviewChart';

// styles
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

const useStyles = makeStyles(styles);

function jsonArrayToString(myJsonArray) {
  let myArray = [];
  for (let i = 0; i < myJsonArray.length; i++) {
    let myString = myJsonArray[i].quantityKind + '(' + myJsonArray[i].measurementUnit + ')';
    myArray.push(myString);
  }
  return myArray.join(', ');
}

function appendLeadingZeroes(n) {
  if (n <= 9) {
    return '0' + n;
  }
  return n;
}

let formatDate = (date) => {
  let time =
    appendLeadingZeroes(date.getDate()) +
    '-' +
    appendLeadingZeroes(date.getMonth() + 1) +
    '-' +
    date.getFullYear();

  return time;
};

const DeviceMaintenanceLogs = ({ deviceName }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const deviceMaintenanceLogs = useDeviceLogsData(deviceName);

  useEffect(() => {
    if (deviceName && isEmpty(deviceMaintenanceLogs)) {
      dispatch(loadDeviceMaintenanceLogs(deviceName));
    }
  }, []);

  return (
    <ChartContainer title={'maintenance history'} blue>
      {deviceMaintenanceLogs.length > 0 && (
        <TableContainer className={classes.table}>
          <Table stickyHeader aria-label="sticky table" alignItems="left" alignContent="left">
            <TableBody>
              {deviceMaintenanceLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(new Date(log.date))}</TableCell>
                  {log.tags && log.tags.length > 0 ? (
                    <TableCell>
                      {typeof log.tags === 'string' ? log.tags : log.tags && log.tags.join(', ')}
                    </TableCell>
                  ) : (
                    <TableCell>{log.description}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {deviceMaintenanceLogs.length <= 0 && <div>No maintenance logs</div>}
    </ChartContainer>
  );
};

DeviceMaintenanceLogs.protoTypes = {
  deviceName: PropTypes.string.isRequired
};

const DeviceOverview = ({ deviceData }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-around'
      }}
    >
      <DeviceDetails deviceData={deviceData} />

      {deviceData.latitude ? <DeviceLocation deviceData={deviceData} /> : <span />}

      <DeviceOverviewCharts deviceName={deviceData.name} />

      <DeviceMaintenanceLogs deviceName={deviceData.name} />

      <DeviceQRCode deviceData={deviceData} />
    </div>
  );
};

export default DeviceOverview;

DeviceOverview.propTypes = {
  deviceData: PropTypes.object.isRequired
};
