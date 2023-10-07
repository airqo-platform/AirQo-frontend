import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { isEmpty } from 'underscore';
import { useAirqloudUptimeData } from 'redux/DeviceManagement/selectors';
import { loadAirqloudUptime } from 'redux/DeviceManagement/operations';
import { useCurrentAirQloudData } from 'redux/AirQloud/selectors';
import { ApexChart, createPieChartOptions } from 'views/charts';
import { roundToStartOfDay, roundToEndOfDay } from 'utils/dateTime';
import { Button, TextField, Typography } from '@material-ui/core';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { useDispatch } from 'react-redux';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useAirqloudsSummaryData } from 'redux/AirQloud/selectors';
import { fetchAirqloudsSummaryData } from 'redux/AirQloud/operations';

const AirqloudUptimeChart = () => {
  const dispatch = useDispatch();
  const airqloudUptimeData = useAirqloudUptimeData();
  const [airqloudUptime, setAirqloudUptime] = useState([]);
  const [activeAirqloud, setActiveAirqloud] = useState({});
  const currentAirqloud = useCurrentAirQloudData();
  const airqlouds = useAirqloudsSummaryData();
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

  useEffect(() => {
    if (currentAirqloud) {
      setActiveAirqloud(currentAirqloud);
    }
  }, []);

  useEffect(() => {
    setAirqloudsLoading(true);
    dispatch(fetchAirqloudsSummaryData());
    setTimeout(() => {
      setAirqloudsLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (isEmpty(airqloudUptimeData)) {
      setAirqloudUptime([]);
    }

    if (!isEmpty(airqloudUptimeData)) {
      setAirqloudUptime([airqloudUptimeData.downtime, airqloudUptimeData.uptime]);
    }
  }, [airqloudUptimeData]);

  useEffect(() => {
    if (!isEmpty(activeAirqloud) && isEmpty(airqloudUptimeData)) {
      setAirqloudUptimeLoading(true);
      dispatch(
        loadAirqloudUptime({
          startDateTime: roundToStartOfDay(
            moment(new Date()).subtract(1, 'days').toISOString()
          ).toISOString(),
          endDateTime: roundToEndOfDay(new Date().toISOString()).toISOString(),
          airqloud: activeAirqloud._id
        })
      );
      setCloseController(true);
      setTimeout(() => {
        setAirqloudUptimeLoading(false);
        setCloseController(false);
      }, 5000);
    }
  }, [activeAirqloud]);

  const resetAirqloudUptimeChart = () => {
    setAirqloudUptimeLoading(true);
    if (editableStartDate && editableEndDate && activeAirqloud) {
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
            airqloud: activeAirqloud._id
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

  return (
    <ErrorBoundary>
      <ApexChart
        options={createPieChartOptions(['#FF2E2E', '#00A300'], ['Downtime', 'Uptime'])}
        series={airqloudUptime}
        title={activeAirqloud ? `Health status for ${activeAirqloud.long_name}` : 'Health status'}
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
              value={editableStartDate?.slice(0, 10)}
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
              value={editableEndDate?.slice(0, 10)}
              onChange={(e) => {
                setEditableEndDate(e.target.value);
              }}
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
            <TextField
              select
              label="Choose airqloud"
              id="activeAirqloud"
              fullWidth
              style={{ marginTop: '15px' }}
              value={activeAirqloud ? activeAirqloud._id : ''}
              onChange={(e) => {
                const selectedAirqloud = airqlouds.find(
                  (airqloud) => airqloud._id === e.target.value
                );
                setActiveAirqloud(selectedAirqloud);
              }}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '40px' }
              }}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            >
              <option
                value={activeAirqloud._id}
                style={{
                  background: 'blue',
                  color: '#fff'
                }}
              >
                {activeAirqloud.long_name}
              </option>
              {airqloudsLoading && <option value="">Loading...</option>}
              {airqlouds.map((airqloud) => (
                <option key={airqloud._id} value={airqloud._id}>
                  {airqloud.long_name}
                </option>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: '15px' }}
              onClick={resetAirqloudUptimeChart}
            >
              Reset chart
            </Button>
            {errorMsg && (
              <Typography
                variant="body1"
                style={{
                  color: 'red',
                  marginTop: '8px'
                }}
              >
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
