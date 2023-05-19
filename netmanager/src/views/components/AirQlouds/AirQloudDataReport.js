import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  }
}));

function AirQloudDataReport() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <Paper className={classes.root}>
      <h2>Report Title</h2>
      <p>This is the content of the report.</p>
    </Paper>
  );
}

export default AirQloudDataReport;
