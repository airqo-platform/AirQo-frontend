import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  MenuItem,
} from "@material-ui/core";
import OutlinedSelect from "views/components/CustomSelects/OutlinedSelect";
import {
  useDashboardSiteOptions,
  usePollutantsOptions,
} from "utils/customHooks";
import { useCurrentAirQloudData } from "redux/AirQloud/selectors";
import { updateUserDefaultGraphData } from "redux/Dashboard/operations";
import { useAuthUser } from "redux/Join/selectors";
import { createUserChartDefaultsApi } from "views/apis/authService";
import { roundToStartOfDay, roundToEndOfDay } from "utils/dateTime";
import { updateMainAlert } from "redux/MainAlert/operations";
import { isEmpty } from "underscore";
import Typography from "@material-ui/core/Typography";
import { Close } from "@material-ui/icons";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/styles";

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

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, title, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{title}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <Close />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const AddChart = ({ className }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const airqloud = useCurrentAirQloudData();
  const siteOptions = airqloud.siteOptions;
  const user = useAuthUser();
  const pollutantOptions = usePollutantsOptions();

  const [startDate, endDate] = generateStartAndEndDates();

  const initialDefaultsData = {
    sites: [],
    startDate: roundToStartOfDay(startDate).toISOString(),
    endDate: roundToEndOfDay(endDate).toISOString(),
    chartType: { value: "line", label: "Line" },
    frequency: { value: "hourly", label: "Hourly" },
    pollutant: (pollutantOptions.length > 0 && pollutantOptions[0]) || "",
    chartSubTitle: "",
    chartTitle: "default chart title",
    period: {
      value: "Last 30 days",
      label: "Last 30 days",
      unitValue: 30,
      unit: "day",
    },
    user: user._id,
    airqloud: airqloud._id,
  };
  const [defaultsData, setDefaultsData] = useState(initialDefaultsData);
  const [errors, setErrors] = useState({});

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

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleClose = () => {
    setShowForm(false);
    handleDialogClose();
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
    handleDialogClose();
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
    <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Card className={className}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
          }}
        >
          {!showForm && (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={() => setShowForm(true)}
            >
              Add Chart
            </Button>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{ width: "80%", minWidth: "250px" }}
            >
              <Grid container spacing={2}>
                <Grid item md={12} xs={12}>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Location Name"
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
                    label="Sites"
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

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                    width: "100%",
                  }}
                >
                  <Button color="primary" onClick={() => setOpen(true)}>
                    view all fields
                  </Button>
                </div>

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

      <Dialog
        open={open}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle onClose={handleDialogClose} title={"Add New Chart"} />
        <Divider />
        <DialogContent>
          <form
            onSubmit={handleSubmit}
            style={{ width: "100%", minWidth: "250px" }}
          >
            <Grid container spacing={2}>
              <Grid item md={12} xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Location Name"
                  variant="outlined"
                  value={defaultsData.chartSubTitle}
                  error={!!errors.chartSubTitle}
                  helperText={errors.chartSubTitle}
                  onChange={handleTextFieldChange("chartSubTitle")}
                  fullWidth
                  required
                />
              </Grid>
              {/*<Grid item md={12} xs={12}>*/}
              {/*  <TextField*/}
              {/*    // classes={{ root: classes.root }}*/}
              {/*    select*/}
              {/*    name="userRoles"*/}
              {/*    id="userRoles"*/}
              {/*    variant="outlined"*/}
              {/*    label="userRoles"*/}
              {/*    fullWidth*/}
              {/*    SelectProps={{*/}
              {/*      multiple: true,*/}
              {/*      value: [],*/}
              {/*      // onChange: handleFieldChange*/}
              {/*    }}*/}
              {/*  >*/}
              {/*    <MenuItem value="admin">Admin</MenuItem>*/}
              {/*    <MenuItem value="user1">User1</MenuItem>*/}
              {/*    <MenuItem value="user2">User2</MenuItem>*/}
              {/*  </TextField>*/}
              {/*</Grid>*/}
              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Sites"
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddChart;
