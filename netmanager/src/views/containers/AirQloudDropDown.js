import React, { useEffect, useState } from 'react';
import ReloadIcon from '@material-ui/icons/Replay';
import { Box, Tooltip, makeStyles } from '@material-ui/core';
import Select from 'react-select';
import { useDispatch } from 'react-redux';
import { useCurrentAirQloudData, useAirqloudsSummaryData } from 'redux/AirQloud/selectors';
import { setCurrentAirQloudData, fetchAirqloudsSummaryData } from 'redux/AirQloud/operations';
import { resetDefaultGraphData } from 'redux/Dashboard/operations';
import { refreshAirQloud } from 'redux/AirQloud/operations';

import 'assets/css/dropdown.css';
import { isEmpty } from 'underscore';

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

const AirQloudDropDown = () => {
  const currentAirqQloud = useCurrentAirQloudData();
  const dispatch = useDispatch();
  const airqlouds = useAirqloudsSummaryData();

  const handleAirQloudChange = (selectedOption) => {
    const airqloud = selectedOption ? selectedOption.value : null;
    dispatch(setCurrentAirQloudData(airqloud));
    dispatch(resetDefaultGraphData());
  };

  const handleAirQloudRefresh = (event) => {
    event.stopPropagation();
    dispatch(refreshAirQloud(currentAirqQloud.long_name, currentAirqQloud._id));
  };

  useEffect(() => {
    if (isEmpty(airqlouds)) {
      dispatch(fetchAirqloudsSummaryData());
    }
  }, []);

  const options = airqlouds.map((airqloud) => ({
    value: airqloud,
    label: (
      <div className="site">
        <span className="long_name">{airqloud.long_name}</span>
        <span className="site-count">({airqloud.numberOfSites} sites)</span>
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
          value={{ value: currentAirqQloud, label: currentAirqQloud.long_name }}
          options={options}
          onChange={handleAirQloudChange}
          isSearchable={true}
          filterOption={filterOptions}
          onFocus={handleOptionMouseLeave}
          styles={customStyles}
          className="basic-single"
          classNamePrefix="select"
        />
        <Tooltip title="Refresh AirQloud">
          <div className="dd-reload" onClick={handleAirQloudRefresh}>
            <ReloadIcon />
          </div>
        </Tooltip>
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

export default AirQloudDropDown;
