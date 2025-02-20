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
import LogDetails from './Table';
import {
  forcedLoadDeviceMaintenanceLogs,
  loadDeviceMaintenanceLogs
} from 'redux/DeviceRegistry/operations';
import { useDeviceLogsData } from 'redux/DeviceRegistry/selectors';
import {
  addMaintenanceLogApi,
  updateMaintenanceLogApi,
  deleteMaintenanceLogApi
} from '../../../apis/deviceRegistry';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { CreatableLabelledSelect } from 'views/components/CustomSelects/LabelledSelect';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/EditOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ConfirmDialog from 'views/containers/ConfirmDialog';
import { humanReadableDate } from 'utils/dateTime';
import { setLoading as loadStatus } from 'redux/HorizontalLoader/index';

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
  const createOption = (option) => ({ label: option, value: option });
  const createListOptions = (options) => {
    const extracted = [];

    options.map((option) => extracted.push(createOption(option)));
    return extracted;
  };
  const [maintenanceType, setMaintenanceType] = useState(
    maintenanceTypeMapper[log.maintenanceType] ||
      (log.maintenanceType && createOption(log.maintenanceType)) ||
      null
  );
  const [description, setDescription] = useState(log.description);
  const [tags, setTags] = useState(createListOptions(log.tags || []));
  const [selectedDate, setSelectedDate] = useState(new Date(log.date));

  const createTagOption = (tag) => ({ label: tag, value: tag });

  const tagsOptions = [
    createTagOption('Dust blowing and sensor cleaning'),
    createTagOption('Site update check'),
    createTagOption('Device equipment check'),
    createTagOption('Power circuitry and components works'),
    createTagOption('GPS module works/replacement'),
    createTagOption('GSM module works/replacement'),
    createTagOption('Battery works/replacement'),
    createTagOption('Power supply works/replacement'),
    createTagOption('Antenna works/replacement'),
    createTagOption('Mounts replacement'),
    createTagOption('Software checks/re-installation'),
    createTagOption('PCB works/replacement'),
    createTagOption('Temp/humidity sensor works/replacement'),
    createTagOption('Air quality sensor(s) works/replacement')
  ];

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const extracted_tags = [];
    tags && tags.map((tag) => extracted_tags.push(tag.value));
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const logData = {
      deviceName,
      locationName: deviceLocation,
      date: selectedDate.toISOString(),
      tags: extracted_tags,
      description: description
    };

    // Add user_id only if it exists
    if (currentUser && currentUser._id) {
      logData.user_id = currentUser._id;
    }

    setLoading(true);
    dispatch(loadStatus(true));
    await updateMaintenanceLogApi(log._id, logData)
      .then(async (responseData) => {
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: 'success'
          })
        );
        setTimeout(
          () =>
            dispatch(
              updateMainAlert({
                message: 'reloading maintenance logs',
                show: true,
                severity: 'info'
              })
            ),
          500
        );
        await dispatch(loadDeviceMaintenanceLogs(deviceName));
        dispatch(
          updateMainAlert({
            message: 'reload successful',
            show: true,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message:
              (err.response && err.response.data && err.response.data.message) ||
              'could not update log',
            show: true,
            severity: 'error'
          })
        );
      });
    setLoading(false);
    dispatch(loadStatus(false));
    toggleShow();
  };

  return (
    <Paper style={{ minHeight: '400px', padding: '5px 10px' }}>
      <h4>Edit Log</h4>
      <form>
        <div style={{ margin: '5px 0' }}>
          <TextField
            id="deviceName"
            label="Device Name"
            variant="outlined"
            value={deviceName}
            fullWidth
            disabled
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <TextField
            id="deviceName"
            label="Description"
            variant="outlined"
            multiline
            rows={10}
            fullWidth
            value={description || ''}
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
            onChange={(newValue: any, actionMeta: any) => setTags(newValue)}
          />
        </div>
        <MuiPickersUtilsProvider utils={DateFnsUtils} fullWidth={true}>
          <KeyboardDatePicker
            fullWidth={true}
            disableToolbar
            autoOk
            inputVariant="outlined"
            format="yyyy-MM-dd"
            margin="normal"
            id="maintenanceDate"
            label="Date of Maintenance"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
          />
        </MuiPickersUtilsProvider>

        <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
          <Button variant="contained" onClick={toggleShow}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginLeft: '10px' }}
          >
            Save Changes
          </Button>
        </Grid>
      </form>
    </Paper>
  );
};

