import React from 'react';
import CustomMaterialTable from '../../../components/Table/CustomMaterialTable';
import { useHistory } from 'react-router-dom';
import { updateDeviceDetails } from 'redux/DeviceOverview/OverviewSlice';
import { useDispatch } from 'react-redux';

const CohortDevicesTable = ({ devices }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <CustomMaterialTable
      title="Cohort devices details"
      userPreferencePaginationKey={'cohortDevices'}
      columns={[
        {
          title: 'Device Name',
          field: 'name'
        },
        {
          title: 'Date created',
          field: 'createdAt'
        },
        {
          title: 'Deployment status',
          field: 'status'
        },
        {
          title: 'Added by',
          field: 'addedBy'
        }
      ]}
      data={devices || []}
      onRowClick={(event, rowData) => {
        event.preventDefault();
        dispatch(updateDeviceDetails(rowData));
        return history.push(`/device/${rowData.name}/overview`);
      }}
      options={{
        search: true,
        exportButton: true,
        searchFieldAlignment: 'right',
        showTitle: true,
        searchFieldStyle: {
          fontFamily: 'Open Sans'
        },
        headerStyle: {
          fontFamily: 'Open Sans',
          fontSize: 14,
          fontWeight: 600
        }
      }}
    />
  );
};

export default CohortDevicesTable;
