import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  },
  content: {
    textAlign: 'center'
  },
  image: {
    marginTop: 50,
    display: 'inline-block',
    maxWidth: '100%',
    width: 500
  },
  subTitle: {
    color: 'white'
  },
  button: {
    marginTop: 20,
    textTransform: 'none',
    padding: 10
  },
  errorCode: {
    marginTop: 8,
    color: 'grey'
  },
  subText: {
    color: 'rgb(20, 93, 255)'
  }
}));

const PermissionDenied = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container justify="center" spacing={4}>
        <Grid item lg={6} xs={12}>
          <div className={classes.content}>
            <img alt="Access denied" className={classes.image} src="/images/AccessDenied.svg" />

            <Typography variant="h2">
              <span className={classes.subText}>Oops!</span> You don't have access rights to this
              page.
            </Typography>
            <Typography variant="subtitle2">
              Reach out to your administrator if you think this is a mistake.
            </Typography>
            <Button variant="contained" color="primary" className={classes.button}>
              <Link to="/dashboard" className={classes.subTitle}>
                Back to dashboard
              </Link>
            </Button>
            <p className={classes.errorCode}>Error code: 403 forbidden access</p>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default PermissionDenied;
