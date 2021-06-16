import React, { Component } from "react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import EditIcon from "@material-ui/icons/Edit";
import { TextField } from "@material-ui/core";
import RichTooltip from "views/containers/RichToolTip";
import ChartContainer from "./ChartContainer";

class ApexChart extends Component {
  constructor(props) {
    super(props);
    this.onChartTypeChange = this.onChartTypeChange.bind(this);
    this.state = {
      chartType: this.props.type,
      options: this.props.options,
      series: this.props.series,
      open: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState(this.props);
    }
  }

  onChartTypeChange(e) {
    e.preventDefault();
    const { value } = e.target;
    this.setState({ ...this.state, open: false, chartType: value });
  }

  render() {
    return (
      <ChartContainer
        className={this.props.className}
        title={this.props.title}
        lastUpdated={this.props.lastUpdated}
        blue={this.props.blue}
        green={this.props.green}
        centerItems={this.props.centerItems}
        controller={
          !this.props.disableController && (
            <RichTooltip
              content={
                <div style={{ width: "200px" }}>
                  <TextField
                    id="chartType"
                    select
                    fullWidth
                    label="Chart Type"
                    style={{ marginTop: "15px" }}
                    value={this.state.chartType}
                    onChange={this.onChartTypeChange}
                    SelectProps={{
                      native: true,
                      style: { width: "100%", height: "40px" },
                    }}
                    variant="outlined"
                  >
                    <option value={"area"}>Area</option>
                    <option value={"line"}>Line</option>
                    <option value={"bar"}>Bar</option>
                  </TextField>
                  <TextField
                    id="range"
                    select
                    fullWidth
                    disabled
                    label="Range"
                    style={{ marginTop: "15px" }}
                    value={1}
                    onChange={() => {}}
                    SelectProps={{
                      native: true,
                      style: { width: "100%", height: "40px" },
                    }}
                    variant="outlined"
                  >
                    <option value={"all"}>All</option>
                    <option value={"lastDay"}>Last day</option>
                    <option value={"lastWeek"}>Last week</option>
                  </TextField>
                </div>
              }
              open={this.state.open}
              onClose={() => this.setState({ ...this.state, open: false })}
              placement="bottom-end"
            >
              <EditIcon
                onClick={() =>
                  this.setState({ ...this.state, open: !this.state.open })
                }
              />
            </RichTooltip>
          )
        }
        footerContent={this.props.footerContent}
      >
        <Chart
          key={this.state.chartType}
          options={this.state.options}
          series={this.state.series}
          type={this.state.chartType}
          width="100%"
          height="100%"
        />
      </ChartContainer>
    );
  }
}

ApexChart.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  series: PropTypes.array.isRequired,
  lastUpdated: PropTypes.any,
  blue: PropTypes.bool,
  green: PropTypes.bool,
  centerItems: PropTypes.bool,
  footerContent: PropTypes.any,
  disableController: PropTypes.bool,
};

export default ApexChart;
