import React, { Component } from "react";
class Filter extends Component {
  state = {
    magnitudeFilter: "",
    isFilterOpen: false
  };
  handleMagnitudeChange = event => {
    this.setState({ magnitudeFilter: event.target.value });
  };
  toggleFilter = event => {
    this.setState(currentState => {
      return { isFilterOpen: !currentState.isFilterOpen };
    });
  };
  componentDidUpdate(prevProps, prevState) {
   if (this.state.magnitudeFilter !== prevState.magnitudeFilter) {
      this.props.fetchFilteredData(
        this.state.magnitudeFilter
      );
    }
  }
  render() {
    return (
      <>
        <div className="filter">
          <h2 className="filter__h2" onClick={this.toggleFilter}>
            Filters
          </h2>
          <i className="arrow down" onClick={this.toggleFilter}></i>
          {this.state.isFilterOpen === false ? null : (
            <>
              <form>
                <h3 className="filter__h3">Air Quality Levels</h3>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='All'
                    checked={this.state.magnitudeFilter === 'All'}
                    onChange={this.handleMagnitudeChange}
                  />
                  All
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='Moderate'
                    checked={this.state.magnitudeFilter === 'Moderate' }
                    onChange={this.handleMagnitudeChange}
                  />
                  {"Moderate"}
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='UHFSG'
                    checked={this.state.magnitudeFilter === 'UHFSG' }
                    onChange={this.handleMagnitudeChange}
                  />
                  {"UHFSG"}
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='Unhealthy'
                    checked={this.state.magnitudeFilter === 'Unhealthy' }
                    onChange={this.handleMagnitudeChange}
                  />
                  {"Unhealthy"}
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='VeryUnhealthy'
                    checked={this.state.magnitudeFilter === 'VeryUnhealthy' }
                    onChange={this.handleMagnitudeChange}
                  />
                  {"VeryUnhealthy"}
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value={"Harzadous"}
                    checked={this.state.magnitudeFilter === 'Harzadous'}
                    onChange={this.handleMagnitudeChange}
                  />
                  {"Harzadous"}
                </label>
              </form>
            </>
          )}
        </div>
      </>
    );
  }
}
export default Filter;