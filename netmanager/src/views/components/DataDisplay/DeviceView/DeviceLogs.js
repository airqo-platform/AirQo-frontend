import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import {
  Button,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MaintenanceLogsTable from './Table';
import {
  forcedLoadDeviceMaintenanceLogs,
  loadDeviceMaintenanceLogs
} from 'reducer/DeviceRegistry/operations';
import { useDeviceLogsData } from 'reducer/DeviceRegistry/selectors';
import {
  addMaintenanceLogApi,
  updateMaintenanceLogApi,
  deleteMaintenanceLogApi
} from '../../../apis/deviceRegistry';
import { updateMainAlert } from 'reducer/MainAlert/operations';
import { CreatableLabelledSelect } from 'views/components/CustomSelects/LabelledSelect';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/EditOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ConfirmDialog from 'views/containers/ConfirmDialog'; // Make sure to adjust the path accordingly
import { humanReadableDate } from 'utils/dateTime';
import { setLoading as setLoader } from 'reducer/HorizontalLoader/index';

const titleStyles = {
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
};

const TableTitle = ({ deviceName }) => {
  return (
    <div style={titleStyles}>
      Maintenance logs for <strong>{deviceName || ''}</strong>
    </div>
  );
};

const EditLog = ({ deviceName, deviceLocation, toggleShow, log, loading, setLoading }) => {
  const dispatch = useDispatch();
  const maintenanceTypeMapper = {
    preventive: { value: 'preventive', label: 'Preventive' },
    corrective: { value: 'corrective', label: 'Corrective' }
  };

  const [maintenanceType, setMaintenanceType] = useState(
    maintenanceTypeMapper[log.maintenanceType] || null
  );
  const [description, setDescription] = useState(log.description || '');
  const [tags, setTags] = useState(log.tags || []);
  const [selectedDate, setSelectedDate] = useState(new Date(log.date));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tagsOptions = [
    'Dust blowing and sensor cleaning',
    'Site update check',
    'Device equipment check',
    'Power circuitry and components works',
    'GPS module works/replacement',
    'GSM module works/replacement',
    'Battery works/replacement',
    'Power supply works/replacement',
    'Antenna works/replacement',
    'Mounts replacement',
    'Software checks/re-installation',
    'PCB works/replacement',
    'Temp/humidity sensor works/replacement',
    'Air quality sensor(s) works/replacement'
  ].map(tag => ({ label: tag, value: tag }));

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const logData = {
      deviceName,
      locationName: deviceLocation,
      date: selectedDate.toISOString(),
      tags: tags.map(tag => tag.value),
      description
    };

    setLoading(true);
    dispatch(setLoader(true));

    try {
      const responseData = await updateMaintenanceLogApi(log._id, logData);
      dispatch(
        updateMainAlert({
          message: responseData.message,
          show: true,
          severity: 'success'
        })
      );

      setTimeout(async () => {
        dispatch(
          updateMainAlert({
            message: 'Reloading maintenance logs',
            show: true,
            severity: 'info'
          })
        );
        await dispatch(loadDeviceMaintenanceLogs(deviceName));
        dispatch(
          updateMainAlert({
            message: 'Reload successful',
            show: true,
            severity: 'success'
          })
        );
      }, 500);
    } catch (err) {
      dispatch(
        updateMainAlert({
          message: err.response?.data?.message || 'Could not update log',
          show: true,
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
      dispatch(setLoader(false));
      toggleShow();
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMaintenanceLogApi(log._id);
      dispatch(
        updateMainAlert({
          message: 'Log deleted successfully',
          show: true,
          severity: 'success'
        })
      );

      setTimeout(async () => {
        dispatch(
          updateMainAlert({
            message: 'Reloading maintenance logs',
            show: true,
            severity: 'info'
          })
        );
        await dispatch(loadDeviceMaintenanceLogs(deviceName));
        dispatch(
          updateMainAlert({
            message: 'Reload successful',
            show: true,
            severity: 'success'
          })
        );
      }, 500);
    } catch (err) {
      dispatch(
        updateMainAlert({
          message: err.response?.data?.message || 'Could not delete log',
          show: true,
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
      dispatch(setLoader(false));
      toggleShow();
    }
  };

  return (
    <Paper style={{ minHeight: '400px', padding: '5px 10px' }}>
      <h4>Edit Log</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '5px 0' }}>
          <TextField
            label="Device Name"
            variant="outlined"
            value={deviceName}
            fullWidth
            disabled
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <TextField
            label="Description"
            variant="outlined"
            multiline
            rows={10}
            fullWidth
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <CreatableLabelledSelect
            label={'Tags'}
            isMulti
            options={tagsOptions}
            isClearable
            value={tags}
            onChange={(newValue, actionMeta) => setTags(newValue)}
          />
        </div>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            fullWidth
            disableToolbar
            autoOk
            inputVariant="outlined"
            format="yyyy-MM-dd"
            margin="normal"
            label="Date of Maintenance"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
          />
        </MuiPickersUtilsProvider>

        <Grid container alignItems="flex-end" justify="flex-end">
          <Button variant="contained" onClick={toggleShow}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginLeft: '10px' }}
          >
            Save Changes
          </Button>
          <Tooltip title="Delete">
            <Button
              variant="contained"
              color="secondary"
              style={{ marginLeft: '10px' }}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </Tooltip>
        </Grid>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this log?"
      />
    </Paper>
  );
};

const AddLogForm = ({ deviceName, deviceLocation, toggleShow, loading, setLoading }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const tagsOptions = [
    'Dust blowing and sensor cleaning',
    'Site update check',
    'Device equipment check',
    'Power circuitry and components works',
    'GPS module works/replacement',
    'GSM module works/replacement',
    'Battery works/replacement',
    'Power supply works/replacement',
    'Antenna works/replacement',
    'Mounts replacement',
    'Software checks/re-installation',
    'PCB works/replacement',
    'Temp/humidity sensor works/replacement',
    'Air quality sensor(s) works/replacement'
  ].map(tag => ({ label: tag, value: tag }));

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const logData = {
      deviceName,
      locationName: deviceLocation,
      date: selectedDate.toISOString(),
      tags: tags.map(tag => tag.value),
      description
    };

    setLoading(true);
    dispatch(setLoader(true));

    try {
      const responseData = await addMaintenanceLogApi(deviceName, logData);
      dispatch(
        updateMainAlert({
          message: responseData.message,
          show: true,
          severity: 'success'
        })
      );

      setTimeout(async () => {
        dispatch(
          updateMainAlert({
            message: 'Reloading maintenance logs',
            show: true,
            severity: 'info'
          })
        );
        await dispatch(loadDeviceMaintenanceLogs(deviceName));
        dispatch(
          updateMainAlert({
            message: 'Reload successful',
            show: true,
            severity: 'success'
          })
        );
      }, 500);
    } catch (err) {
      dispatch(
        updateMainAlert({
          message: err.response?.data?.message || 'Could not add log',
          show: true,
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
      dispatch(setLoader(false));
      toggleShow();
    }
  };

  return (
    <Paper style={{ minHeight: '400px', padding: '5px 10px' }}>
      <h4>Add New Log</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '5px 0' }}>
          <TextField
            label="Device Name"
            variant="outlined"
            value={deviceName}
            fullWidth
            disabled
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <TextField
            label="Description"
            variant="outlined"
            multiline
            rows={10}
            fullWidth
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <CreatableLabelledSelect
            label={'Tags'}
            isMulti
            options={tagsOptions}
            isClearable
            value={tags}
            onChange={(newValue, actionMeta) => setTags(newValue)}
          />
        </div>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            fullWidth
            disableToolbar
            autoOk
            inputVariant="outlined"
            format="yyyy-MM-dd"
            margin="normal"
            label="Date of Maintenance"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
          />
        </MuiPickersUtilsProvider>

        <Grid container alignItems="flex-end" justify="flex-end">
          <Button variant="contained" onClick={toggleShow}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginLeft: '10px' }}
          >
            Add Log
          </Button>
        </Grid>
      </form>
    </Paper>
  );
};

