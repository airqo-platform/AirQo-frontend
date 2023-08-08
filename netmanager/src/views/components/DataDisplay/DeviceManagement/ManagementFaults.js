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
    }
  },
  {
    title: 'Fault',
    field: 'Fault',
    render: (rowData) => {
      return rowData ? rowData.missing_data_fault : '';
    }
  },
  {
    title: 'Date',
    field: 'Date',
    render: (rowData) => {
      return rowData ? rowData.created_at : '';
    }
  },
  {
    title: 'Action',
    field: 'Action',
    cellStyle: { fontFamily: 'Open Sans', width: '20%' }
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
      setLoading(false);
    };
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
          data={faults}
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
