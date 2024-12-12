import React, { useEffect } from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { Box, Button, Typography, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { LargeCircularLoader } from '../../components/Loader/CircularLoader';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { useHistory } from 'react-router-dom';
import { fetchGroupsSummary } from 'redux/AccessControl/operations';

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
  const dispatch = useDispatch();
  const { summary: groups, loading } = useSelector((state) => state.accessControl.groups);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!activeNetwork) return;
    dispatch(fetchGroupsSummary());
  }, [dispatch, activeNetwork]);

  // Add safety check for groups data
  const safeGroups = Array.isArray(groups) ? groups : [];

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
          ) : safeGroups.length > 0 ? (
            <CustomMaterialTable
              title="Groups"
              columns={[
                {
                  title: 'Name',
                  field: 'grp_title',
                  render: (rowData) => (
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => history.push(`/groups/${rowData?._id}`)}
                    >
                      {rowData?.grp_title || 'N/A'}
                    </Button>
                  )
                },
                {
                  title: 'Website',
                  field: 'grp_website',
                  render: (rowData) =>
                    rowData?.grp_website ? (
                      <a
                        href={rowData.grp_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3f51b5', textDecoration: 'none' }}
                      >
                        {rowData.grp_website}
                      </a>
                    ) : (
                      'N/A'
                    )
                },
                {
                  title: 'Status',
                  field: 'grp_status',
                  render: (rowData) => (
                    <span
                      style={{
                        color: rowData?.grp_status === 'ACTIVE' ? 'green' : 'red',
                        textTransform: 'capitalize'
                      }}
                    >
                      {(rowData?.grp_status || 'N/A').toLowerCase()}
                    </span>
                  )
                },
                {
                  title: 'Users',
                  field: 'numberOfGroupUsers',
                  render: (rowData) => rowData?.numberOfGroupUsers || 0
                }
              ]}
              data={safeGroups}
              options={{
                search: true,
                exportButton: true,
                searchFieldAlignment: 'right',
                showTitle: true,
                emptyRowsWhenPaging: false,
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
