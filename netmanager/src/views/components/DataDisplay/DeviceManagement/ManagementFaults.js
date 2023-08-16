import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import CustomMaterialTable from '../../Table/CustomMaterialTable';
import { faultsPredictApi } from 'views/apis/predict';

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
    field: 'device_name',
    render: (rowData) => {
      return rowData ? rowData.device_name : '';
    },
    cellStyle: { width: '25%' },
    headerStyle: { textAlign: 'left' }
  },

  {
    title: 'Correlation Fault',
    field: 'correlation_fault',
    render: (rowData) => {
      return rowData ? rowData.correlation_fault : '';
    },
    cellStyle: { fontFamily: 'Open Sans', width: '25%', textAlign: 'center' },
    headerStyle: { textAlign: 'center' }
  },
  {
    title: 'Missing Data Fault',
    field: 'Missing_data_fault',
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

const ManagementFaults = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await faultsPredictApi();
      if (response) {
        setFaults(response);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <ErrorBoundary>
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
            exportButton: false,
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