const DeviceLogs = ({ deviceName, deviceLocation }) => {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  const [showEditLogForm, setShowEditLogForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const deviceLogs = useDeviceLogsData(deviceName);

  useEffect(() => {
    if (!isEmpty(deviceLogs)) {
      setLogs(deviceLogs);
    } else {
      dispatch(forcedLoadDeviceMaintenanceLogs(deviceName));
    }
  }, [deviceLogs, dispatch, deviceName]);

  const handleAddLog = () => {
    setShowAddLogForm(true);
  };

  const handleEditLog = (log) => {
    setSelectedLog(log);
    setShowEditLogForm(true);
  };

  const handleDeleteLog = async (logId) => {
    const confirm = window.confirm('Are you sure you want to delete this log?');
    if (confirm) {
      setLoading(true);
      dispatch(setLoader(true));

      try {
        await deleteMaintenanceLogApi(logId);
        dispatch(
          updateMainAlert({
            message: 'Log deleted successfully',
            show: true,
            severity: 'success'
          })
        );

        setTimeout(async () => {
          dispatch(
            updateMainAlert({
              message: 'Reloading maintenance logs',
              show: true,
              severity: 'info'
            })
          );
          await dispatch(loadDeviceMaintenanceLogs(deviceName));
          dispatch(
            updateMainAlert({
              message: 'Reload successful',
              show: true,
              severity: 'success'
            })
          );
        }, 500);
      } catch (err) {
        dispatch(
          updateMainAlert({
            message: err.response?.data?.message || 'Could not delete log',
            show: true,
            severity: 'error'
          })
        );
      } finally {
        setLoading(false);
        dispatch(setLoader(false));
      }
    }
  };

  const toggleAddLogForm = () => {
    setShowAddLogForm(!showAddLogForm);
  };

  const toggleEditLogForm = () => {
    setShowEditLogForm(!showEditLogForm);
  };

  return (
    <div>
      <TableTitle deviceName={deviceName} />

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{humanReadableDate(log.date)}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>{log.tags.join(', ')}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <EditIcon
                      style={{ cursor: 'pointer', marginRight: '10px' }}
                      onClick={() => handleEditLog(log)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <DeleteIcon
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDeleteLog(log._id)}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container justify="flex-end" style={{ marginTop: '20px' }}>
        <Button variant="contained" color="primary" onClick={handleAddLog}>
          Add Log
        </Button>
      </Grid>

      {showEditLogForm && (
        <EditLog
          deviceName={deviceName}
          deviceLocation={deviceLocation}
          toggleShow={toggleEditLogForm}
          log={selectedLog}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {showAddLogForm && (
        <AddLogForm
          deviceName={deviceName}
          deviceLocation={deviceLocation}
          toggleShow={toggleAddLogForm}
          loading={loading}
          setLoading={setLoading}
        />
      )}
    </div>
  );
};

export default DeviceLogs;
