import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

class Filter extends Component {
  state = {
    magnitudeFilter: 'All',
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
      this.props.fetchFilteredData(this.state.magnitudeFilter);
    }
  }
  render() {
    return (
      <>
        <div className="filter">
          <h2 className="filter__h2" onClick={this.toggleFilter}>
            PM 2.5 AQI
          </h2>
          <a onClick={this.toggleFilter}>
            {' '}
            {this.state.isFilterOpen ? '+' : 'x'}
          </a>
          {this.state.isFilterOpen === true ? null : (
            <>
              <form>
              <popup_a className="filter__h3"></popup_a>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value="All"
                    checked={this.state.magnitudeFilter === 'All'}
                    onChange={this.handleMagnitudeChange}
                  />
                  All
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value="Good"
                    checked={this.state.magnitudeFilter === 'Good'}
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator1" data-tip data-for="good">
                    0 - 12
                  </div>
                  <ReactTooltip id="good" place="right" effect="solid">
                  <popup_a style={{ fontWeight: 'normal' }}> Good</popup_a>
                    {/* <p>Air Quality is good for everyone</p> */}
                  </ReactTooltip>
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value="Moderate"
                    checked={this.state.magnitudeFilter === 'Moderate'}
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator2" data-tip data-for="moderate">
                    12.1 - 35.4
                  </div>
                  <ReactTooltip
                    id="moderate"
                    place="right"
                    effect="solid"
                    multiline="true">
                    <popup_a style={{ fontWeight: 'normal' }}>Moderate</popup_a>
                    {/* <p>Unusually sensitive people: Consider reducing prolonged or heavy exertion</p>
                   <p>Everyone else: Air pollution poses little or no risk</p> */}
                  </ReactTooltip>
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value="UHFSG"
                    checked={this.state.magnitudeFilter === 'UHFSG'}
                    onChange={this.handleMagnitudeChange}
                  />
                  <div class="control__indicator3" data-tip data-for="UHFSG">
                    35.5 - 55.4
                  </div>
                  <ReactTooltip id="UHFSG" place="right" effect="solid">
                  <popup_a style={{ fontWeight: 'normal' }}>
                      {' '}
                      Unhealthy for sensitive groups
                    </popup_a>
                    {/* <p>Sensitive groups: Reduce prolonged or heavy exertion. It's okay to be active outside, but take more breaks and do less intense activities</p>
                   <p>People with asthma should follow their asthma action plans and keep quick relief medicine handy</p>
                   <p>If you have heart disease: Symptoms such as palpitaions, shortness of breath, or unusual fatigue may indicate a serirous problem. If you have any of these, contact your health care provider</p> */}
                  </ReactTooltip>
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value="Unhealthy"
                    checked={this.state.magnitudeFilter === 'Unhealthy'}
                    onChange={this.handleMagnitudeChange}
                  />
                  <div
                    class="control__indicator4"
                    data-tip
                    data-for="unhealthy">
                    55.5 - 150.4
                  </div>
                  <ReactTooltip id="unhealthy" place="right" effect="solid">
                  <popup_a style={{ fontWeight: 'normal' }}>Unhealthy</popup_a>
                    {/* <p>Sensitive groups: Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling.</p>
                   <p>Everyone else: Reduce prolonged or heavy exertion. Take more breaks during all outdoor activities.</p> */}
                  </ReactTooltip>
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value="VeryUnhealthy"
                    checked={this.state.magnitudeFilter === 'VeryUnhealthy'}
                    onChange={this.handleMagnitudeChange}
                  />
                  <div
                    class="control__indicator5"
                    data-tip
                    data-for="veryunhealthy">
                    150.5 - 250.4
                  </div>
                  <ReactTooltip id="veryunhealthy" place="right" effect="solid">
                  <popup_a style={{ fontWeight: 'normal' }}>Very Unhealthy</popup_a>
                    {/* <p>Sensitive groups: Avoid all physical activities outdoors. Move activities indoors or reschedule to a time when airquality is better</p>
                   <p>Everyone else: Avoid prolonged or heavy exertion. Consider moving activities indoors or reschedule to a time when airquality is better</p> */}
                  </ReactTooltip>
                </label>
                <label>
                  <input
                    type="radio"
                    name="magnitude"
                    value={'Harzadous'}
                    checked={this.state.magnitudeFilter === 'Harzadous'}
                    onChange={this.handleMagnitudeChange}
                  />
                  <div
                    class="control__indicator6"
                    data-tip
                    data-for="harzadous">
                    250.5 - 500
                  </div>
                  <ReactTooltip id="harzadous" place="right" effect="solid">
                  <popup_a style={{ fontWeight: 'normal' }}>Harzadous</popup_a>
                    {/* <p>Everyone: Avoid all physical activities outdoors</p>
                   <p>Sesitive groups: Remain indoors and keeo activity levels low. Follow tips for keeping particle levels low indoors.</p> */}
                  </ReactTooltip>
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
