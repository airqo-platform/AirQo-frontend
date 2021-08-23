import React, { useState } from "react";
import { Button, Card, Grid } from "@material-ui/core";
import OutlinedSelect from "views/components/CustomSelects/OutlinedSelect";
import TextField from "@material-ui/core/TextField";

const AddChart = ({ className }) => {
  const [showForm, setShowForm] = useState(false);

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

  const handleClose = () => setShowForm(false);

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
          // <form onSubmit={handleSubmit} id="customisable-form">
          <form style={{ width: "60%", minWidth: "250px" }}>
            <Grid container spacing={2}>
              <Grid item md={12} xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Location(s) Name"
                  variant="outlined"
                  // value={newDevice.generation_count}
                  // error={!!errors.generation_count}
                  // helperText={errors.generation_count}
                  // onChange={handleDeviceDataChange("generation_count")}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  className="reactSelect"
                  // name="location"
                  label="Location(s)"
                  // value={tempState.sites.selectedOption}
                  options={[
                    { label: "red", value: "red" },
                    { label: "blue", value: "blue" },
                    { label: "green", value: "green" },
                  ]}
                  // onChange={handleMultiChange}
                  isMulti
                  variant="outlined"
                  margin="dense"
                  required
                />
              </Grid>

              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Chart Type"
                  className="reactSelect"
                  name="chartType"
                  placeholder="Chart Type"
                  // value={tempState.chartType}
                  options={chartTypeOptions}
                  // onChange={handleChartTypeChange}
                  variant="outlined"
                  margin="dense"
                  required
                />
              </Grid>

              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Frequency"
                  className=""
                  name="chartFrequency"
                  placeholder="Frequency"
                  // value={tempState.frequency}
                  options={frequencyOptions}
                  // onChange={handleFrequencyChange}
                  variant="outlined"
                  margin="dense"
                  required
                />
              </Grid>
              <Grid item md={12} xs={12}>
                <OutlinedSelect
                  fullWidth
                  label="Pollutant"
                  className=""
                  name="pollutant"
                  placeholder="Pollutant"
                  // value={tempState.pollutant}
                  options={pollutantOptions}
                  // onChange={handlePollutantChange}
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
                    onClick={handleClose}
                    color="primary"
                    type="submit" //set the buttom type is submit
                    form="customisable-form"
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
