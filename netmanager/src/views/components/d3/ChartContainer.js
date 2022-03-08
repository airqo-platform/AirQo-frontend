import React, { useRef } from "react";
import SettingsIcon from "@material-ui/icons/Settings";

// css styles
import "assets/css/d3/chart-container.scss";

const ChartContainer = ({ title, children, action, open, onClick }) => {
  const anchorEl = useRef();
  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <div className="panel-title">
          {title || "Chart Area"}
          <ul className="rad-panel-action" ref={anchorEl}>
            <SettingsIcon
              onClick={onClick}
              style={{ fontSize: "15", cursor: "pointer" }}
            />
            {action(open, anchorEl.current)}
          </ul>
        </div>
      </div>
      <div className="panel-body">
        <div id="areaChart" className="rad-chart">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;
