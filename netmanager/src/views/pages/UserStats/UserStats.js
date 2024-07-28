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
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const UserStats = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    },
    buttonGroup: {
      '& .MuiButton-root': {
        color: theme.palette.primary.main,
        backgroundColor: 'transparent',
        '&.selected': {
          color: theme.palette.common.white,
          backgroundColor: theme.palette.primary.main
        }
      },
      margin: theme.spacing(1, 0),
      [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(1, 0)
      }
    },
    boxContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center'
    }
  }));

  const classes = useStyles();

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

    doc.setFontSize(18);
    doc.text(tableTitle, 14, 15);

    doc.setFontSize(14);
    doc.text(`Total: ${tableRows.length}`, 14, 22);

    setButtonLabel('Preparing...');

    autoTable(doc, {
      startY: 25,
      head: [tableColumn],
      body: tableRows
    });

    setButtonLabel('Exporting...');

    setTimeout(() => {
      doc.save(`AirQo_${selectedUserType}.pdf`);
      setButtonLabel('Exported');

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
          <Box className={classes.boxContainer}>
            <Tooltip title="Your Exporting the selected table data." placement="right">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleExport(selectedUserStats)}>
                {buttonLabel}
              </Button>
            </Tooltip>

            <ButtonGroup
              className={classes.buttonGroup}
              variant="outlined"
              color="primary"
              aria-label="outlined primary button group">
              <Button
                onClick={() => handleUserTypeChange('users')}
                className={selectedUserType === 'users' ? 'selected' : ''}>
                All Users
              </Button>
              <Button
                onClick={() => handleUserTypeChange('active_users')}
                className={selectedUserType === 'active_users' ? 'selected' : ''}>
                Active Users
              </Button>
              <Button
                onClick={() => handleUserTypeChange('api_users')}
                className={selectedUserType === 'api_users' ? 'selected' : ''}>
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
