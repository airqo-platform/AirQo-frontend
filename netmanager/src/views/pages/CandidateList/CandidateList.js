/* eslint-disable */
import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import usersStateConnector from "views/stateConnectors/usersStateConnector";
import CandidatesTable from "./components/CandidatesTable";

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
    <div className={classes.content}>
      <CandidatesTable candidates={candidates} />
    </div>
  );
};

CandidateList.propTypes = {
  errors: PropTypes.object.isRequired,
};

export default usersStateConnector(CandidateList);
