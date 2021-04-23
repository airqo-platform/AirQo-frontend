/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { forwardRef, useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink as RouterLink } from "react-router-dom";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { List, ListItem, Button, colors } from "@material-ui/core";
import Switch from "views/components/Switch";
import { useUserPreferenceData } from "redux/UserPreference/selectors";
import { updateUserPreferenceData } from "redux/UserPreference/operators";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  item: {
    display: "flex",
    paddingTop: 0,
    paddingBottom: 0,
  },
  button: {
    color: colors.blueGrey[800],
    padding: "10px 8px",
    justifyContent: "flex-start",
    textTransform: "none",
    letterSpacing: 0,
    width: "100%",
    fontWeight: theme.typography.fontWeightMedium,
  },
  buttonPushed: {
    color: colors.blueGrey[800],
    padding: "10px 8px",
    justifyContent: "flex-start",
    textTransform: "none",
    letterSpacing: 0,
    width: "100%",
    fontWeight: theme.typography.fontWeightMedium,
    marginTop: "10px",
  },
  icon: {
    color: theme.palette.icon,
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(1),
  },
  active: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    "& $icon": {
      color: theme.palette.primary.main,
    },
  },
}));

const CustomRouterLink = forwardRef((props, ref) => (
  <div ref={ref} style={{ flexGrow: 1 }}>
    <RouterLink {...props} />
  </div>
));

export const SidebarWidgets = ({ className, ...rest }) => {
  const classes = useStyles();
  const preferenceKey = "feedbackBtn";
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button className={classes.buttonPushed} onClick={onCheckedChange}>
            Feedback button
          </Button>
          <Switch checked={checked} onChange={onCheckedChange} />
        </div>
      </ListItem>
    </List>
  );
};

const SidebarNav = (props) => {
  const classes = useStyles();
  const { pages, className, ...rest } = props;

  return (
    <List {...rest} className={clsx(classes.root, className)}>
      {pages.map((page) => (
        <ListItem className={classes.item} disableGutters key={page.title}>
          <Button
            activeClassName={classes.active}
            className={classes.button}
            component={CustomRouterLink}
            to={page.href}
          >
            <div className={classes.icon}>{page.icon}</div>
            {page.title}
          </Button>
        </ListItem>
      ))}
    </List>
  );
};

SidebarNav.propTypes = {
  className: PropTypes.string,
  pages: PropTypes.array.isRequired,
};

export default SidebarNav;
