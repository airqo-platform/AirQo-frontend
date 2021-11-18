import React, { useEffect, useRef, useState } from "react";

// css styles
import "assets/css/map-filter.css";

const FilterIcon = () => {
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
        stroke="white"
        fill="white"
      />
    </svg>
  );
};

const MapFilter = () => {
  const ref = useRef();
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow(!show);

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
      <label className="dropup" ref={ref}>
        <ul className={`du-menu ${(!show && "du-input") || ""}`}>
          <li>Online devices</li>
          <li>Offline devices</li>
          <li className="divider" />
          <li>ADD A CUSTOM FILTER</li>
        </ul>
      </label>
      <div className="map-filter-wrapper">
        <div className="map-filter-search" onClick={toggleShow}>
          <input
            type="text"
            className="map-filter-searchTerm"
            placeholder="Add a filter"
          />
          <button type="submit" className="map-filter-searchButton">
            <FilterIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapFilter;
