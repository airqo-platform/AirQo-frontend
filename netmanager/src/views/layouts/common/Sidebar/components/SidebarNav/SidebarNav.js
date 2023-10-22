/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { forwardRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { List, ListItem, Button, MenuItem, colors } from '@material-ui/core';
import NestedMenuItem from 'material-ui-nested-menu-item';
import Switch from 'views/components/Switch';
import { useUserPreferenceData } from 'redux/UserPreference/selectors';
import { updateUserPreferenceData } from 'redux/UserPreference/operators';
import { isEmpty } from 'underscore';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  nested: {
    paddingLeft: theme.spacing(4)
  },
  item: {
    display: 'flex',
    paddingTop: 0,
    paddingBottom: 0
  },
  button: {
    color: colors.blueGrey[800],
    padding: '10px 8px',
    justifyContent: 'flex-start',
    textTransform: 'none',
    letterSpacing: 0,
    width: '100%',
    fontWeight: theme.typography.fontWeightMedium
  },
  buttonActive: {
    color: theme.palette.primary.main,
    padding: '10px 8px',
    justifyContent: 'flex-start',
    textTransform: 'none',
    letterSpacing: 0,
    width: '100%',
    fontWeight: theme.typography.fontWeightMedium,
    '& $icon': {
      color: theme.palette.primary.main
    }
  },
  nestButton: {
    color: colors.blueGrey[800],
    padding: '0px',
    justifyContent: 'flex-start',
    textTransform: 'none',
    letterSpacing: 0,
    width: '100%',
    fontWeight: theme.typography.fontWeightRegular
  },
  buttonPushed: {
    color: colors.blueGrey[800],
    padding: '10px 8px',
    justifyContent: 'flex-start',
    textTransform: 'none',
    letterSpacing: 0,
    width: '100%',
    fontWeight: theme.typography.fontWeightMedium,
    marginTop: '10px'
  },
  icon: {
    color: theme.palette.icon,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1)
  },
  active: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    '& $icon': {
      color: theme.palette.primary.main
    }
  },
  disabledItem: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  newLabel: {
    marginLeft: 'auto',
    color: theme.palette.white,
    backgroundColor: theme.palette.secondary.light,
    borderRadius: '2px',
    padding: '2px 4px',
    fontSize: '0.6rem',
    fontWeight: '500',
    animation: '$flash 1s infinite'
  },
  '@keyframes flash': {
    '0%': { backgroundColor: theme.palette.secondary.light },
    '50%': { backgroundColor: theme.palette.secondary.dark },
    '100%': { backgroundColor: theme.palette.secondary.light }
  },
  align: {
    display: 'flex',
    alignItems: 'center'
  }
}));

const CustomRouterLink = forwardRef((props, ref) => (
  <div ref={ref} style={{ flexGrow: 1 }}>
    <RouterLink {...props} />
  </div>
));

export const SidebarWidgets = ({ className, ...rest }) => {
  const classes = useStyles();
  const preferenceKey = 'feedbackBtn';
  const userPreferenceData = useUserPreferenceData();
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(
    userPreferenceData[preferenceKey] && userPreferenceData[preferenceKey].value
  );
  const onCheckedChange = () => {
    setChecked(!checked);
    dispatch(updateUserPreferenceData(preferenceKey, { value: !checked }));
  };
  return (
    <List {...rest} className={clsx(classes.root, className)}>
      <ListItem className={classes.align} disableGutters>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button className={classes.buttonPushed} onClick={onCheckedChange}>
            Feedback button
          </Button>
          <Switch checked={checked} onChange={onCheckedChange} />
        </div>
      </ListItem>
    </List>
  );
};

const NestedMenuItemComponent = ({ page }) => {
  const classes = useStyles();
  const location = useLocation();

  const [isNewClicked, setIsNewClicked] = useState(
    localStorage.getItem(`isNewClicked-${page.title}`) === 'true'
  );

  useEffect(() => {
    setIsNewClicked(localStorage.getItem(`isNewClicked-${page.title}`) === 'true');
  }, [page.title]);

  const handleClick = () => {
    if (page.isNew) {
      localStorage.setItem(`isNewClicked-${page.title}`, 'true');
      setIsNewClicked(true);
    }
  };

  return (
    <NestedMenuItem
      label={
        <Button
          className={
            (location.pathname.includes(page.href) && classes.buttonActive) || classes.button
          }>
          <div className={classes.icon}>{page.icon}</div>
          {page.title}
          {page.isNew && !isNewClicked && (
            <div className={classes.newLabel}>
              <span>New</span>
            </div>
          )}
        </Button>
      }
      parentMenuOpen={true}
      style={{ padding: '0px' }}>
      {page.nestItems.map((nestPage, key) => (
        <MenuItem key={key}>
          <Button
            onClick={handleClick}
            activeClassName={classes.active}
            className={classes.nestButton}
            component={CustomRouterLink}
            to={nestPage.href}
            key={key}>
            {nestPage.title}
          </Button>
        </MenuItem>
      ))}
    </NestedMenuItem>
  );
};

const SidebarNavItem = ({ page }) => {
  const classes = useStyles();

  const [isNewClicked, setIsNewClicked] = useState(
    localStorage.getItem(`isNewClicked-${page.title}`) === 'true'
  );

  useEffect(() => {
    setIsNewClicked(localStorage.getItem(`isNewClicked-${page.title}`) === 'true');
  }, [page.title]);

  const handleClick = () => {
    if (page.isNew) {
      localStorage.setItem(`isNewClicked-${page.title}`, 'true');
      setIsNewClicked(true);
    }
  };

  return (
    <ListItem
      className={`${classes.item} ${page.disabled ? classes.disabledItem : ''}`}
      disableGutters
      key={page.title}
      disabled={page.disabled}>
      <Button
        disabled={page.disabled}
        activeClassName={classes.active}
        className={classes.button}
        component={CustomRouterLink}
        to={page.href}
        onClick={handleClick}>
        <div className={classes.icon}>{page.icon}</div>
        <div style={{ marginRight: page.isNew && !isNewClicked ? '2px' : '0px' }}>{page.title}</div>
        {page.isNew && !isNewClicked && (
          <div className={classes.newLabel}>
            <span>New</span>
          </div>
        )}
      </Button>
    </ListItem>
  );
};

const SidebarNav = (props) => {
  const classes = useStyles();
  const { pages, className, ...rest } = props;
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  return (
    <List {...rest} className={clsx(classes.root, className)}>
      {pages &&
        pages.map((page) => {
          if (page.nested) {
            if (
              !isEmpty(activeNetwork) &&
              activeNetwork.net_name !== 'airqo' &&
              page.title === 'Network Monitoring'
            ) {
              return null;
            } else {
              return <NestedMenuItemComponent page={page} />;
            }
          }

          if (
            !isEmpty(activeNetwork) &&
            activeNetwork.net_name !== 'airqo' &&
            (page.title === 'Logs' || page.title === 'AirQloud Registry')
          ) {
            return null;
          } else {
            return <SidebarNavItem page={page} />;
          }
        })}
    </List>
  );
};

SidebarNav.propTypes = {
  className: PropTypes.string,
  pages: PropTypes.array.isRequired
};

export default SidebarNav;
