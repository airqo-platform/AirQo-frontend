import React, { useEffect, useState } from 'react';
import { getLogsApi } from '../../apis/authService';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import { Typography } from '@material-ui/core';
import { getFirstNDurations, getElapsedDurationMapper } from 'utils/dateTime';
import { useDispatch } from 'react-redux';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';

const LogsTable = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    setLoading(true);

    const params = {
      service: 'data-export'
    };

    await getLogsApi(params)
      .then((response) => {
        setLogs(response.users_stats);
        setLoading(false);
      })
      .catch((error) => {
        const errors = (error.response && error.response.data && error.response.data.errors) || {};

        dispatch(
          updateMainAlert({
            show: true,
            message: error.response.data.message,
            severity: 'error',
            extraContent: createAlertBarExtraContentFromObject(errors || {})
          })
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <CustomMaterialTable
      title={'activity logs'}
      userPreferencePaginationKey={'logs'}
      data={logs}
      isLoading={loading}
      columns={[
        {
          title: 'Timestamp',
          render: (logs) => {
            const [elapsedDurationSeconds, elapsedDurationMapper] = getElapsedDurationMapper(
              logs.meta.timestamp
            );

            return (
              <Typography variant="body1">
                {getFirstNDurations(elapsedDurationMapper, 2)} ago
              </Typography>
            );
          }
        },
        {
          title: 'Username',
          render: (logs) => {
            return (
              <Typography variant="body1" style={{ textTransform: 'capitalize' }}>
                {logs.meta.username}
              </Typography>
            );
          }
        },
        {
          title: 'Email',
          render: (logs) => {
            return <Typography variant="body1">{logs.meta.email}</Typography>;
          }
        },
        {
          title: 'Action',
          render: (logs) => {
            return <Typography variant="body1">{logs.message}</Typography>;
          }
        }
      ]}
      options={{
        search: true,
        searchFieldAlignment: 'right',
        showTitle: false
      }}
    />
  );
};

export default LogsTable;
