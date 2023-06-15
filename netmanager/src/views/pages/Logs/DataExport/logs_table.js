import React, { useEffect, useState } from 'react';
import { getLogsApi } from '../../../apis/authService';
import CustomMaterialTable from '../../../components/Table/CustomMaterialTable';
import { Typography } from '@material-ui/core';
import moment from 'moment';

const DataExportLogsTable = () => {
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
        console.log(error);
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
            return (
              <Typography variant="body1">
                {moment(logs.meta.timestamp, 'YYYYMMDD').fromNow()}
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
