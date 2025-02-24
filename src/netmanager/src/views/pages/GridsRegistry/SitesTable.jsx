import React from 'react';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useHistory } from 'react-router-dom';

const GridSitesTable = ({ sites }) => {
  const history = useHistory();

  return (
    <CustomMaterialTable
      title="Grid Sites details"
      userPreferencePaginationKey={'gridSites'}
      columns={[
        {
          title: 'Site Name',
          field: 'name'
        },
        {
          title: 'Site ID',
          field: 'generated_name'
        },
        {
          title: 'Parish',
          field: 'parish'
        },
        {
          title: 'Sub county',
          field: 'sub_county'
        },
        {
          title: 'City',
          field: 'city'
        },
        {
          title: 'District',
          field: 'district'
        },
        {
          title: 'Region',
          field: 'region'
        },
        {
          title: 'Country',
          field: 'country'
        }
      ]}
      data={sites || []}
      onRowClick={(event, rowData) => {
        event.preventDefault();
        return history.push(`/sites/${rowData._id}/`);
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

export default GridSitesTable;
