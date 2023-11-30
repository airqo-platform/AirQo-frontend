import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@material-ui/core';
import Copyable from 'views/components/Copy/Copyable';
import { ChartContainer } from 'views/charts';
import { decryptKeyApi } from 'views/apis/deviceRegistry';
import { isEmpty } from 'underscore';
import format from 'date-fns/format';
import { stripTrailingSlash } from '../../../../../config/utils';
import HowToApiModal from '../../../HowToApiModal';

const BASE_ANALYTICS_URL = stripTrailingSlash(process.env.REACT_APP_BASE_URL_V2);

const DeviceDetails = ({ deviceData }) => {
  const BLANK_PLACE_HOLDER = '-';
  const [openModal, setOpenModal] = useState(false);
  const [readKey, setReadKey] = useState('');
  const [writeKey, setWriteKey] = useState('');

  const decryptKey = async (key, callback) => {
    return await decryptKeyApi(key).then((res) => {
      callback(res.decrypted_key || 'Could not decrypt key');
    });
  };

  const deviceStatus = !deviceData.status
    ? deviceData.isActive === true
      ? 'deployed'
      : 'not deployed'
    : deviceData.status;

  useEffect(() => {
    if (!isEmpty(deviceData)) {
      if (!isEmpty(deviceData.readKey) && !isEmpty(deviceData.writeKey)) {
        decryptKey(deviceData.readKey, setReadKey);
        decryptKey(deviceData.writeKey, setWriteKey);
      }
    }
  }, []);

  return (
    <ChartContainer title={'device details'} blue scrollableYAxis>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="sticky table">
          <TableBody>
            <TableRow>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>{deviceData.long_name || BLANK_PLACE_HOLDER}</TableCell>
            </TableRow>
            {deviceData.createdAt ? (
              <TableRow>
                <TableCell>
                  <b>Date Created</b>
                </TableCell>
                <TableCell>
                  {format(new Date(deviceData.createdAt), 'dd-MMM-yyyy  kk:mm') ||
                    BLANK_PLACE_HOLDER}
                </TableCell>
              </TableRow>
            ) : (
              <span />
            )}
            <TableRow>
              <TableCell>
                <b>Deployment status</b>
              </TableCell>
              <TableCell>
                <span
                  style={{
                    color: deviceStatus === 'deployed' ? 'green' : 'red',
                    textTransform: 'capitalize'
                  }}
                >
                  {deviceStatus}
                </span>
              </TableCell>
            </TableRow>
            {deviceData.powerType ? (
              <TableRow>
                <TableCell>
                  <b>Power Type</b>
                </TableCell>
                <TableCell style={{ textTransform: 'capitalize' }}>
                  {deviceData.powerType || BLANK_PLACE_HOLDER}
                </TableCell>
              </TableRow>
            ) : (
              <span />
            )}
            <TableRow>
              <TableCell>
                <b>Owner</b>
              </TableCell>
              <TableCell style={{ textTransform: 'capitalize' }}>
                {`${deviceData.network} Network` || BLANK_PLACE_HOLDER}
              </TableCell>
            </TableRow>
            {deviceData.device_number ? (
              <TableRow>
                <TableCell>
                  <b>Device Number (Channel ID)</b>
                </TableCell>
                <TableCell>{deviceData.device_number || BLANK_PLACE_HOLDER}</TableCell>
              </TableRow>
            ) : (
              <span />
            )}
            {deviceData.longitude ? (
              <TableRow>
                <TableCell>
                  <b>Longitude</b>
                </TableCell>
                <TableCell>{deviceData.longitude || BLANK_PLACE_HOLDER}</TableCell>
              </TableRow>
            ) : (
              <span />
            )}
            {deviceData.latitude ? (
              <TableRow>
                <TableCell>
                  <b>Latitude</b>
                </TableCell>
                <TableCell>{deviceData.latitude || BLANK_PLACE_HOLDER}</TableCell>
              </TableRow>
            ) : (
              <span />
            )}
            {deviceData.site ? (
              <TableRow>
                <TableCell>
                  <b>Site</b>
                </TableCell>
                <TableCell>{deviceData.site.name || BLANK_PLACE_HOLDER}</TableCell>
              </TableRow>
            ) : (
              <span />
            )}
            {deviceData.site ? (
              <TableRow>
                <TableCell>
                  <b>Site Location</b>
                </TableCell>
                <TableCell>{deviceData.site.location_name || BLANK_PLACE_HOLDER}</TableCell>
              </TableRow>
            ) : (
              <span />
            )}
            <TableRow>
              <TableCell>
                <b>Read Key</b>
              </TableCell>
              <TableCell>
                <Copyable value={readKey || BLANK_PLACE_HOLDER} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Write Key</b>
              </TableCell>
              <TableCell>
                <Copyable value={writeKey || BLANK_PLACE_HOLDER} />
              </TableCell>
            </TableRow>
            {deviceData._id && (
              <TableRow>
                <TableCell>
                  <b>Historical measurements API</b>
                </TableCell>
                <TableCell>
                  <Copyable
                    value={
                      `${stripTrailingSlash(BASE_ANALYTICS_URL)}/devices/measurements/devices/${
                        deviceData._id
                      }/historical` || BLANK_PLACE_HOLDER
                    }
                    isScrollable
                  />
                </TableCell>
              </TableRow>
            )}
            {deviceData._id && (
              <TableRow>
                <TableCell>
                  <b>Recent measurements API</b>
                </TableCell>
                <TableCell>
                  <Copyable
                    value={
                      `${stripTrailingSlash(BASE_ANALYTICS_URL)}/devices/measurements/devices/${
                        deviceData._id
                      }` || BLANK_PLACE_HOLDER
                    }
                    isScrollable
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          justifyContent: 'flex-end',
          textDecoration: 'underline',
          padding: '10px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => setOpenModal(true)}
      >
        <p style={{ width: '100%', textAlign: 'right' }}>How to use the API</p>
      </Box>
      <HowToApiModal open={openModal} onClose={() => setOpenModal(false)} />
    </ChartContainer>
  );
};

export default DeviceDetails;
