import React, { useEffect, useState } from 'react';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'validate.js';

const GridsTable = ({ gridsList }) => {
  const history = useHistory();
  const [gridsData, setGridsData] = useState([]);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    if (!isEmpty(gridsList)) {
      let grids = [];
      gridsList.map((grid) => {
        grids.push({
          _id: grid._id,
          name: grid.name,
          numberOfSites: grid.numberOfSites,
          createdAt: grid.createdAt,
          visibility: grid.visibility,
          admin_level: grid.admin_level
        });
      });
      setGridsData(grids);
    }
  }, [gridsList]);

  return (
    <CustomMaterialTable
      title={`Grids registry > ${activeNetwork.net_name}`}
      userPreferencePaginationKey={'gridsDevices'}
      columns={[
        {
          title: 'Grid Name',
          field: 'name'
        },
        {
          title: 'Number of sites',
          field: 'numberOfSites'
        },
        {
          title: 'Admin level',
          field: 'admin_level'
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
      data={gridsData}
      onRowClick={(event, rowData) => {
        event.preventDefault();
        return history.push(`/grids/${rowData._id}`);
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

export default GridsTable;
