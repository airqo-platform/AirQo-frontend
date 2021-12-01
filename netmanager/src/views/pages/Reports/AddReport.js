import React, { useState} from "react";
import { useHistory } from "react-router-dom";
import { ArrowBackIosRounded, AddCircleOutline } from "@material-ui/icons";
import { Button, Grid, Paper, TextField } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/styles";
import { transformArray } from "redux/utils";

const gridItemStyle = {
  padding: "5px",
  margin: "5px 10px",
};

const attributeStyle = {
  margin: "5px 0",
};

const useStyles = makeStyles((theme) => ({
  input: {
    height: 40,
  },
  addAttr: {
    cursor: "pointer",
    color: "#3f51b5",
    opacity: 0.7,
    "&:hover": {
      opacity: 1,
    },
  },
}));

const ReportAttributeForm = ({
  attributeData,
  updateAttribute,
  deleteAttribute,
}) => {
  const classes = useStyles();
  const handleChange = (key) => (evt) => {
    updateAttribute({ ...attributeData, [key]: evt.target.value });
  };
  return (
    <div style={{ marginTop: "20px" }}>
      <Grid container spacing={1}>
        <div
          style={{
            width: "100%",
            border: "2px solid grey",
            marginBottom: "20px",
          }}
        />
        {attributeData.deletable && (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{ color: "red", fontSize: "10px", cursor: "pointer" }}
              onClick={deleteAttribute}
            >
              delete
            </span>
          </div>
        )}

        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            id="subtitle"
            label="Subtitle"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={attributeData.title}
            onChange={handleChange("title")}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            id="asset"
            label="Asset"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={attributeData.asset}
            onChange={handleChange("asset")}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            label="Fields"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={attributeData.fields}
            onChange={handleChange("fields")}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            label="Type"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={attributeData.type}
            onChange={handleChange("type")}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>

        {/*<Grid items xs={12} sm={12} style={attributeStyle}>*/}
        {/*  <TextField*/}
        {/*    label="Filters"*/}
        {/*    variant="outlined"*/}
        {/*    InputProps={{*/}
        {/*      className: classes.input,*/}
        {/*    }}*/}
        {/*    InputLabelProps={{*/}
        {/*      shrink: true,*/}
        {/*    }}*/}
        {/*    value={attributeData.filters}*/}
        {/*    fullWidth*/}
        {/*  />*/}
        {/*</Grid>*/}

        {/*<Grid items xs={12} sm={12} style={attributeStyle}>*/}
        {/*  <TextField*/}
        {/*    label="Group-by Field"*/}
        {/*    variant="outlined"*/}
        {/*    InputProps={{*/}
        {/*      className: classes.input,*/}
        {/*    }}*/}
        {/*    InputLabelProps={{*/}
        {/*      shrink: true,*/}
        {/*    }}*/}
        {/*    value={attributeData.group_by}*/}
        {/*    fullWidth*/}
        {/*  />*/}
        {/*</Grid>*/}
      </Grid>
    </div>
  );
};

const periodOptions = transformArray(
  [
    {
      is_relative: true,
      label: "Last 2 weeks",
      value: 2,
      unit: "week",
    },
    {
      is_relative: true,
      label: "Last 30 days",
      value: 30,
      unit: "day",
    },
  ],
  "label"
);

const AddReport = () => {
  const history = useHistory();
  const classes = useStyles();
  const attributeTemplate = {
    title: "",
    type: "",
    asset: "",
    filters: {},
    fields: {},
    group_by: "",
  };
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState({});

  const [attributes, setAttributes] = useState([attributeTemplate]);
  const [errors, setErrors] = useState({});

  const deleteAttribute = (index) => () => {
    const newAttr = Array.from(attributes);
    newAttr.splice(index, 1);
    setAttributes(newAttr);
  };

  const updateAttribute = (index) => (attributeData) => {
    const newAttr = attributes.map((attr, i) => {
      if (index === i) return attributeData;
      return attr;
    });
    setAttributes(newAttr);
  };

  return (
    <div
      style={{
        width: "96%",
        margin: "20px auto",
      }}
    >
      <Paper
        style={{
          margin: "0 auto",
          minHeight: "400px",
          padding: "20px 20px",
          maxWidth: "1500px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
            margin: "20px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "5px",
            }}
          >
            <ArrowBackIosRounded
              style={{ color: "#3f51b5", cursor: "pointer" }}
              onClick={() => history.push("/reports")}
            />
          </div>
          Create a report
        </div>
        <Grid container spacing={1}>
          <Grid items xs={12} sm={12} style={gridItemStyle}>
            <TextField
              label="Report Title"
              variant="outlined"
              value={title}
              onChange={(evt) => setTitle(evt.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={12} sm={12} style={gridItemStyle}>
            <TextField
              select
              label="Period"
              variant="outlined"
              value={period.label || ""}
              onChange={(evt) => {
                setPeriod(periodOptions[evt.target.value]);
              }}
              SelectProps={{
                native: true,
                style: { width: "100%", height: "50px" },
              }}
              error={!!errors.period}
              helperText={errors.period}
              fullWidth
              required
            >
              <option aria-label="None" value="" />
              {Object.values(periodOptions).map((period, key) => (
                <option value={period.label} key={key}>
                  {period.label}
                </option>
              ))}
            </TextField>
          </Grid>

          <div
            style={{
              display: "grid",
              margin: "0 auto",
              gridTemplateColumns: "1fr 4fr",
              width: "96%",
              ...gridItemStyle,
            }}
          >
            <span
              style={{
                color: "",
                fontWeight: "bold",
                margin: "0 15px",
                marginTop: "20px",
              }}
            >
              Report Attributes
            </span>
            <div>
              {attributes.map((attribute, key) => (
                <ReportAttributeForm
                  attributeData={attribute}
                  updateAttribute={updateAttribute(key)}
                  deleteAttribute={deleteAttribute(key)}
                  key={key}
                />
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <Tooltip title={"Add Attribute"} placement={"top"}>
                  <AddCircleOutline
                    className={classes.addAttr}
                    onClick={() =>
                      setAttributes([
                        ...attributes,
                        { ...attributeTemplate, deletable: true },
                      ])
                    }
                  />
                </Tooltip>
              </div>
            </div>
          </div>

          <Grid
            container
            alignItems="flex-end"
            alignContent="flex-end"
            justify="flex-end"
            xs={12}
            style={{ margin: "10px 0" }}
          >
            <Button
              variant="contained"
              // onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              // disabled={weightedBool(manualDisable, isEqual(site, siteInfo))}
              // onClick={handleSubmit}
              style={{ marginLeft: "10px" }}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default AddReport;
