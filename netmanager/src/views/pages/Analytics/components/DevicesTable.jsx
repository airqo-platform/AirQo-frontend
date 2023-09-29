import React, { useEffect, useState } from 'react';
import CustomMaterialTable from '../../../components/Table/CustomMaterialTable';
import { useHistory } from 'react-router-dom';
import { updateDeviceDetails } from 'redux/DeviceOverview/OverviewSlice';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'validate.js';

const CohortDevicesTable = ({ devices, loading }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [devicesData, setDevicesData] = useState([]);

  useEffect(() => {
    if (!isEmpty(devices)) {
      let deviceList = [];
      devices.map((device) => {
        deviceList.push({
          name: device.name,
          description: device.description,
          site: device.site,
          status: device.status,
          createdAt: device.createdAt
        });
      });
      setDevicesData(devices);
    }
  }, [devices]);

  return (
    <CustomMaterialTable
      title="Cohort devices details"
      userPreferencePaginationKey={'cohortDevices'}
      loading={loading}
      columns={[
        {
          title: 'Device Name',
          field: 'name'
        },
        {
          title: 'Description',
          field: 'description'
        },
        {
          title: 'Site',
          field: 'site',
          render: (rowData) => {
            return rowData.site ? rowData.site.name : 'N/A';
          }
        },
        {
          title: 'Deployment status',
          field: 'status',
          render: (rowData) => (
            <span
              style={{
                color: rowData.status === 'deployed' ? 'green' : 'red',
                textTransform: 'capitalize'
              }}
            >
              {rowData.status}
            </span>
          )
        },
        {
          title: 'Date created',
          field: 'createdAt'
        }
      ]}
      data={devicesData}
      onRowClick={(event, rowData) => {
        event.preventDefault();
        dispatch(updateDeviceDetails(rowData));
        return history.push(`/device/${rowData.name}/overview`);
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
  );
};

export default CohortDevicesTable;
