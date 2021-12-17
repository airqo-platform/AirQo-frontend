import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

// css styles
import "assets/css/d3/chart-container.scss";

const ChartContainer = ({ title, children, action, open, onClick, id }) => {
  const anchorEl = useRef();
  return (
    <div className="panel panel-default" id={id}>
      <div className="panel-heading">
        <div className="panel-title">
          {title || "Chart Area"}
          <ul className="rad-panel-action" ref={anchorEl}>
            <FontAwesomeIcon
              icon={faCog}
              onClick={onClick}
              style={{ cursor: "pointer" }}
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
