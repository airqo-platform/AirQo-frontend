import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  avatar: {
    backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  difference: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  differenceIcon: {
    color: theme.palette.success.dark
  },
  differenceValue: {
    color: theme.palette.success.dark,
    marginRight: theme.spacing(1)
  }
}));

const Display = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
          <Grid item>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
              variant="body2"
            >
              Display Graph
            </Typography>
          </Grid>
        </Grid>
        { /* <div class="chart">
            <h3>Daily PM2.5 Concentration Levels for Lubaga</h3>
            <div class="chart-wrap vertical">
                <h2 class="title">Bar Chart HTML Example:  Using Only HTML And CSS</h2>
  
              <div class="grid">
                <div class="bar"  data-name="Jan" title="Jan Blog 85%"></div>
                <div class="bar"  data-name="Feb" title="Feb 23%"></div>
                <div class="bar"  data-name="Mar" title="Mar 7%"></div>
                <div class="bar"  data-name="Apr" title="Apr 38%"></div>
                <div class="bar"  data-name="May" title="May 35%"></div>
                <div class="bar"  data-name="June" title="June 30%"></div>
                <div class="bar"  data-name="July" title="July 5%"></div>
                <div class="bar"  data-name="Aug" title="Aug 20%"></div>    
              </div>
            </div>
  </div> */ }
      </CardContent>
    </Card>
  );
};

Display.propTypes = {
  className: PropTypes.string
};

export default Display;