const AddLogForm = ({ deviceName, deviceLocation, toggleShow, loading, setLoading }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [maintenanceType, setMaintenanceType] = useState('preventive');

  const createTagOption = (tag) => ({ label: tag, value: tag });

  const tagsOptions = [
    createTagOption('Dust blowing and sensor cleaning'),
    createTagOption('Site update check'),
    createTagOption('Device equipment check'),
    createTagOption('Power circuitry and components works'),
    createTagOption('GPS module works/replacement'),
    createTagOption('GSM module works/replacement'),
    createTagOption('Battery works/replacement'),
    createTagOption('Power supply works/replacement'),
    createTagOption('Antenna works/replacement'),
    createTagOption('Mounts replacement'),
    createTagOption('Software checks/re-installation'),
    createTagOption('PCB works/replacement'),
    createTagOption('Temp/humidity sensor works/replacement'),
    createTagOption('Air quality sensor(s) works/replacement')
  ];

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const extracted_tags = [];
    tags && tags.map((tag) => extracted_tags.push(tag.value));
    const storedData = localStorage.getItem('currentUser');
    if (!storedData) {
      console.error('Error: No user data found in local storage');
      return;
    }

    const parsedData = JSON.parse(storedData);

    const logData = {
      date: selectedDate.toISOString(),
      tags: extracted_tags,
      description: description,
      userName: parsedData.email,
      maintenanceType: maintenanceType,
      email: parsedData.email,
      firstName: parsedData.firstName,
      lastName: parsedData.lastName
    };

    // Add user_id only if it exists
    if (parsedData._id) {
      logData.user_id = parsedData._id;
    }

    setLoading(true);
    dispatch(loadStatus(true));
    await addMaintenanceLogApi(deviceName, logData)
      .then(async (responseData) => {
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: 'success'
          })
        );
        toggleShow();
        setTimeout(
          () =>
            dispatch(
              updateMainAlert({
                message: 'reloading maintenance logs',
                show: true,
                severity: 'info'
              })
            ),
          500
        );
        await dispatch(loadDeviceMaintenanceLogs(deviceName));
        dispatch(
          updateMainAlert({
            message: 'reload successful',
            show: true,
            severity: 'success'
          })
        );
        setTimeout(
          () =>
            dispatch(
              updateMainAlert({
                message: 'reloading maintenance logs',
                show: false,
                severity: 'info'
              })
            ),
          500
        );
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message:
              (err.response && err.response.data && err.response.data.message) ||
              'could not add log',
            show: true,
            severity: 'error'
          })
        );
      });
    setLoading(false);
    dispatch(loadStatus(false));
    toggleShow();
  };

  const handleMaintenanceTypeChange = (event) => {
    setMaintenanceType(event.target.value);
  };

  return (
    <Paper style={{ minHeight: '400px', padding: '5px 10px' }}>
      <h4>Add Log</h4>
      <form>
        <div style={{ margin: '5px 0' }}>
          <TextField
            id="deviceName"
            label="Device Name"
            variant="outlined"
            value={deviceName}
            fullWidth
            disabled
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <TextField
            id="deviceName"
            label="Description"
            variant="outlined"
            multiline
            rows={10}
            fullWidth
            value={description || ''}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div>
          <TextField
            select
            fullWidth
            label="Maintenance Type"
            style={{ margin: '10px 0' }}
            value={maintenanceType}
            onChange={handleMaintenanceTypeChange}
            SelectProps={{
              native: true,
              style: { width: '100%', height: '50px' }
            }}
            required
            variant="outlined"
          >
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
          </TextField>
        </div>
        <div style={{ marginTop: '5px' }}>
          <CreatableLabelledSelect
            label={'Tags'}
            isMulti
            options={tagsOptions}
            isClearable
            value={tags}
            onChange={(newValue: any, actionMeta: any) => setTags(newValue)}
          />
        </div>
        <MuiPickersUtilsProvider utils={DateFnsUtils} fullWidth={true}>
          <KeyboardDatePicker
            fullWidth={true}
            disableToolbar
            autoOk
            inputVariant="outlined"
            format="yyyy-MM-dd"
            margin="normal"
            id="maintenanceDate"
            label="Date of Maintenance"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
          />
        </MuiPickersUtilsProvider>

        <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
          <Button variant="contained" onClick={toggleShow}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginLeft: '10px' }}
          >
            Add Log
          </Button>
        </Grid>
      </form>
    </Paper>
  );
};

