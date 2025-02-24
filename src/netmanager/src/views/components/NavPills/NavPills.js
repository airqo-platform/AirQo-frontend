import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import styles from "assets/jss/material-kit-react/components/navPillsStyle.js";

import "assets/css/overview.css";

const useStyles = makeStyles(styles);

export default function NavPills(props) {
  const [active, setActive] = React.useState(props.active);
  const handleChange = (event, active) => {
    setActive(active);
  };
  const handleChangeIndex = (index) => {
    setActive(index);
  };
  const classes = useStyles();
  const { tabs, direction, color, horizontal, alignCenter } = props;
  const flexContainerClasses = classNames({
    [classes.flexContainer]: true,
    [classes.horizontalDisplay]: horizontal !== undefined,
  });
  const tabButtons = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Tabs
        classes={{
          root: classes.root,
          fixed: classes.fixed,
          flexContainer: flexContainerClasses,
          indicator: classes.displayNone,
        }}
        value={active}
        onChange={handleChange}
        centered={alignCenter}
      >
        {tabs.map((prop, key) => {
          var icon = {};
          if (prop.tabIcon !== undefined) {
            icon["icon"] = <prop.tabIcon className={classes.tabIcon} />;
          }
          const pillsClasses = classNames({
            [classes.pills]: true,
            [classes.horizontalPills]: horizontal !== undefined,
            [classes.pillsWithIcons]: prop.tabIcon !== undefined,
          });
          return (
            <Tab
              label={prop.tabButton}
              key={key}
              {...icon}
              classes={{
                root: pillsClasses,
                selected: classes[color],
                wrapper: classes.tabWrapper,
              }}
            />
          );
        })}
      </Tabs>
    </div>
  );
  const tabButtonsMini = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Tabs
        classes={{
          root: classes.root,
          fixed: classes.fixed,
          flexContainer: flexContainerClasses,
          indicator: classes.displayNone,
        }}
        value={active}
        onChange={handleChange}
        centered={alignCenter}
      >
        {tabs.map((prop, key) => {
          var icon = {};
          if (prop.tabIcon !== undefined) {
            icon["icon"] = <prop.tabIcon className={classes.tabIcon} />;
          }
          const pillsClasses = classNames({
            [classes.pillsMini]: true,
            [classes.horizontalPills]: horizontal !== undefined,
            [classes.pillsWithIcons]: prop.tabIcon !== undefined,
          });
          return (
            <Tab
              key={key}
              {...icon}
              classes={{
                root: pillsClasses,
                selected: classes[color],
                wrapper: classes.tabWrapper,
              }}
            />
          );
        })}
      </Tabs>
    </div>
  );
  const tabContent = (
    <div className={classes.contentWrapper}>
      <SwipeableViews
        axis={direction === "rtl" ? "x-reverse" : "x"}
        index={active}
        onChangeIndex={handleChangeIndex}
      >
        {tabs.map((prop, key) => {
          return (
            <div className={classes.tabContent} key={key}>
              {prop.tabContent}
            </div>
          );
        })}
      </SwipeableViews>
    </div>
  );
  return (
    <div style={{ width: "80%", maxWidth: "1000px" }}>
      <div className={"nav-pill-tabs"}>{tabButtons}</div>
      <div className={"nav-pill-tabs-mini"}>{tabButtonsMini}</div>
      {tabContent}
    </div>
  );
}

NavPills.defaultProps = {
  active: 0,
  color: "primary",
};

NavPills.propTypes = {
  // index of the default active pill
  active: PropTypes.number,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabButton: PropTypes.string,
      tabIcon: PropTypes.object,
      tabContent: PropTypes.node,
    })
  ).isRequired,
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose",
  ]),
  direction: PropTypes.string,
  horizontal: PropTypes.shape({
    tabsGrid: PropTypes.object,
    contentGrid: PropTypes.object,
  }),
  alignCenter: PropTypes.bool,
};
