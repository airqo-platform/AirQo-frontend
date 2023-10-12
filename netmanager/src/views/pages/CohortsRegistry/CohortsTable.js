import React, { useEffect, useState } from 'react';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useHistory } from 'react-router-dom';
import { updateDeviceDetails } from 'redux/DeviceOverview/OverviewSlice';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'validate.js';

const CohortsTable = ({ cohortsList }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [devicesData, setDevicesData] = useState([]);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    if (!isEmpty(cohortsList)) {
      let cohorts = [];
      cohortsList.map((cohort) => {
        cohorts.push({
          _id: cohort._id,
          name: cohort.name,
          numberOfDevices: cohort.numberOfDevices,
          createdAt: cohort.createdAt,
          visibility: cohort.visibility
        });
      });
      setDevicesData(cohorts);
    }
  }, [cohortsList]);

  return (
    <CustomMaterialTable
      title={`Cohorts registry > ${activeNetwork.net_name}`}
      userPreferencePaginationKey={'cohortDevices'}
      columns={[
        {
          title: 'Cohort Name',
          field: 'name'
        },
        {
          title: 'Number of devices',
          field: 'numberOfDevices'
        },
        {
          title: 'Visibility',
          field: 'visibility'
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
        return history.push(`/cohorts/${rowData._id}`);
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
          fontSize: 16,
          fontWeight: 600
        }
      }}
    />
  );
};

export default CohortsTable;
