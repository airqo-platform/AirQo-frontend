/* eslint-disable */
import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import usersStateConnector from "views/stateConnectors/usersStateConnector";
import CandidatesTable from "./components/CandidatesTable";
import ErrorBoundary from "views/ErrorBoundary/ErrorBoundary";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  content: {
    marginTop: theme.spacing(2),
  },
}));

const CandidateList = (props) => {
  const classes = useStyles();

  const candidates = props.mappeduserState.candidates;

  useEffect(() => {
    props.fetchCandidates();
  }, []);

  return (
      <ErrorBoundary>
        <div className={classes.root}>
          <div className={classes.content}>
            <CandidatesTable candidates={candidates} />
          </div>
        </div>
      </ErrorBoundary>
  );
};

CandidateList.propTypes = {
  errors: PropTypes.object.isRequired,
};

export default usersStateConnector(CandidateList);
