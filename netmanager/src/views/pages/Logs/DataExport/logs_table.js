import React, { useEffect, useState } from 'react';
import { getLogsApi } from '../../../apis/authService';
import CustomMaterialTable from '../../../components/Table/CustomMaterialTable';
import { Typography } from '@material-ui/core';
import { getFirstNDurations, getElapsedDurationMapper } from '../../../../utils/dateTime';
import { useDispatch } from 'react-redux';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';

const DataExportLogsTable = () => {
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
      title={'data export logs'}
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
                Exported data {getFirstNDurations(elapsedDurationMapper, 2)} ago
              </Typography>
            );
          }
        },
        {
          title: 'Username',
          render: (logs) => {
            return <Typography variant="body1">{logs.meta.username}</Typography>;
          }
        },
        {
          title: 'Email',
          render: (logs) => {
            return <Typography variant="body1">{logs.meta.email}</Typography>;
          }
        },
        {
          title: 'Level',
          render: (logs) => {
            return <Typography variant="body1">{logs.level}</Typography>;
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

export default DataExportLogsTable;
