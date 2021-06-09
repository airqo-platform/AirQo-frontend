import React from "react";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import AccessTime from "@material-ui/icons/AccessTime";

// css
import "assets/css/chart-container.css";

const ChartContainer = ({ className, title, lastUpdated, children }) => {
  return (
    <div className={className || "chart-container-wrapper"}>
      <div className={"chart-title-wrapper"}>
        <span className={"chart-title"}>{title}</span>
        <span className={"chart-control"}>
          <FullscreenIcon />
        </span>
      </div>
      <div className={"chart-body"}>{children}</div>
      {lastUpdated && (
        <div className={"chart-footer"}>
          <AccessTime /> Last updated {lastUpdated}
        </div>
      )}
    </div>
  );
};

export default ChartContainer;
