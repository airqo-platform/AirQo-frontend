import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
// import MoneyIcon from '@material-ui/icons/Money';
import SentimentSatisfiedSharpIcon from '@material-ui/icons/SentimentSatisfiedSharp';

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
    backgroundColor: theme.palette.error.main,
    height: 32,
    width: 32
  },
  icon: {
    height: 30,
    width: 30
  },
  difference: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  differenceIcon: {
    color: theme.palette.error.dark
  },
  differenceValue: {
    color: theme.palette.error.dark,
    marginRight: theme.spacing(1)
  },
}));

const Pm25Levels = props => {
  const { className, pm25level, pm25levelText, background, pm25levelColor, ...rest } = props;

  const classes = useStyles();
  const pm25BgColor = {
    backgroundColor: background,
    padding: 10,
    height: 100,
  }
  const pm25_levelColor = {
    color: pm25levelColor,
    marginTop: 0,
  }

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent style = {pm25BgColor}>
        <Grid
          container
          justify="space-between"
        >
          <Grid item>
            {/* <Avatar className={classes.avatar}> */}
              <SentimentSatisfiedSharpIcon className={classes.icon} style={pm25_levelColor} />
            {/* </Avatar> */}
          </Grid>
        </Grid>
        <div className={classes.difference}>        
          <Typography
            className={classes.caption}
            variant="caption"
          >
            <p style={pm25_levelColor}> {pm25level} </p>
            <p style={pm25_levelColor}> {pm25levelText} </p>
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

Pm25Levels.propTypes = {
  className: PropTypes.string,
  pm25level: PropTypes.string,
  pm25levelText: PropTypes.string,
  background: PropTypes.string,
  Pm25levelColor: PropTypes.string
};

export default Pm25Levels;
