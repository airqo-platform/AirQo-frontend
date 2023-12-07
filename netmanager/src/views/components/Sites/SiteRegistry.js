import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { SiteToolbar, SitesTable } from './index';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';

// styles
import 'assets/css/location-registry.css';
import { withPermission } from '../../containers/PageAccess';
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

const SiteRegistry = () => {
  const classes = useStyles();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <SiteToolbar />
        <UsersListBreadCrumb category="Site Registry" usersTable={`${activeNetwork.net_name}`} />
        <div className={classes.content}>
          <SitesTable />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(SiteRegistry, 'CREATE_UPDATE_AND_DELETE_NETWORK_SITES');
