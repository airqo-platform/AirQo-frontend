import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { isEmpty } from 'underscore';
import { useAirqloudUptimeData } from 'redux/DeviceManagement/selectors';
import { loadAirqloudUptime } from 'redux/DeviceManagement/operations';
import { ApexChart, createPieChartOptions } from 'views/charts';
import { roundToStartOfDay, roundToEndOfDay } from 'utils/dateTime';
import { Box, Button, TextField, Typography } from '@material-ui/core';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { useDispatch, useSelector } from 'react-redux';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { fetchGridsSummary } from 'redux/Analytics/operations';
import Select from 'react-select';

const gridOptions = (grids) => {
  return grids.map((grid) => ({
    value: grid._id,
    label: grid.long_name
  }));
};

const AirqloudUptimeChart = () => {
  const dispatch = useDispatch();
  const airqloudUptimeData = useAirqloudUptimeData();
  const [airqloudUptime, setAirqloudUptime] = useState([]);
  const [activeGrid, setActiveGrid] = useState({
    _id: '',
    long_name: ''
  });
  const grids = useSelector((state) => state.analytics.gridsSummary);
  const [editableStartDate, setEditableStartDate] = useState(
    roundToStartOfDay(moment().subtract(1, 'days').toISOString()).toISOString()
  );
  const [editableEndDate, setEditableEndDate] = useState(
    roundToEndOfDay(new Date().toISOString()).toISOString()
  );
  const [closeController, setCloseController] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [airqloudUptimeLoading, setAirqloudUptimeLoading] = useState(false);
  const [airqloudsLoading, setAirqloudsLoading] = useState(false);
  const [state, setState] = useState({
    errors: {}
  });

  useEffect(() => {
    if (grids.length > 0) {
      setActiveGrid(grids[0]);
    } else {
      setAirqloudsLoading(true);
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
      dispatch(fetchGridsSummary(activeNetwork.net_name)).then(() => {
        setAirqloudsLoading(false);
      });
    }
  }, [grids]);

  useEffect(() => {
    if (isEmpty(airqloudUptimeData)) {
      setAirqloudUptime([]);
    }

    if (!isEmpty(airqloudUptimeData)) {
      setAirqloudUptime([airqloudUptimeData.downtime, airqloudUptimeData.uptime]);
    }
  }, [airqloudUptimeData]);

  useEffect(() => {
    if (activeGrid && activeGrid._id !== '' && isEmpty(airqloudUptimeData)) {
      setAirqloudUptimeLoading(true);
      dispatch(
        loadAirqloudUptime({
          startDateTime: roundToStartOfDay(
            moment(new Date()).subtract(1, 'days').toISOString()
          ).toISOString(),
          endDateTime: roundToEndOfDay(new Date().toISOString()).toISOString(),
          grid: activeGrid._id
        })
      );
      setCloseController(true);
      setTimeout(() => {
        setAirqloudUptimeLoading(false);
        setCloseController(false);
      }, 5000);
    }
  }, [activeGrid, grids]);

  const resetAirqloudUptimeChart = () => {
    setAirqloudUptimeLoading(true);
    if (editableStartDate && editableEndDate && activeGrid) {
      if (new Date(editableStartDate) > new Date(editableEndDate)) {
        setErrorMsg('Error: End date is older than start date. Please adjust.');
        setTimeout(() => {
          setErrorMsg('');
        }, 5000);
        return;
      } else {
        setErrorMsg('');
      }

      // Check if difference between startDate and endDate is greater than 7 days
      const diffInDays = Math.floor(
        (new Date(editableEndDate) - new Date(editableStartDate)) / (1000 * 60 * 60 * 24)
      );
      if (diffInDays > 7) {
        setErrorMsg('Error: Time period should be less than 7 days');
        setTimeout(() => {
          setErrorMsg('');
        }, 5000);
        return;
      } else {
        setErrorMsg('');
        dispatch(
          loadAirqloudUptime({
            startDateTime: roundToEndOfDay(new Date(editableStartDate).toISOString()).toISOString(),
            endDateTime: roundToEndOfDay(new Date(editableEndDate).toISOString()).toISOString(),
            grid: activeGrid._id
          })
        );
        setCloseController(true);
        setTimeout(() => {
          setAirqloudUptimeLoading(false);
          setCloseController(false);
        }, 5000);
      }
    }
  };

  const { errors: formErrors } = state;

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '55px',
      borderColor: state.isFocused
        ? '#3f51b5'
        : !!formErrors[state.selectProps.name]
        ? '#e53935'
        : '#9a9a9a',
      boxShadow: state.isFocused ? 0 : null,
      '&:hover': {
        borderColor: !!formErrors[state.selectProps.name] ? '#e53935' : 'black'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      borderBottom: '1px dotted pink',
      color: state.isSelected ? 'white' : 'blue',
      textAlign: 'left'
    }),
    input: (provided, state) => ({
      ...provided,
      height: '40px',
      borderColor: state.isFocused ? '#3f51b5' : 'black'
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: !!formErrors[state.selectProps.name] ? '#e53935' : 'black'
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999
    })
  };

  return (
    <ErrorBoundary>
      <ApexChart
        options={createPieChartOptions(['#FF2E2E', '#00A300'], ['Downtime', 'Uptime'])}
        series={airqloudUptime}
        title={activeGrid ? `Health status for ${activeGrid.long_name}` : 'Health status'}
        type="pie"
        blue
        centerItems
        disableController={true}
        closeController={closeController}
        loading={airqloudUptimeLoading}
        customController={
          <div>
            <TextField
              label="Start date"
              id="startDate"
              fullWidth
              style={{ marginTop: '15px' }}
              value={editableStartDate ? editableStartDate.slice(0, 10) : ''}
              onChange={(e) => {
                setEditableStartDate(e.target.value);
              }}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              type="date"
            />

            <TextField
              label="End date"
              id="endDate"
              fullWidth
              style={{ marginTop: '15px' }}
              value={editableEndDate ? editableEndDate.slice(0, 10) : ''}
              onChange={(e) => {
                setEditableEndDate(e.target.value);
              }}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              type="date"
            />

            <Box marginTop="8px">
              <Select
                value={gridOptions(grids).find((option) => option.value === activeGrid._id)}
                onChange={(e) => {
                  const selectedAirqloud = grids.find((airqloud) => airqloud._id === e.value);
                  setActiveGrid(selectedAirqloud);
                }}
                isClearable={true}
                options={gridOptions(grids)}
                isSearchable
                placeholder="Choose grid"
                name="activeGrid"
                styles={customStyles}
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: '15px' }}
              onClick={resetAirqloudUptimeChart}>
              Reset chart
            </Button>
            {errorMsg && (
              <Typography
                variant="body1"
                style={{
                  color: 'red',
                  marginTop: '8px'
                }}>
                {errorMsg}
              </Typography>
            )}
          </div>
        }
        footerContent={
          <div>
            <ScheduleIcon />
            From {moment.utc(editableStartDate).format('DD MMM yyyy HH:mm:ss')} to{' '}
            {moment.utc(editableEndDate).format('DD MMM yyyy HH:mm:ss')}
          </div>
        }
      />
    </ErrorBoundary>
  );
};

export default AirqloudUptimeChart;
