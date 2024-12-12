import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Paper, TextField, Box, Tabs, Tab, Typography } from '@material-ui/core';
import { ArrowBackIosRounded } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import { ErrorBoundary } from '../../ErrorBoundary';
import { LargeCircularLoader } from '../../components/Loader/CircularLoader';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const GroupDetails = () => {
  const history = useHistory();
  const { groupId } = useParams();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    devices: [],
    sites: [],
    users: []
  });

  useEffect(() => {
    // TODO: Load group details
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGroupData({
        name: 'Test Group',
        description: 'Test Description',
        devices: [],
        sites: [],
        users: []
      });
    }, 1000);
  }, [groupId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

          <TextField
            label="Group Name"
            variant="outlined"
            fullWidth
            value={groupData.name}
            style={{ marginBottom: '20px' }}
          />

          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            value={groupData.description}
            style={{ marginBottom: '20px' }}
          />

          <Tabs value={tabValue} onChange={handleTabChange} aria-label="group tabs">
            <Tab label="Users" />
            <Tab label="Devices" />
            <Tab label="Sites" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {/* Users Table */}
            <CustomMaterialTable
              title="Users"
              columns={[
                { title: 'Name', field: 'name' },
                { title: 'Email', field: 'email' },
                {
                  title: 'Actions',
                  render: (rowData) => <DeleteIcon style={{ cursor: 'pointer', color: 'grey' }} />
                }
              ]}
              data={groupData.users}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Devices Table */}
            <CustomMaterialTable
              title="Devices"
              columns={[
                { title: 'Name', field: 'name' },
                { title: 'Status', field: 'status' },
                {
                  title: 'Actions',
                  render: (rowData) => <DeleteIcon style={{ cursor: 'pointer', color: 'grey' }} />
                }
              ]}
              data={groupData.devices}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Sites Table */}
            <CustomMaterialTable
              title="Sites"
              columns={[
                { title: 'Name', field: 'name' },
                { title: 'Location', field: 'location' },
                {
                  title: 'Actions',
                  render: (rowData) => <DeleteIcon style={{ cursor: 'pointer', color: 'grey' }} />
                }
              ]}
              data={groupData.sites}
            />
          </TabPanel>
        </Paper>
      </div>
    </ErrorBoundary>
  );
};

export default GroupDetails;
