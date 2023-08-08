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
import { formatDateString } from 'utils/dateTime';
import { maintainPostData, recallPostData, deployPostData } from 'views/apis/activities';
import { getUserDetails } from "redux/Join/actions";


// css
import 'assets/css/location-registry.css';

// horizontal loader
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';

const BLANK_SPACE_HOLDER = '-';
const renderCell = (field) => (rowData) => <span>{rowData[field] || BLANK_SPACE_HOLDER}</span>;

const ActivitiesTable = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const site_activities = useActivitiesSummaryData();
  const userDetails = getUserDetails();


  const handleActivity = async (rowData) => {
    const { activityType, device } = rowData;
  
    try {
      switch (activityType) {
        case 'maintenance':
          await maintainPostData(userDetails, device);
          console.log('Maintenance successful');
          break;
        case 'recallment':
          await recallPostData(userDetails, device);
          console.log('Recall successful');
          break;
        default:
          await deployPostData(userDetails, device);
          console.log('Deployment successful');
          break;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

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

  return (
    <>
      {/* custome Horizontal loader indicator */}
      <HorizontalLoader loading={loading} />
      <LoadingOverlay active={isLoading} spinner text="Loading Locations...">
        <CustomMaterialTable
          pointerCursor
          userPreferencePaginationKey={'site_activities'}
          title="Site Activities"
          onRowClick={(event, rowData) => handleActivity(rowData)}
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
            }
          ]}
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
    </>
  );
};

export default ActivitiesTable;
