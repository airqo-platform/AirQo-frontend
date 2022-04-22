import React, { useEffect, useRef, useState } from "react";
import { Parser } from "json2csv";

import { useManagementFilteredDevicesData } from "redux/DeviceManagement/selectors";

// css styles
import "assets/css/map-download.css";

const DownloadIcon = ({ fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill={fill || "#000000"}
        d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"
      />
    </svg>
  );
};

const MapDownload = () => {
  const ref = useRef();
  const inputRef = useRef();
  const devices = useManagementFilteredDevicesData();
  const [filename, setFilename] = useState("");
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow(!show);

  const onDownloadClick = () => {
    if (filename) {
      toggleShow();
      const exportFilename = filename.endsWith(".csv")
        ? filename
        : `${filename}.csv`;

      const fields = [
        "name",
        "device_number",
        "isActive",
        "isOnline",
        "latitude",
        "longitude",
        "maintenance_status",
        "nextMaintenance",
        "powerType",
      ];
      const opts = { fields };

      try {
        const parser = new Parser(opts);
        const csv = parser.parse(devices);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        if (navigator.msSaveBlob) {
          // IE 10+
          navigator.msSaveBlob(blob, exportFilename);
        } else {
          const link = document.createElement("a");
          if (link.download !== undefined) {
            // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportFilename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onChange = (event) => {
    setFilename(event.target.value);
  };

  useEffect(() => {
    const onEnterHandler = (event) => {
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        inputRef.current && inputRef.current.click();
      }
    };
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (show && ref.current && !ref.current.contains(e.target))
        setShow(false);
    };
    inputRef.current &&
      inputRef.current.addEventListener("keyup", onEnterHandler);
    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      inputRef.current &&
        inputRef.current.removeEventListener("keyup", onEnterHandler);
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [show]);
  return (
    <div className="map-download-container">
      <label className="dropup" ref={ref}>
        <ul className={`du-menu ${(!show && "du-input") || ""}`}>
          <li className="download">
            <span>File Name</span>{" "}
            <input
              ref={inputRef}
              onClick={onDownloadClick}
              onChange={onChange}
            />
          </li>
        </ul>
      </label>
      <div className="map-download-wrapper">
        <div className="map-download-search">
          <button
            type="submit"
            className="map-download-searchButton"
            onClick={toggleShow}
          >
            <DownloadIcon fill="#2f67e2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapDownload;