export default function DeviceLogs({ deviceName, deviceLocation }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedLog, setSelectedLog] = useState({});
  const [delState, setDelState] = useState({ open: false, data: {} });
  const [show, setShow] = useState({
    logTable: true,
    addLog: false,
    editLog: false
  });
  const maintenanceLogs = useDeviceLogsData(deviceName);

  const logsColumns = [
    {
      title: 'Description',
      field: 'description',
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => <div className={'table-truncate'}>{rowData.description}</div>
    },
    {
      title: 'Tags',
      field: 'tags',
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => {
        return <div className={'table-truncate'}>{rowData.tags && rowData.tags.join(', ')}</div>;
      }
    },
    {
      title: 'Maintenance Type',
      field: 'maintenanceType',
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => <div className={'table-truncate'}>{rowData.maintenanceType}</div>
    },
    {
      title: 'Created On',
      field: 'createdAt',
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => (
        <div className={'table-truncate'}>{humanReadableDate(rowData.createdAt)}</div>
      )
    },
    {
      title: 'Actions',
      render: (rowData) => (
        <div>
          <Tooltip title="Edit">
            <EditIcon
              className={'hover-blue'}
              style={{ margin: '0 5px' }}
              onClick={() => {
                setSelectedLog(rowData);
                setSelectedRow(rowData.tableIndex);
                setShow({ logTable: false, addLog: false, editLog: true });
              }}
              setEditLoading={setLoading}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteIcon
              className={'hover-red'}
              style={{ margin: '0 5px' }}
              onClick={() => setDelState({ open: true, data: rowData })}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  const handleLogDelete = async () => {
    setDelState({ ...delState, open: false });
    if (delState.data._id) {
      setLoading(true);
      dispatch(loadStatus(true));
      await deleteMaintenanceLogApi(delState.data._id)
        .then(async (responseData) => {
          dispatch(
            updateMainAlert({
              message: responseData.message,
              show: true,
              severity: 'success'
            })
          );
          setTimeout(
            () =>
              dispatch(
                updateMainAlert({
                  message: 'refreshing page',
                  show: true,
                  severity: 'info'
                })
              ),
            500
          );

          await dispatch(forcedLoadDeviceMaintenanceLogs(deviceName));

          dispatch(
            updateMainAlert({
              message: 'page refresh successful',
              show: true,
              severity: 'success'
            })
          );

          setTimeout(
            () =>
              dispatch(
                updateMainAlert({
                  message: 'refreshing page',
                  show: false,
                  severity: 'info'
                })
              ),
            500
          );
        })
        .catch((err) => {
          dispatch(
            updateMainAlert({
              message:
                (err.response && err.response.data && err.response.data.message) ||
                'could not delete log',
              show: true,
              severity: 'error'
            })
          );
        })
        .finally(() => {
          setLoading(false);
          dispatch(loadStatus(false));
        });
    }
  };

  useEffect(() => {
    if (isEmpty(maintenanceLogs)) {
      if (typeof deviceName !== 'undefined') {
        dispatch(loadDeviceMaintenanceLogs(deviceName));
      }
    }
  }, []);

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          margin: '10px 0'
        }}
      >
        <Button
          style={{ marginRight: '5px' }}
          variant="contained"
          color="primary"
          disabled={show.logTable}
          onClick={() => setShow({ logTable: true, addLog: false, editLog: false })}
        >
          {' '}
          Logs Table
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={show.addLog}
          onClick={() => {
            setShow({ logTable: false, addLog: true, editLog: false });
          }}
        >
          {' '}
          Add Log
        </Button>
      </div>
      <div>
        {show.logTable && (
          <MaintenanceLogsTable
            title={<TableTitle deviceName={deviceName} />}
            columns={logsColumns}
            data={maintenanceLogs}
            options={{
              pageSize: 10,
              rowStyle: (rowData) => ({
                backgroundColor: selectedRow === rowData.tableData.id ? '#EEE' : '#FFF'
              })
            }}
            detailPanel={[
              {
                tooltip: 'Show Details',
                render: (rowData) => {
                  return (
                    <div style={{ marginLeft: '40px' }}>
                      <TableContainer>
                        <Table aria-label="log-details-table">
                          <TableBody>
                            <TableCell width={270} fullWidth={270}>
                              {rowData.description}
                            </TableCell>
                            <TableCell width={270} fullWidth={270}>
                              {rowData.tags &&
                                rowData.tags.map((tag, key) => {
                                  return (
                                    <li className="li-circle" key={key}>
                                      {tag}
                                    </li>
                                  );
                                })}
                            </TableCell>
                            <TableCell width={270} fullWidth={270}>
                              {humanReadableDate(rowData.nextMaintenance)}
                            </TableCell>
                            <TableCell width={270} fullWidth={270}>
                              {rowData.maintenanceType}
                            </TableCell>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  );
                }
              }
            ]}
          />
        )}
        {show.addLog && (
          <AddLogForm
            deviceName={deviceName}
            deviceLocation={deviceLocation}
            toggleShow={() => setShow({ logTable: true, addLog: false, editLog: false })}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {show.editLog && (
          <EditLog
            deviceName={deviceName}
            deviceLocation={deviceLocation}
            toggleShow={() => setShow({ logTable: true, addLog: false, editLog: false })}
            log={selectedLog}
            updateSelectedRow={setSelectedRow}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
      <ConfirmDialog
        open={delState.open}
        title={'Delete a maintenance log?'}
        message={'Are you sure you want to delete this maintenance log?'}
        close={() => setDelState({ open: false, data: {} })}
        confirm={handleLogDelete}
        error
      />
    </>
  );
}
