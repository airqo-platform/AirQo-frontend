import React from "react";
import AppBar from "@mui/material/AppBar";
import ArrowLongRightIcon from "../../icons/arrow_long_right";

const styles = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  background: "#3067e2",
  minHeight: "60px",
  color: "#ffffff",
};

const appBarWrapper = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoContainer = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-around",
  alignItems: "center",
  width: "200px",
  fontWeight: "bold",
  marginLeft: "5px",
  padding: "5px",
};

const logoStyle = {
  height: "3em",
  // width: "5em",
  width: "auto",
  borderRadius: "15%",
  paddingTop: ".2em",
  marginRight: ".4em",
};

const docsLinkWrapper = {
  display: "flex",
  alignItems: "center",
  color: "#ffffff",
  marginRight: "5px",
  padding: "5px",
  cursor: "pointer",
  textDecoration: "none",
};

const TopBar = () => {
  return (
    <AppBar style={styles}>
      <div style={appBarWrapper}>
        <div style={logoContainer}>
          <img
            alt="airqo.net"
            style={logoStyle}
            src="https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/airqo_logo.png"
          />
          <span style={{ fontSize: "20px" }}>AirQalibrate</span>
        </div>
        <a
          href={process.env.REACT_APP_CALIBRATION_GUIDE}
          target="_blank"
          rel="noreferrer"
          style={docsLinkWrapper}
        >
          Read<b style={{ marginLeft: "4px" }}>Calibration guide</b>
          <ArrowLongRightIcon />
        </a>
      </div>
    </AppBar>
  );
};

export default TopBar;
