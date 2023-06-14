import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4)
  },
  content: {
    paddingTop: 50,
    textAlign: 'center'
  },
  image: {
    marginBottom: 50,
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

const NotFound = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container justify="center" spacing={4}>
        <Grid item lg={6} xs={12}>
          <div className={classes.content}>
            <img alt="Page not found" className={classes.image} src="/images/Oops.svg" />

            <Typography variant="h2">
              <span className={classes.subText}>Oops!</span> We can't seem to find the page you're
              looking for.
            </Typography>
            <Button variant="contained" color="primary" className={classes.button}>
              <Link to="/dashboard" className={classes.subTitle}>
                Back to dashboard
              </Link>
            </Button>
            <p className={classes.errorCode}>Error code: 404 page not found</p>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default NotFound;
