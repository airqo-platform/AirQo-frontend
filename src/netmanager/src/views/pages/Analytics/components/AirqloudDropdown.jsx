import React, { useState } from 'react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import 'assets/css/dropdown.css';
import { isEmpty } from 'underscore';
import { setActiveGrid, setActiveCohort } from 'redux/Analytics/operations';

const customStyles = {
  control: (defaultStyles) => ({
    ...defaultStyles,
    textTransform: 'capitalize',
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
  })
};

export const formatString = (string) => {
  return string
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })
    .replace('Id', 'ID');
};

const AnalyticsAirqloudsDropDown = ({ isCohort, airqloudsData }) => {
  const dispatch = useDispatch();
  const activeGrid = useSelector((state) => state.analytics.activeGrid);
  const activeCohort = useSelector((state) => state.analytics.activeCohort);

  const handleAirQloudChange = (selectedOption) => {
    if (!isCohort) {
      dispatch(setActiveGrid(selectedOption.value));
      localStorage.setItem('activeGrid', JSON.stringify(selectedOption.value));
    } else {
      dispatch(setActiveCohort(selectedOption.value));
      localStorage.setItem('activeCohort', JSON.stringify(selectedOption.value));
    }
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
        <div className="airqloud">
          <span className="name">{formatString(airqloud.name)}</span>
          <span className="count">
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
            label: isCohort ? formatString(activeCohort.name) : formatString(activeGrid.name)
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
      </div>

      {/* {hoveredOption && hoveredOption.value && hoveredOption.value.sites && (
        <div className="site-names">
          {hoveredOption.value.sites.map((site, index) => (
            <span key={index}>{site}</span>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default AnalyticsAirqloudsDropDown;
