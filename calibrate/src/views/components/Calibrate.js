import React, { useState, useRef, useEffect } from "react";
import { TextField } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  calibrateDataApi,
  trainAndCalibrateDataApi,
} from "../apis/calibrateTool";
import PropTypes from "prop-types";

// styles
import "../../styles/calibrate.css";

function csvHeaders(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  return headers.map((header) => header.replace(/\r?\n|\r/g, ""));
  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

function FileUploadField({ selectedFile, setSelectedFile }) {
  const refInput = useRef(null);

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // setIsSelected(true);
  };

  const handleSubmission = () => {
    refInput.current.click();
  };

  return (
    <div>
      <input
        className="hidden-input"
        type="file"
        name="file"
        onChange={changeHandler}
        ref={refInput}
        accept="text/csv"
      />
      <div className="select-file">
        <div onClick={handleSubmission} className="browse">
          Browse...
        </div>
        <div className="file-name">
          {(selectedFile && selectedFile.name) || "No file selected"}
        </div>
      </div>
    </div>
  );
}

FileUploadField.protoTypes = {
  selectedFile: PropTypes.object,
  setSelectedFile: PropTypes.func,
};

const ColumnTextField = ({ label, onChange, options, className, value }) => {
  return (
    <TextField
      className={className}
      select
      fullWidth
      label={label}
      style={{ marginTop: "25px" }}
      value={value}
      onChange={onChange}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        native: true,
        style: { width: "100%", height: "40px" },
      }}
      variant="outlined"
    >
      <option value="_">_</option>
      {options.map((value, key) => (
        <option value={value} key={key}>
          {value}
        </option>
      ))}
      {options.length <= 0 && (
        <option>Upload csv file to see column options</option>
      )}
    </TextField>
  );
};

const Calibrate = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [options, setOptions] = useState([]);
  const [hasReference, setHasReference] = useState(false);
  const [data, setData] = useState({
    file: null,
    datetime: null,
    pm2_5: null,
    s2_pm2_5: null,
    pm10: null,
    s2_pm10: null,
    temperature: null,
    humidity: null,
  });

  const refPollutantMapper = {
    "PM 2.5": "pm2_5",
    "PM 10": "pm10",
  };

  const [refData, setRefData] = useState({
    pollutant: null,
    ref_data: null,
  });

  const [loading, setLoading] = useState(false);

  const checkHasReference = () => hasReference === "yes";

  const onChange = (key) => (event) => {
    setData({ ...data, [key]: event.target.value });
  };

  const onRefDataChange = (key) => (event) => {
    setRefData({ ...refData, [key]: event.target.value });
  };

  const handleReferenceChange = (event) => {
    setHasReference(event.target.value);
  };

  const checkValid = () => {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      if (data[keys[i]] === null || data[keys[i]] === "_") {
        return false;
      }
    }
    if (checkHasReference()) {
      let keys = Object.keys(refData);
      for (let i = 0; i < keys.length; i++) {
        if (refData[keys[i]] === null || refData[keys[i]] === "_") {
          return false;
        }
      }
    }
    return true;
  };
  useEffect(() => {
    if (selectedFile) {
      setData({ ...data, file: selectedFile });

      const reader = new FileReader();
      reader.onload = function (event) {
        setOptions(csvHeaders(event.target.result));
      };
      reader.readAsText(selectedFile);
    }
  }, [selectedFile]);

  const downloadCSVData = (filename, data) => {
    const downloadUrl = window.URL.createObjectURL(data);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.setAttribute("download", filename); //any other extension

    document.body.appendChild(link);

    link.click();
    link.remove();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const filename = "calibrated_data.csv";

    const formData = new FormData();
    for (let key in data) {
      formData.append(key, data[key]);
    }

    if (checkHasReference()) {
      const modifiedRefData = refData;
      modifiedRefData.pollutant = refPollutantMapper[modifiedRefData.pollutant];
      for (let key in modifiedRefData) {
        formData.append(key, modifiedRefData[key]);
      }
      const responseData = await trainAndCalibrateDataApi(formData);
      downloadCSVData(filename, responseData);
    } else {
      const responseData = await calibrateDataApi(formData);
      downloadCSVData(filename, responseData);
    }

    setLoading(false);
  };

  return (
    <div className="calibrate-container">
      <div className="calibrate-column">
        <div className={"calibrate-title"}>low cost Sensor Data</div>
        <FileUploadField
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />

        <ColumnTextField
          label="Datetime Column Name"
          onChange={onChange("datetime")}
          options={options}
        />

        <ColumnTextField
          label="Sensor 1 PM2.5 Column Name"
          onChange={onChange("pm2_5")}
          options={options}
        />

        <ColumnTextField
          label="Sensor 2 PM2.5 Column Name"
          onChange={onChange("s2_pm2_5")}
          options={options}
        />

        <ColumnTextField
          label="Sensor 1 PM10 Column Name"
          onChange={onChange("pm10")}
          options={options}
        />

        <ColumnTextField
          label="Sensor 2 PM10 Column Name"
          onChange={onChange("s2_pm10")}
          options={options}
        />

        <ColumnTextField
          label="Temperature Column Name"
          onChange={onChange("temperature")}
          options={options}
        />

        <ColumnTextField
          label="Humidity Column Name"
          onChange={onChange("humidity")}
          options={options}
        />
      </div>

      <div className="calibrate-column">
        <div className={"calibrate-title"}>reference monitor data</div>

        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">
            Does the uploaded CSV file contain reference data?
          </FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue={"no"}
            name="radio-buttons-group"
            onChange={handleReferenceChange}
          >
            <FormControlLabel value={"yes"} control={<Radio />} label="Yes" />
            <FormControlLabel value={"no"} control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        {checkHasReference() && (
          <ColumnTextField
            label="Reference Data Column Name"
            onChange={onRefDataChange("ref_data")}
            options={options}
          />
        )}

        {checkHasReference() && (
          <ColumnTextField
            label="Reference Data Pollutant Type"
            onChange={onRefDataChange("pollutant")}
            options={["PM 2.5", "PM 10"]}
          />
        )}

        <LoadingButton
          loading={loading}
          style={{ marginTop: "30px" }}
          disabled={loading || !checkValid()}
          variant="outlined"
          onClick={onSubmit}
        >
          Calibrate Data
        </LoadingButton>
      </div>
    </div>
  );
};

export default Calibrate;
