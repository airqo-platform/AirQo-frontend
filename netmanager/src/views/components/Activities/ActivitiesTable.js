import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import LoadingOverlay from 'react-loading-overlay';
import { isEmpty } from 'underscore';
// import Tooltip from '@material-ui/core/Tooltip';
// import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Parser } from 'json2csv';
import { loadActivitiesData} from 'redux/ActivityLogs/operations';
import { useActivitiesSummaryData } from 'redux/ActivityLogs/selectors';
import CustomMaterialTable from '../Table/CustomMaterialTable';
// import ConfirmDialog from '../../containers/ConfirmDialog';
// import { deleteSiteApi } from 'views/apis/deviceRegistry';
// import { updateMainAlert } from 'redux/MainAlert/operations';
import { formatDateString } from 'utils/dateTime';

// css
import 'assets/css/location-registry.css';
// import { clearSiteDetails } from '../../../redux/SiteRegistry/operations';

// horizontal loader
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';

const BLANK_SPACE_HOLDER = '-';
const renderCell = (field) => (rowData) => <span>{rowData[field] || BLANK_SPACE_HOLDER}</span>;

const ActivitiesTable = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const site_activities = useActivitiesSummaryData();

  // for horizontal loader
  const [loading, setLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [delState, setDelState] = useState({ open: false, name: '', id: '' });
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    //code to retrieve all site_activities data
    if (isEmpty(site_activities)) {
      setIsLoading(true);
      if (!isEmpty(activeNetwork)) {
        dispatch(loadActivitiesData(activeNetwork.net_name));
      }
      setIsLoading(false);
    }
  }, []);

  // const handleDeleteSite = (e) => {
  //   setDelState({ open: false, device: '', id: '' });
  //   setLoading(true);
  //   deleteSiteApi(delState.id)
  //     .then((resData) => {
  //       const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
  //       if (!isEmpty(activeNetwork)) {
  //         dispatch(loadActivitiesData(activeNetwork.net_name));
  //       }
  //       dispatch(
  //         updateMainAlert({
  //           message: resData.message,
  //           show: true,
  //           severity: 'success'
  //         })
  //       );
  //     })
  //     .catch((error) => {
  //       dispatch(
  //         updateMainAlert({
  //           message:
  //             (error.response && error.response.data && error.response.data.message) ||
  //             'An error occurred',
  //           show: true,
  //           severity: 'error'
  //         })
  //       );
  //     })
  //     .finally(() => setLoading(false));
  // };

  return (
    <>
      {/* custome Horizontal loader indicator */}
      <HorizontalLoader loading={loading} />
      <LoadingOverlay active={isLoading} spinner text="Loading Locations...">
        <CustomMaterialTable
          pointerCursor
          userPreferencePaginationKey={'site_activities'}
          title="Site Activities"
          columns={[
            {
              title: 'Device Name',
              field: 'device',
              render: renderCell('device')
            },
            {
              title: 'Tags',
              field: 'tags',
              render: renderCell('tags'),
              cellStyle: { fontFamily: 'Open Sans' }
            },
            {
              title: 'Description',
              field: 'description',
              render: renderCell('description'),
              cellStyle: { fontFamily: 'Open Sans' }
            },
            {
              title: 'Activity Type',
              field: 'activityType',
              render: renderCell('activityType'),
              cellStyle: { fontFamily: 'Open Sans' }
            },
            {
              title: 'Date',
              field: 'date',
              render: renderCell('date'),
              cellStyle: { fontFamily: 'Open Sans' }
            },
            // {
            //   title: 'Region',
            //   field: 'region',
            //   render: renderCell('region'),
            //   cellStyle: { fontFamily: 'Open Sans' }
            // },
            // {
            //   title: 'Actions',
            //   render: (rowData) => (
            //     <div>
            //       <Tooltip title="Delete">
            //         <DeleteIcon
            //           // className={"hover-red"}
            //           style={{
            //             margin: '0 5px',
            //             cursor: 'not-allowed',
            //             color: 'grey'
            //           }}
            //           disable deletion for now
            //           onClick={(event) => {
            //             event.stopPropagation();
            //             setDelState({
            //               open: true,
            //               name: rowData.name || rowData.description,
            //               id: rowData._id,
            //             });
            //           }}
            //         />
            //       </Tooltip>
            //     </div>
            //   )
            // }
          ]}
          // onRowClick={(event, data) => {
          //   event.preventDefault();
          //   clearSiteDetails();
          //   history.push(`/site_activities/${data._id}`);
          // }}
          data={site_activities}
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
            },
            exportCsv: (columns, data) => {
              const fields = [
                'device',
                'description',
                'date',
                'activityType',
                'site_id',
                'nextMaintenance',
                'createdAt',
                'updatedAt',
                'tags'
              ];
              const json2csvParser = new Parser({ fields });
              const csv = json2csvParser.parse(data);
              let filename = `site-activities.csv`;
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
      </LoadingOverlay>
      {/* <ConfirmDialog
        open={delState.open}
        title={'Delete a site Activity?'}
        message={`Are you sure you want to delete this ${delState.name} site`}
        close={() => setDelState({ open: false, name: '', id: '' })}
        confirm={handleDeleteSite}
        error
      /> */}
    </>
  );
};

export default ActivitiesTable;
