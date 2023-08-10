import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import CustomMaterialTable from '../../Table/CustomMaterialTable';
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';
import { getFaultsApi } from 'views/apis/deviceMonitoring';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  title: {
    fontWeight: 700,
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Open Sans'
  }
}));

const faultColumns = [
  {
    title: 'Device Name',
    field: 'Device Name',
    render: (rowData) => {
      return rowData ? rowData.device_name : '';
    },
    cellStyle: { width: '25%' },
    headerStyle: { textAlign: 'left' }
  },

  {
    title: 'Correlation Fault',
    field: 'Correlation Fault',
    render: (rowData) => {
      return rowData ? rowData.correlation_fault : '';
    },
    cellStyle: { fontFamily: 'Open Sans', width: '25%', textAlign: 'center' },
    headerStyle: { textAlign: 'center' }
  },
  {
    title: 'Missing Data Fault',
    field: 'Missing Data Fault',
    render: (rowData) => {
      return rowData ? rowData.missing_data_fault : '';
    },
    cellStyle: { width: '25%', textAlign: 'center' },
    headerStyle: { textAlign: 'center' }
  },
  {
    title: 'Date',
    field: 'Date',
    render: (rowData) => {
      if (rowData) {
        const date = new Date(rowData.created_at);
        return date.toLocaleString();
      } else {
        return '';
      }
    },
    cellStyle: { width: '25%', textAlign: 'center' },
    headerStyle: { textAlign: 'center' }
  }
];

const faultData = [
  {
    device_name: 'Device 1',
    correlation_fault: '0',
    missing_data_fault: '1',
    created_at: '2020-07-01 12:00:00'
  },
  {
    device_name: 'Device 2',
    correlation_fault: '1',
    missing_data_fault: '0',
    created_at: '2020-07-01 12:00:00'
  },
  {
    device_name: 'Device 3',
    correlation_fault: '1',
    missing_data_fault: '1',
    created_at: '2020-07-01 12:00:00'
  },
  {
    device_name: 'Device 4',
    correlation_fault: '0',
    missing_data_fault: '0',
    created_at: '2020-07-01 12:00:00'
  }
];

const ManagementFaults = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getFaultsApi();
      setFaults(result);
    };
    setLoading(false);
    fetchData();

    console.log('faults', faults);
  }, []);

  return (
    <ErrorBoundary>
      <HorizontalLoader loading={loading} />
      <br />
      <div className={classes.root}>
        <CustomMaterialTable
          title="Faults"
          userPreferencePaginationKey={'faults'}
          columns={faultColumns}
          data={faultData}
          isLoading={loading}
          onRowClick={(event, rowData) => {
            event.preventDefault();
          }}
          options={{
            search: true,
            exportButton: true,
            searchFieldAlignment: 'left',
            showTitle: false,
            searchFieldStyle: {
              fontFamily: 'Open Sans'
            },
            headerStyle: {
              fontFamily: 'Open Sans',
              fontSize: 16,
              fontWeight: 600
            }
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ManagementFaults;
