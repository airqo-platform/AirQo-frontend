import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { Box, Button, Typography, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { LargeCircularLoader } from '../../components/Loader/CircularLoader';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const GroupsManagement = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // TODO: Load groups data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Temporary mock data
      setGroups([
        {
          _id: '1',
          name: 'Test Group 1',
          description: 'Test Description',
          deviceCount: 5,
          siteCount: 2,
          userCount: 3
        }
      ]);
    }, 1000);
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Groups</Typography>
          <Button variant="contained" color="primary">
            Create Group
          </Button>
        </Box>

        <div className={classes.content}>
          {loading ? (
            <Box
              height={'60vh'}
              width={'100%'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <LargeCircularLoader loading={loading} />
            </Box>
          ) : groups && groups.length > 0 ? (
            <CustomMaterialTable
              title="Groups"
              columns={[
                {
                  title: 'Name',
                  field: 'name',
                  render: (rowData) => (
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => history.push(`/groups/${rowData._id}`)}
                    >
                      {rowData.name}
                    </Button>
                  )
                },
                { title: 'Description', field: 'description' },
                {
                  title: 'Devices',
                  field: 'deviceCount',
                  render: (rowData) => rowData.deviceCount || 0
                },
                {
                  title: 'Sites',
                  field: 'siteCount',
                  render: (rowData) => rowData.siteCount || 0
                },
                {
                  title: 'Users',
                  field: 'userCount',
                  render: (rowData) => rowData.userCount || 0
                }
              ]}
              data={groups}
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
          ) : (
            <Box
              height={'100px'}
              textAlign={'center'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Typography variant="body1" color="textSecondary">
                No groups found
              </Typography>
            </Box>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default GroupsManagement;
