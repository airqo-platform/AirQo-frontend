import React, { useEffect, useState } from 'react';
import { getUserStatsApi } from 'views/apis/analytics';
import CustomMaterialTable from '../../components/Table/CustomMaterialTable';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  ButtonGroup,
  Tooltip
} from '@material-ui/core';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import { makeStyles } from '@material-ui/styles';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1)
    }
  },
  title: {
    margin: theme.spacing(2, 0)
  },
  category_btn_con: {
    display: 'flex',
    justifyContent: 'right',
    alignItems: 'center',
    margin: theme.spacing(2, 0)
  }
}));

const UserStats = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('users');

  useEffect(() => {
    setLoading(true);
    getUserStatsApi().then((res) => {
      setUserStats(res.users_stats);
      setLoading(false);
    });
  }, []);

  const allUsers = userStats.users ? userStats.users : { number: 0, details: [] };
  const activeUsers = userStats.active_users ? userStats.active_users : { number: 0, details: [] };
  const apiUsers = userStats.api_users ? userStats.api_users : { number: 0, details: [] };

  const handleUserTypeChange = (userType) => {
    setSelectedUserType(userType);
  };

  const selectedUserStats = userStats[selectedUserType] ? userStats[selectedUserType].details : [];

  const [buttonLabel, setButtonLabel] = useState('Export as PDF');

  const handleExport = async (data) => {
    setButtonLabel('Initializing...');
    const doc = new jsPDF();
    const tableColumn = ['User Email'];
    const tableTitle =
      selectedUserType === 'users'
        ? 'ALL USERS'
        : selectedUserType === 'active_users'
        ? 'ACTIVE USERS'
        : 'API USERS';

    // Prepare table rows from data
    const tableRows = data.map((record) => [record.email]);

    // Add title to PDF
    doc.setFontSize(18);
    doc.text(tableTitle, 14, 15); // Adjust the position as needed

    setButtonLabel('Preparing...');
    // Add table to PDF
    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows
    });

    setButtonLabel('Exporting...');
    // Wait for 2 seconds before saving the PDF
    setTimeout(() => {
      doc.save(`AirQo_${selectedUserType}.pdf`);
      setButtonLabel('Exported');

      // Reset the button label after 3 seconds
      setTimeout(() => {
        setButtonLabel('Export as PDF');
      }, 3000);
    }, 2000);
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        {/* Page title */}
        <div className={classes.title}>
          <Typography variant="h2" gutterBottom align="left">
            AirQo User Statistics
          </Typography>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="100%">
                  <Typography variant="h5" component="h2" align="left">
                    All Users
                  </Typography>
                  <Typography variant="h2" component="p" align="right">
                    {allUsers.number}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="100%">
                  <Typography variant="h5" component="h2" align="left">
                    Active Users
                  </Typography>
                  <Typography variant="h2" component="p" align="right">
                    {activeUsers.number}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="100%">
                  <Typography variant="h5" component="h2" align="left">
                    API Users
                  </Typography>
                  <Typography variant="h2" component="p" align="right">
                    {apiUsers.number}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <div className={classes.category_btn_con}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Tooltip title="Your Exporting the selected table data." placement="right">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleExport(selectedUserStats)}>
                {buttonLabel}
              </Button>
            </Tooltip>

            <ButtonGroup
              variant="contained"
              color="primary"
              aria-label="contained primary button group">
              <Button
                onClick={() => handleUserTypeChange('users')}
                color={selectedUserType === 'users' ? 'secondary' : 'primary'}>
                All Users
              </Button>
              <Button
                onClick={() => handleUserTypeChange('active_users')}
                color={selectedUserType === 'active_users' ? 'secondary' : 'primary'}>
                Active Users
              </Button>
              <Button
                onClick={() => handleUserTypeChange('api_users')}
                color={selectedUserType === 'api_users' ? 'secondary' : 'primary'}>
                API Users
              </Button>
            </ButtonGroup>
          </Box>
        </div>
        <CustomMaterialTable
          pointerCursor
          userPreferencePaginationKey={'user_stats'}
          title={
            selectedUserType === 'users'
              ? 'ALL USERS'
              : selectedUserType === 'active_users'
              ? 'ACTIVE USERS'
              : 'API USERS'
          }
          columns={[
            {
              field: 'email',
              title: 'User Email'
            }
          ]}
          onRowClick={(event, row) => {
            event.preventDefault();
            return null;
          }}
          isLoading={loading}
          data={selectedUserStats}
          options={{
            search: true,
            exportButton: false,
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
      </div>
    </ErrorBoundary>
  );
};

export default UserStats;
