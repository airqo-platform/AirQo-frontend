import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { AirQloudToolbar, AirQloudsTable } from './index';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';

// styles
import 'assets/css/location-registry.css';
import UsersListBreadCrumb from '../../pages/UserList/components/Breadcrumb';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
    //fontFamily: 'Open Sans'
  },
  title: {
    fontWeight: 700,
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Open Sans'
  }
}));

const AirQloudRegistry = () => {
  const classes = useStyles();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <AirQloudToolbar />
        <UsersListBreadCrumb
          category="AirQlouds Registry"
          usersTable={`${activeNetwork.net_name}`}
        />
        <div className={classes.content}>
          <AirQloudsTable />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AirQloudRegistry;
