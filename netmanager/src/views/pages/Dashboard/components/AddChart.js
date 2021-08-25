import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Card, Grid, TextField } from "@material-ui/core";
import OutlinedSelect from "views/components/CustomSelects/OutlinedSelect";
import { useDashboardSiteOptions } from "utils/customHooks/DashboardHooks";
import { updateUserDefaultGraphData } from "redux/Dashboard/operations";
import { useAuthUser } from "redux/Join/selectors";
import { createUserChartDefaultsApi } from "views/apis/authService";
import { roundToStartOfDay, roundToEndOfDay } from "utils/dateTime";
import { updateMainAlert } from "redux/MainAlert/operations";
import { isEmpty } from "underscore";

const generateStartAndEndDates = () => {
  let endDate = new Date();
  let startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate() - 30
  );

  return [startDate, endDate];
};

const optionToList = (options) => {
  const arr = [];
  options.map((opt) => arr.push(opt.value));
  return arr;
};

const AddChart = ({ className }) => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const siteOptions = useDashboardSiteOptions();
  const user = useAuthUser();

  const [startDate, endDate] = generateStartAndEndDates();

  const initialDefaultsData = {
    sites: [],
    startDate: roundToStartOfDay(startDate).toISOString(),
    endDate: roundToEndOfDay(endDate).toISOString(),
    chartType: "",
    frequency: "",
    pollutant: "",
    chartSubTitle: "",
    chartTitle: "default chart title",
    period: {
      value: "Last 30 days",
      label: "Last 30 days",
      unitValue: 30,
      unit: "day",
    },
    user: user._id,
    airqloud: user._id,
  };
  const [defaultsData, setDefaultsData] = useState(initialDefaultsData);
  const [errors, setErrors] = useState({});

  const pollutantOptions = [
    { value: "pm2_5", label: "PM 2.5" },
    { value: "pm10", label: "PM 10" },
    { value: "no2", label: "NO2" },
  ];

  const frequencyOptions = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
  ];

  const chartTypeOptions = [
    { value: "line", label: "Line" },
    { value: "bar", label: "Bar" },
    { value: "pie", label: "Pie" },
  ];

  const handleTextFieldChange = (key) => (event) => {
    setDefaultsData({ ...defaultsData, [key]: event.target.value });
    setErrors({
      ...errors,
      [key]: event.target.value ? "" : "This field is required",
    });
  };
  const handleSelectChange = (key) => (selectedValue) => {
    setDefaultsData({ ...defaultsData, [key]: selectedValue });
    setErrors({
      ...errors,
      [key]: selectedValue ? "" : "This field is required",
    });
  };

  const clearDefaultsData = () => {
    setShowForm(false);
    setDefaultsData(initialDefaultsData);
  };

  const handleClose = () => {
    setShowForm(false);
    clearDefaultsData();
  };

  const validateInputData = (data) => {
    const errors = {};
    Object.keys(data).map((key) => {
      if (isEmpty(data[key])) errors[key] = "This field is required";
    });
    return errors;
  };

  const handleSubmit = async () => {
    const data = {
      ...defaultsData,
      chartType: defaultsData.chartType.value,
      frequency: defaultsData.frequency.value,
      pollutant: defaultsData.pollutant.value,
      sites: optionToList(defaultsData.sites),
    };
    const newErrors = validateInputData(data);
    if (!isEmpty(newErrors)) {
      console.log("new errors", newErrors);
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    await createUserChartDefaultsApi(data)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: "Successfully created chart",
            severity: "success",
          })
        );
        dispatch(updateUserDefaultGraphData(responseData.default));
        clearDefaultsData();
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            show: true,
            message:
              err.response && err.response.data && err.response.data.message,
            severity: "error",
          })
        );
      });
    setLoading(false);
  };

  return (
    <Card className={className}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {!showForm && (
          <Button
            variant="contained"
            color="primary"
            type="submit"
            align="right"
            onClick={() => setShowForm(true)}
          >
            Add Chart
          </Button>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{ width: "60%", minWidth: "250px" }}
          >
            <Grid container spacing={2}>
              <Grid item md={12} xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Location(s) Name"
                  variant="outlined"
                  value={defaultsData.chartSubTitle}
                  error={!!errors.chartSubTitle}
                  helperText={errors.chartSubTitle}
                  onChange={handleTextFieldChange("chartSubTitle")}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Location(s)"
                  value={defaultsData.sites}
                  options={siteOptions}
                  onChange={handleSelectChange("sites")}
                  error={!!errors.sites}
                  helperText={errors.sites}
                  isMulti
                  variant="outlined"
                  margin="dense"
                  required
                  scrollable
                  height={"100px"}
                />
              </Grid>

              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Chart Type"
                  name="chartType"
                  placeholder="Chart Type"
                  value={defaultsData.chartType}
                  options={chartTypeOptions}
                  onChange={handleSelectChange("chartType")}
                  error={!!errors.chartType}
                  helperText={errors.chartType}
                  variant="outlined"
                  margin="dense"
                  required
                />
              </Grid>

              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Frequency"
                  name="chartFrequency"
                  placeholder="Frequency"
                  value={defaultsData.frequency}
                  options={frequencyOptions}
                  onChange={handleSelectChange("frequency")}
                  error={!!errors.frequency}
                  helperText={errors.frequency}
                  variant="outlined"
                  margin="dense"
                  required
                />
              </Grid>
              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Pollutant"
                  name="pollutant"
                  placeholder="Pollutant"
                  value={defaultsData.pollutant}
                  options={pollutantOptions}
                  onChange={handleSelectChange("pollutant")}
                  error={!!errors.pollutant}
                  helperText={errors.pollutant}
                  variant="outlined"
                  margin="dense"
                  required
                />
              </Grid>
              <Grid item md={12} xs={12}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    onClick={handleClose}
                    color="primary"
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ marginLeft: "10px" }}
                    variant="contained"
                    onClick={handleSubmit}
                    color="primary"
                    disabled={loading}
                  >
                    Add Chart
                  </Button>
                </div>
              </Grid>
            </Grid>
          </form>
        )}
      </div>
    </Card>
  );
};

export default AddChart;
