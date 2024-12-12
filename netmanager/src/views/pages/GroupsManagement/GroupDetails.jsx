import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Paper, TextField, Box, Tabs, Tab, Typography, Grid } from '@material-ui/core';
import { ArrowBackIosRounded } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { ErrorBoundary } from '../../ErrorBoundary';
import { LargeCircularLoader } from '../../components/Loader/CircularLoader';
import { loadGroupDetails } from 'redux/AccessControl/operations';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const GroupDetails = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id: groupId } = useParams();
  const [tabValue, setTabValue] = useState(0);

  const { activeGroup, groupDevices, groupSites, groupUsers, groupCohorts, loading, error } =
    useSelector((state) => state.accessControl.groups);

  useEffect(() => {
    if (groupId && (!activeGroup || activeGroup._id !== groupId)) {
      dispatch(loadGroupDetails(groupId, activeGroup?.grp_name));
    }
  }, [dispatch, groupId, activeGroup]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Update the safety check for users data
  const safeGroupUsers = Array.isArray(groupUsers?.group_members) ? groupUsers.group_members : [];
  const safeGroupDevices = Array.isArray(groupDevices) ? groupDevices : [];
  const safeGroupSites = Array.isArray(groupSites) ? groupSites : [];
  const safeGroupCohorts = Array.isArray(groupCohorts) ? groupCohorts : [];

  if (loading) {
    return (
      <Box
        height={'60vh'}
        width={'100%'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <LargeCircularLoader loading={loading} />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ width: '96%', margin: '20px auto' }}>
        <Paper style={{ padding: '20px', maxWidth: '1500px', margin: '0 auto' }}>
          <Box display="flex" alignItems="center" mb={3}>
            <ArrowBackIosRounded
              style={{ color: '#3f51b5', cursor: 'pointer', marginRight: '10px' }}
              onClick={() => history.push('/groups')}
            />
            <Typography variant="h5">Group Details</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Group Name"
                variant="outlined"
                fullWidth
                value={activeGroup?.grp_title || ''}
                style={{ marginBottom: '20px' }}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Website"
                variant="outlined"
                fullWidth
                value={activeGroup?.grp_website || ''}
                style={{ marginBottom: '20px' }}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Status"
                variant="outlined"
                fullWidth
                value={activeGroup?.grp_status || ''}
                style={{ marginBottom: '20px' }}
                InputProps={{
                  readOnly: true,
                  style: {
                    color: activeGroup?.grp_status === 'ACTIVE' ? 'green' : 'red'
                  }
                }}
              />
            </Grid>
          </Grid>

          <Tabs value={tabValue} onChange={handleTabChange} aria-label="group tabs">
            <Tab label={`Users (${activeGroup?.numberOfGroupUsers || 0})`} />
            <Tab label={`Devices (${activeGroup?.numberOfGroupDevices || 0})`} />
            <Tab label={`Sites (${activeGroup?.numberOfGroupSites || 0})`} />
            <Tab label="Cohorts" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <CustomMaterialTable
              title="Users"
              columns={[
                {
                  title: 'Name',
                  render: (rowData) => `${rowData.firstName} ${rowData.lastName}`
                },
                { title: 'Email', field: 'email' },
                { title: 'Username', field: 'userName' },
                {
                  title: 'Role',
                  field: 'role_name',
                  render: (rowData) => (
                    <span style={{ textTransform: 'capitalize' }}>
                      {rowData.role_name?.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  )
                },
                {
                  title: 'Status',
                  field: 'isActive',
                  render: (rowData) => (
                    <span
                      style={{
                        color: rowData.isActive ? 'green' : 'red',
                        textTransform: 'capitalize'
                      }}
                    >
                      {rowData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )
                },
                {
                  title: 'Last Login',
                  field: 'lastLogin',
                  render: (rowData) => new Date(rowData.lastLogin).toLocaleDateString()
                },
                {
                  title: 'Actions',
                  render: (rowData) => <DeleteIcon style={{ cursor: 'pointer', color: 'grey' }} />
                }
              ]}
              data={safeGroupUsers}
              options={{
                search: true,
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
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CustomMaterialTable
              title="Devices"
              columns={[
                { title: 'Name', field: 'name' },
                { title: 'Description', field: 'description' },
                {
                  title: 'Status',
                  field: 'status',
                  render: (rowData) => (
                    <span
                      style={{
                        color: rowData?.status === 'active' ? 'green' : 'red',
                        textTransform: 'capitalize'
                      }}
                    >
                      {rowData?.status || 'N/A'}
                    </span>
                  )
                },
                {
                  title: 'Actions',
                  render: (rowData) => <DeleteIcon style={{ cursor: 'pointer', color: 'grey' }} />
                }
              ]}
              data={safeGroupDevices}
              options={{
                search: true,
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
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <CustomMaterialTable
              title="Sites"
              columns={[
                { title: 'Name', field: 'name' },
                { title: 'Description', field: 'description' },
                { title: 'Latitude', field: 'latitude' },
                { title: 'Longitude', field: 'longitude' },
                {
                  title: 'Actions',
                  render: (rowData) => <DeleteIcon style={{ cursor: 'pointer', color: 'grey' }} />
                }
              ]}
              data={safeGroupSites}
              options={{
                search: true,
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
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <CustomMaterialTable
              title="Cohorts"
              columns={[
                {
                  title: 'Name',
                  field: 'name',
                  render: (rowData) => (
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => history.push(`/cohorts/${rowData._id}`)}
                    >
                      {rowData.name}
                    </Button>
                  )
                },
                { title: 'Description', field: 'description' },
                {
                  title: 'Status',
                  field: 'status',
                  render: (rowData) => (
                    <span
                      style={{
                        color: rowData?.status === 'active' ? 'green' : 'red',
                        textTransform: 'capitalize'
                      }}
                    >
                      {rowData?.status || 'N/A'}
                    </span>
                  )
                },
                {
                  title: 'Actions',
                  render: (rowData) => <DeleteIcon style={{ cursor: 'pointer', color: 'grey' }} />
                }
              ]}
              data={safeGroupCohorts}
              options={{
                search: true,
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
          </TabPanel>
        </Paper>
      </div>
    </ErrorBoundary>
  );
};

export default GroupDetails;
