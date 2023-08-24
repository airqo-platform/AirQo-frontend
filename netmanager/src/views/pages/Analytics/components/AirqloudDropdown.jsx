import React, { useEffect, useState } from 'react';
import ReloadIcon from '@material-ui/icons/Replay';
import { Box, Tooltip, makeStyles } from '@material-ui/core';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import 'assets/css/dropdown.css';
import { isEmpty } from 'underscore';
import { setActiveGrid, setActiveCohort } from 'redux/Analytics/operations';

const customStyles = {
  control: (defaultStyles) => ({
    ...defaultStyles,
    textTransform: 'uppercase',
    borderColor: '#eee',
    width: '100%',
    fontSize: '14px',
    minHeight: '44px',
    height: '44px',
    outline: '0px',
    border: '0px',
    borderRadius: '8px'
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    height: '44px'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#0560c9',
    fontWeight: 'bold', // Increase the font weight
    textAlign: 'center',
    justifyContent: 'center'
  }),
  indicatorSeparator: (state) => ({
    display: 'none'
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '44px'
  })
};

const AnalyticsAirqloudsDropDown = ({ isCohort, airqloudsData }) => {
  const dispatch = useDispatch();
  const activeGrid = useSelector((state) => state.analytics.activeGrid);
  const activeCohort = useSelector((state) => state.analytics.activeCohort);

  const handleAirQloudChange = (selectedOption) => {
    const airqloud = selectedOption ? selectedOption.value : null;
    if (!isCohort) {
      dispatch(setActiveGrid(airqloud));
    } else {
      dispatch(setActiveCohort(airqloud));
    }
    // dispatch(resetDefaultGraphData());
  };

  const handleAirQloudRefresh = (event) => {
    event.stopPropagation();
    // dispatch(refreshAirQloud(currentAirqQloud.long_name, currentAirqQloud._id));
  };

  const options =
    !isEmpty(airqloudsData) &&
    airqloudsData.map((airqloud) => ({
      value: airqloud,
      label: (
        <div className="site">
          <span className="long_name">{airqloud.name}</span>
          <span className="site-count">
            {isCohort
              ? !isEmpty(airqloud.devices)
                ? airqloud.devices.length + ' devices'
                : '0 devices'
              : !isEmpty(airqloud.sites)
              ? airqloud.sites.length + ' sites'
              : '0 sites'}
          </span>
        </div>
      )
    }));

  const [hoveredOption, setHoveredOption] = useState(null);

  const handleOptionMouseLeave = () => {
    setHoveredOption(null);
  };

  const filterOptions = (option, inputValue) => {
    // Convert the option label to lowercase for case-insensitive matching
    const optionLabel = option.label.props.children[0].props.children.toLowerCase();
    // Convert the input value to lowercase for case-insensitive matching
    const searchValue = inputValue.toLowerCase();

    return optionLabel.includes(searchValue);
  };

  return (
    <div className="dropdown">
      <div className="dropdown-wrapper">
        <Select
          value={{
            value: isCohort ? activeCohort : activeGrid,
            label: isCohort ? activeCohort.name : activeGrid.name
          }}
          options={options}
          onChange={handleAirQloudChange}
          isSearchable={true}
          filterOption={filterOptions}
          onFocus={handleOptionMouseLeave}
          styles={customStyles}
          className="basic-single"
          classNamePrefix="select"
        />
        {/* <Tooltip title="Refresh AirQloud">
          <div className="dd-reload" onClick={handleAirQloudRefresh}>
            <ReloadIcon />
          </div>
        </Tooltip> */}
      </div>

      {hoveredOption && hoveredOption.value && hoveredOption.value.sites && (
        <div className="site-names">
          {hoveredOption.value.sites.map((site, index) => (
            <span key={index}>{site}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsAirqloudsDropDown;
