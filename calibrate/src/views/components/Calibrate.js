import React, { useState, useRef } from "react";
import { TextField } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import PropTypes from "prop-types";

// styles
import "../../styles/calibrate.css";

function csvHeaders(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  return headers;
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

const ColumnTextField = ({ label, onChange, options, className }) => {
  return (
    <TextField
      className={className}
      select
      fullWidth
      label={label}
      style={{ marginTop: "25px" }}
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
  console.log("has reference", hasReference);
  const handleReferenceChange = (event) => {
    setHasReference(event.target.value);
  };

  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function (event) {
      setOptions(csvHeaders(event.target.result));
    };
    reader.readAsText(selectedFile);
  }

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
          onChange={() => {}}
          options={options}
        />

        <ColumnTextField
          label="Sensor 1 PM2.5 Column Name"
          onChange={() => {}}
          options={options}
        />

        <ColumnTextField
          label="Sensor 2 PM2.5 Column Name"
          onChange={() => {}}
          options={options}
        />

        <ColumnTextField
          label="Sensor 1 PM10 Column Name"
          onChange={() => {}}
          options={options}
        />

        <ColumnTextField
          label="Sensor 2 PM10 Column Name"
          onChange={() => {}}
          options={options}
        />

        <ColumnTextField
          label="Temperature Column Name"
          onChange={() => {}}
          options={options}
        />

        <ColumnTextField
          label="Humidity Column Name"
          onChange={() => {}}
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

        {hasReference === "yes" && (
          <ColumnTextField
            label="Reference Data Column Name"
            onChange={() => {}}
            options={options}
          />
        )}

        {hasReference === "yes" && (
          <ColumnTextField
            label="Reference Data Pollutant Type"
            onChange={() => {}}
            options={["PM 2.5", "PM 10"]}
          />
        )}

        <Button style={{ marginTop: "30px" }} disabled variant="outlined">
          Calibrate Data
        </Button>
      </div>
    </div>
  );
};

export default Calibrate;
