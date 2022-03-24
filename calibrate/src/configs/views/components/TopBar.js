import React from "react";
import AppBar from "@mui/material/AppBar";

const styles = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  background: "#3067e2",
  minHeight: "60px",
  color: "#ffffff",
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

const TopBar = () => {
  return (
    <AppBar style={styles}>
      <div style={logoContainer}>
        <img
          alt="airqo.net"
          style={logoStyle}
          src="https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/airqo_logo.png"
        />
        <span style={{ fontSize: "20px" }}>Calibrate</span>
      </div>
    </AppBar>
  );
};

export default TopBar;
