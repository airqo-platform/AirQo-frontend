/* eslint-disable */
import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import CandidatesTable from './components/CandidatesTable';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { withPermission } from '../../containers/PageAccess';
import { isEmpty } from 'underscore';
import UsersListBreadCrumb from '../UserList/components/Breadcrumb';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const CandidateList = (props) => {
  const classes = useStyles();

  const candidates = props.mappeduserState.candidates;
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
    if (!isEmpty(activeNetwork)) {
      props.fetchCandidates(activeNetwork._id);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <UsersListBreadCrumb category="Candidates" usersTable={`${activeNetwork.net_name}`} />
        <div className={classes.content}>
          <CandidatesTable candidates={candidates} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

CandidateList.propTypes = {
  errors: PropTypes.object.isRequired
};

const usrsStateConnector = usersStateConnector(CandidateList);
export default withPermission(usrsStateConnector, 'APPROVE_AND_DECLINE_NETWORK_CANDIDATES');
