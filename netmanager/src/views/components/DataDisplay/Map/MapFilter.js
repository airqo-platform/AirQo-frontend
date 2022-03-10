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
    <svg xmlns="http://www.w3.org/2000/svg"
      width="22" height="22" fill="#2f67e2"
      class="bi bi-funnel-fill"
      viewBox="0 0 16 16">
      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
      <path
      stroke={stroke || "white"}
      fill={fill || "white"}/>
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
