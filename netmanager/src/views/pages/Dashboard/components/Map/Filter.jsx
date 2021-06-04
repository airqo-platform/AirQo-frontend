import React, { useState } from "react";
import ReactTooltip from "react-tooltip";

const Scale = ({
  title,
  isFilterOpen,
  toggleFilter,
  good,
  moderate,
  UNFSG,
  unHealthy,
  veryUnHealthy,
  harzardous,
}) => {
  return (
    <div className="filter">
      <h2 className="filter__h2" onClick={toggleFilter}>
        {title}
      </h2>
      <a onClick={toggleFilter}> {isFilterOpen ? "x" : "+"}</a>
      {isFilterOpen && (
        <>
          <form style={{ margin: "10px 0" }}>
            <popup_a className="filter__h3"></popup_a>
            <label>
              <input type="radio" name="magnitude" value="Good" />
              <div
                className="control__indicator1"
                data-tip
                data-for="good"
                style={{ color: "#29323d" }}
              >
                {good}
              </div>
              <ReactTooltip id="good" place="right" effect="solid">
                <popup_a style={{ fontWeight: "normal" }}> Good</popup_a>
              </ReactTooltip>
            </label>
            <label>
              <input type="radio" name="magnitude" value="Moderate" />
              <div
                className="control__indicator2"
                data-tip
                data-for="moderate"
                style={{ color: "#29323d" }}
              >
                {moderate}
              </div>
              <ReactTooltip
                id="moderate"
                place="right"
                effect="solid"
                multiline="true"
              >
                <popup_a style={{ fontWeight: "normal" }}>Moderate</popup_a>
              </ReactTooltip>
            </label>
            <label>
              <input type="radio" name="magnitude" value="UHFSG" />
              <div
                className="control__indicator3"
                data-tip
                data-for="UHFSG"
                style={{ color: "#ffffff" }}
              >
                {UNFSG}
              </div>
              <ReactTooltip id="UHFSG" place="right" effect="solid">
                <popup_a style={{ fontWeight: "normal" }}>
                  {" "}
                  Unhealthy for sensitive groups
                </popup_a>
              </ReactTooltip>
            </label>
            <label>
              <input type="radio" name="magnitude" value="Unhealthy" />
              <div
                className="control__indicator4"
                data-tip
                data-for="unhealthy"
                style={{ color: "#ffffff" }}
              >
                {unHealthy}
              </div>
              <ReactTooltip id="unhealthy" place="right" effect="solid">
                <popup_a style={{ fontWeight: "normal" }}>Unhealthy</popup_a>
              </ReactTooltip>
            </label>
            <label>
              <input type="radio" name="magnitude" value="VeryUnhealthy" />
              <div
                className="control__indicator5"
                data-tip
                data-for="veryunhealthy"
              >
                {veryUnHealthy}
              </div>
              <ReactTooltip id="veryunhealthy" place="right" effect="solid">
                <popup_a style={{ fontWeight: "normal" }}>
                  Very Unhealthy
                </popup_a>
              </ReactTooltip>
            </label>
            <label>
              <input type="radio" name="magnitude" value={"Harzadous"} />
              <div
                className="control__indicator6"
                data-tip
                data-for="harzadous"
              >
                {harzardous}
              </div>
              <ReactTooltip id="harzadous" place="right" effect="solid">
                <popup_a style={{ fontWeight: "normal" }}>Harzadous</popup_a>
              </ReactTooltip>
            </label>
          </form>
        </>
      )}
    </div>
  );
};

const Filter = ({ pollutants }) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      {pollutants.pm2_5 && (
        <Scale
          title={
            <span>
              PM<sub>2.5</sub> AQI
            </span>
          }
          isFilterOpen={open}
          toggleFilter={() => setOpen(!open)}
          good={"0 - 12"}
          moderate={"12.1 - 35.4"}
          UNFSG={"35.5 - 55.4"}
          unHealthy={"55.5 - 150.4"}
          veryUnHealthy={"150.5 - 250.4"}
          harzardous={"250.5 - 500"}
        />
      )}
      {pollutants.pm10 && (
        <Scale
          title={
            <span>
              PM<sub>10</sub> AQI
            </span>
          }
          isFilterOpen={open}
          toggleFilter={() => setOpen(!open)}
          good={"0 - 54"}
          moderate={"54.1 - 154"}
          UNFSG={"154.1 - 254"}
          unHealthy={"254.1 - 354"}
          veryUnHealthy={"354.1 - 424"}
          harzardous={"424.1 - 604"}
        />
      )}
      {pollutants.no2 && (
        <Scale
          title={
            <span>
              NO<sub>2</sub> AQI
            </span>
          }
          isFilterOpen={open}
          toggleFilter={() => setOpen(!open)}
          good={"0 - 53"}
          moderate={"53.1 - 100"}
          UNFSG={"100.1 - 360"}
          unHealthy={"360.1 - 649"}
          veryUnHealthy={"649.1 - 1249"}
          harzardous={"1249.1 - 2049"}
        />
      )}
    </>
  );
};
export default Filter;
