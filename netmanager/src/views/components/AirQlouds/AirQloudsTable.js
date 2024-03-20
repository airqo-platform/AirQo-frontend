import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import LoadingOverlay from 'react-loading-overlay';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Parser } from 'json2csv';
import CustomMaterialTable from '../Table/CustomMaterialTable';

// css
import 'assets/css/location-registry.css';
import { isEmpty } from 'underscore';
import { useDispatch } from 'react-redux';
import { fetchAirqloudsSummaryData } from 'redux/AirQloud/operations';
import { useAirqloudsSummaryData } from 'redux/AirQloud/selectors';

const BLANK_SPACE_HOLDER = '-';
const renderCell = (field) => (rowData) => <span>{rowData[field] || BLANK_SPACE_HOLDER}</span>;

const renderBooleanCell = (field) => (rowData) => (
  <span>
    {(rowData[field] && <span style={{ color: 'green' }}>Yes</span>) || (
      <span style={{ color: 'red' }}>No</span>
    )}
  </span>
);

const AirQloudsTable = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const airqlouds = useAirqloudsSummaryData();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (isEmpty(airqlouds)) {
        await dispatch(fetchAirqloudsSummaryData());
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <CustomMaterialTable
        pointerCursor
        userPreferencePaginationKey={'airqlouds'}
        title={`AirQloud Registry for ${activeNetwork.net_name}`}
        columns={[
          {
            title: 'Name',
            field: 'long_name',
            render: renderCell('long_name')
          },
          {
            title: 'AirQloud ID',
            field: 'name',
            render: renderCell('name'),
            cellStyle: { fontFamily: 'Open Sans' }
          },
          {
            title: 'Admin Level',
            field: 'admin_level',
            render: renderCell('admin_level'),
            cellStyle: { fontFamily: 'Open Sans' }
          },
          {
            title: 'Is Custom',
            field: 'isCustom',
            render: renderBooleanCell('isCustom'),
            cellStyle: { fontFamily: 'Open Sans' }
          },
          {
            title: 'Site Count',
            field: 'district',
            render: renderCell('numberOfSites'),
            cellStyle: { fontFamily: 'Open Sans' }
          },
          {
            title: 'Actions',
            render: (rowData) => (
              <div>
                <Tooltip title="Delete">
                  <DeleteIcon
                    // className={"hover-red"}
                    style={{
                      margin: '0 5px',
                      cursor: 'not-allowed',
                      color: 'grey'
                    }}
                    // disable deletion for now
                    // onClick={(event) => {
                    //   event.stopPropagation();
                    //   setDelState({
                    //     open: true,
                    //     name: rowData.name || rowData.description,
                    //     id: rowData._id,
                    //   });
                    // }}
                  />
                </Tooltip>
              </div>
            )
          }
        ]}
        onRowClick={(event, data) => {
          event.preventDefault();
          history.push(`/airqlouds/${data._id}`);
        }}
        isLoading={isLoading}
        data={airqlouds}
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
          },
          exportCsv: (columns, data) => {
            const fields = ['long_name', 'name', 'admin_level', 'isCustom'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);
            let filename = `airqloud-registry.csv`;
            const link = document.createElement('a');
            link.setAttribute(
              'href',
              'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv)
            );
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
      />
    </>
  );
};

export default AirQloudsTable;
