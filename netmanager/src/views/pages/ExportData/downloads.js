import React, { useEffect, useState } from 'react';
import { getScheduleExportDataApi } from '../../apis/analytics';
import { isEmpty } from 'underscore';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { getElapsedDurationMapper, getFirstNDurations } from '../../../utils/dateTime';
import { Card, Typography, makeStyles } from '@material-ui/core';
import moment from 'moment';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { useDispatch } from 'react-redux';
import ExportDataBreadCrumb from './components/BreadCrumb';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  },
  longStrings: {
    overflow: 'hidden',
    whiteSpace: 'wrap',
    width: '300px',
    wordBreak: 'break-all'
  },
  failedLink: {
    color: 'red',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  successLink: {
    color: 'green',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  waitingLink: {
    color: 'orange',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  }
}));

const ExportDownloads = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  let userId = JSON.parse(localStorage.getItem('currentUser'))?._id;
  const [scheduledRequests, setScheduledRequests] = useState([]);

  const getScheduledRequests = () => {
    if (!isEmpty(userId)) {
      getScheduleExportDataApi(userId)
        .then((response) => {
          setScheduledRequests(response.data);
        })
        .catch((err) => {
          dispatch(
            updateMainAlert({
              message: err.response.data.message,
              show: true,
              severity: 'error'
            })
          );
        });
    }
  };

  useEffect(() => {
    getScheduledRequests();

    // Set up interval to call getScheduledRequests every 2 minutes
    const intervalId = setInterval(() => {
      getScheduledRequests();
    }, 0.5 * 60 * 1000);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={classes.root}>
      <ExportDataBreadCrumb title="Downloads" />
      <Card>
        <CustomMaterialTable
          title={'data export downloads'}
          userPreferencePaginationKey={'downloads'}
          data={scheduledRequests}
          columns={[
            {
              title: 'Request time',
              render: (downloads) => {
                const [elapsedDurationSeconds, elapsedDurationMapper] = getElapsedDurationMapper(
                  downloads.request_date
                );

                return (
                  <Typography variant="body1">
                    {getFirstNDurations(elapsedDurationMapper, 2)} ago
                  </Typography>
                );
              }
            },
            {
              title: 'Download status',
              render: (downloads) => {
                return (
                  <Typography
                    variant="body1"
                    className={
                      downloads.status === 'failed'
                        ? classes.failedLink
                        : downloads.status === 'ready'
                        ? classes.successLink
                        : classes.waitingLink
                    }
                  >
                    {downloads.status}
                  </Typography>
                );
              }
            },
            {
              title: 'Download Links',
              render: (downloads) => {
                return (
                  downloads.data_links &&
                  downloads.data_links.map((link, index) => (
                    <Typography variant="body1" key={index}>
                      <a href={link} target="_blank">
                        {'Export link ' + (index + 1)}
                      </a>
                    </Typography>
                  ))
                );
              }
            },
            {
              title: 'Start date',
              render: (downloads) => {
                return (
                  <Typography variant="body1">
                    {moment(downloads.start_date).format('DD/MM/YYYY')}
                  </Typography>
                );
              }
            },
            {
              title: 'End date',
              render: (downloads) => {
                return (
                  <Typography variant="body1">
                    {moment(downloads.end_date).format('DD/MM/YYYY')}
                  </Typography>
                );
              }
            },
            {
              title: 'Data request',
              render: (downloads) => {
                return (
                  <Typography variant="body1" className={classes.longStrings}>
                    {downloads.sites && downloads.sites.length > 0
                      ? downloads.sites.map((site, index) => <span key={index}>{site}, </span>)
                      : downloads.devices && downloads.devices.length > 0
                      ? downloads.devices.map((device, index) => (
                          <span key={index}>{device}, </span>
                        ))
                      : downloads.airqlouds && downloads.airqlouds.length > 0
                      ? downloads.airqlouds.map((airqloud, index) => (
                          <span key={index}>{airqloud}, </span>
                        ))
                      : null}
                  </Typography>
                );
              }
            }
          ]}
          options={{
            search: false,
            showTitle: false
          }}
        />
      </Card>
    </div>
  );
};

export default ExportDownloads;
