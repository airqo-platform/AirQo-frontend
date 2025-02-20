import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import { isEmpty } from 'underscore';

// styles
import 'assets/css/pollutant-category.css';

const useStyles = makeStyles((theme) => ({
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
    //backgroundColor: theme.palette.success.main,
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

const PollutantCategory = (props) => {
  const ref = useRef();
  const { className, pm25level, pm25levelCount, iconClass, sites, devices, ...rest } = props;
  const [show, setShow] = useState(false);

  const classes = useStyles();

  const toggleShow = () => {
    setShow(!show);
  };

  const compare = (a, b) => {
    if (a.pm2_5 < b.pm2_5) return 1;
    if (a.pm2_5 > b.pm2_5) return -1;
    return 0;
  };

  let sortedData = [];
  if (sites) {
    sortedData = sites.sort(compare);
  } else if (devices) {
    sortedData = devices.sort(compare);
  }

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (show && ref.current && !ref.current.contains(e.target)) setShow(false);
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [show]);

  return (
    <label className="pc-dropdown" ref={ref} onClick={toggleShow}>
      <Card {...rest} className={clsx(classes.root, className)} onClick={toggleShow}>
        <CardContent>
          <Grid container justify="space-between">
            <Grid item style={{ maxWidth: '50%' }}>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
                variant="body2"
              >
                {pm25level}
              </Typography>
              {/* <Typography variant="h3">{pm25levelCount}</Typography> */}
            </Grid>
            <Grid item>
              <Avatar className={classes.avatar + ' ' + iconClass}>
                {/* <PeopleIcon className={classes.icon} /> */}
                {sortedData.length}
              </Avatar>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <ul className={`pc-dd-menu ${(!show && 'dd-input') || ''}`}>
        {isEmpty(sortedData) && <li className="pc-empty">no data</li>}
        {(sortedData || []).map((data, key) => (
          <li key={key}>
            {data.label} -{' '}
            <span className={`pc-${pm25level.replace(' ', '-')}`}>
              {parseFloat(data.pm2_5).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </label>
  );
};

PollutantCategory.propTypes = {
  className: PropTypes.string
};

export default PollutantCategory;
