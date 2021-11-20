import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Cancel } from "@material-ui/icons";
import {
  updateFilteredDevicesData,
  updateActiveFilters,
} from "redux/DeviceManagement/operations";
import {
  useManagementDevicesData,
  useManagementFilteredDevicesData,
  useActiveFiltersData,
} from "redux/DeviceManagement/selectors";
import { multiFilter } from "utils/filters";
import { mapObject, omit, isEmpty, isEqual } from "underscore";

// css styles
import "assets/css/map-filter.css";

const FilterIcon = ({ fill, stroke }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
        stroke={stroke || "white"}
        fill={fill || "white"}
      />
    </svg>
  );
};

const MapFilter = () => {
  const ref = useRef();
  const dispatch = useDispatch();
  const activeFilters = useActiveFiltersData();
  const allDevices = useManagementDevicesData();
  const devices = useManagementFilteredDevicesData();
  const [show, setShow] = useState(false);
  const [filters, setFilters] = useState([]);

  const updateFilteredDevices = (filters) => {
    let filteredDevices = allDevices;

    filters.map((filter) => {
      filteredDevices = multiFilter(filteredDevices, filter.condition);
    });

    dispatch(updateFilteredDevicesData(filteredDevices));
  };

  const cancelOnlineFilters = () => {
    dispatch(
      updateActiveFilters(
        omit(
          {
            ...activeFilters,
            main: { ...mapObject(activeFilters.main, () => false) },
          },
          "isOnline"
        )
      )
    );
    updateFilteredDevices(
      filters.filter((fil) => {
        return Object.keys(fil.condition)[0] !== "isOnline";
      })
    );
  };

  const defaultFilters = [
    {
      label: "Online Devices",
      condition: { isOnline: true },
      cancel: cancelOnlineFilters,
    },
    {
      label: "Offline Devices",
      condition: { isOnline: false },
      cancel: cancelOnlineFilters,
    },
  ];

  const toggleShow = () => setShow(!show);

  const compareFilters = (filter1, filter2) => {
    return isEqual(omit(filter1, "cancel"), omit(filter2, "cancel"));
  };

  const handleFilterClick = (filter) => () => {
    toggleShow();
    if (isEmpty(filters.filter((fil) => compareFilters(fil, filter)))) {
      setFilters([...filters, filter]);
      dispatch(
        updateFilteredDevicesData(multiFilter(allDevices, filter.condition))
      );
      dispatch(
        updateActiveFilters({
          ...activeFilters,
          main: { ...mapObject(activeFilters.main, () => false) },
          ...filter.condition,
        })
      );
    }
  };

  useEffect(() => {
    const newFilters = [];
    filters.map((filter) => {
      const filterKeys = Object.keys(filter.condition);
      const filterKey = filterKeys[0];
      if (filter.condition[filterKey] === activeFilters[filterKey]) {
        newFilters.push(filter);
      }
    });
    setFilters(newFilters);
  }, [devices, activeFilters]);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (show && ref.current && !ref.current.contains(e.target))
        setShow(false);
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [show]);
  return (
    <div className="map-filter-container">
      <div className="dropup">
        {filters.map((filter, key) => {
          return (
            <div className="map-filter-item" key={key}>
              <FilterIcon fill="black" stroke="black" /> {filter.label}{" "}
              <Cancel
                className="grid-align-right"
                style={{ color: "red" }}
                onClick={filter.cancel}
              />
            </div>
          );
        })}
      </div>
      <label className="dropup" ref={ref}>
        <ul className={`du-menu ${(!show && "du-input") || ""}`}>
          {defaultFilters.map((filter, key) => (
            <li key={key} onClick={handleFilterClick(filter)}>
              {filter.label}
            </li>
          ))}
          <li className="divider" />
          <li className="disabled">ADD A CUSTOM FILTER</li>
        </ul>
      </label>
      <div className="map-filter-wrapper">
        <div className="map-filter-search">
          {/*<input*/}
          {/*  type="text"*/}
          {/*  className="map-filter-searchTerm"*/}
          {/*  placeholder="Add a filter"*/}
          {/*/>*/}
          <button
            type="submit"
            className="map-filter-searchButton"
            onClick={toggleShow}
          >
            <FilterIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapFilter;
