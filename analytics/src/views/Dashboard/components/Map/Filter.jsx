import React, { Component } from "react";

class Filter extends Component {
  state = {
    magnitudeFilter: "All",
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
            PM 2.5 AQI
          </h2>
          <a onClick={this.toggleFilter}> {this.state.isFilterOpen? '+' : 'x'}</a>
          {this.state.isFilterOpen === true ? null : (
            <>
              <form>
                <h3 className="filter__h3"></h3>
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
                    value='Good'
                    checked={this.state.magnitudeFilter === 'Good' }
                    onChange={this.handleMagnitudeChange}
                  />
                   <div class="control__indicator1">0 - 12</div>
                   
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='Moderate'
                    checked={this.state.magnitudeFilter === 'Moderate' }
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator2">12.1 - 35.4</div>
                  
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='UHFSG'
                    checked={this.state.magnitudeFilter === 'UHFSG' }
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator3">35.5 - 55.4</div>
                  
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='Unhealthy'
                    checked={this.state.magnitudeFilter === 'Unhealthy' }
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator4">55.5 - 150.4</div>
                  
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value='VeryUnhealthy'
                    checked={this.state.magnitudeFilter === 'VeryUnhealthy' }
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator5">150.5 - 250.4</div>
                  
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value={"Harzadous"}
                    checked={this.state.magnitudeFilter === 'Harzadous'}
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator6">250.5 - 500</div>
                  
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