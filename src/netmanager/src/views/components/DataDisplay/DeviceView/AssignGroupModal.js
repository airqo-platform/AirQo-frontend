import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { assignDeviceToGroup } from 'redux/DeviceRegistry/operations';
import { getGroupsSummaryApi } from 'views/apis/analytics';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { createAlertBarExtraContentFromObject } from '../../../../utils/objectManipulators';
import { Alert } from '@material-ui/lab';
import Select from 'react-select';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: 400,
    padding: theme.spacing(2)
  },
  formControl: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minWidth: '100%'
  },
  selectedGroups: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  chip: {
    margin: theme.spacing(0.5)
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100
  }
}));

const AssignGroupModal = ({ open, onClose, device }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    try {
      const response = await getGroupsSummaryApi();
      setGroups(response.groups || []);
    } catch (err) {
      const errorResponse = err.response && err.response.data;
      const errorMessage = errorResponse && errorResponse.errors && errorResponse.errors.message;
      
      dispatch(
        updateMainAlert({
          message:
            errorMessage ||
            (errorResponse && errorResponse.message) ||
            err.message ||
            'Failed to load groups',
          show: true,
          severity: 'error',
          extra: createAlertBarExtraContentFromObject((errorResponse && errorResponse.errors) || {})
        })
      );
      setError('Failed to load groups');
    }
  };

  useEffect(() => {
    if (device && device.groups) {
      setSelectedGroups(device.groups.map(group => group.grp_title));
    } else {
      setSelectedGroups([]);
    }
    setError('');
  }, [device]);

  const handleRemoveGroup = (groupToRemove) => {
    setSelectedGroups(selectedGroups.filter(group => group !== groupToRemove));
  };

  const handleSubmit = async () => {
    if (!device || !device._id) {
      setError('Invalid device selected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await dispatch(assignDeviceToGroup(device._id, selectedGroups));

      if (result.success) {
        onClose();
        setSelectedGroups([]);
      } else {
        setError(result.error || 'Failed to assign device to group');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedGroups(device && device.groups ? device.groups.map(group => group.grp_title) : []);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Device to Group
        {device && (
          <Typography variant="body2" color="textSecondary">
            Device: {device.name || device.device_name || 'Unknown'}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
            <Typography variant="body2" style={{ marginLeft: 16 }}>
              Loading groups...
            </Typography>
          </div>
        ) : (
          <>
            <FormControl className={classes.formControl}>
              <Select
                fullWidth
                label="Select Group(s)"
                className="reactSelect"
                name="group"
                placeholder="Group(s)"
                value={selectedGroups}
                options={groups.map(group => ({
                  value: group.grp_title,
                  label: group.grp_title
                }))}
                onChange={(options) => setSelectedGroups(options.map(option => option.value))}
                isMulti
                variant="outlined"
                margin="dense"
                required
              />
            </FormControl>

            {selectedGroups.length > 0 && (
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Selected Groups ({selectedGroups.length}):
                </Typography>
                <div className={classes.selectedGroups}>
                  {selectedGroups.map((group) => (
                    <Chip
                      key={group}
                      label={group}
                      onDelete={() => handleRemoveGroup(group)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </div>
              </Box>
            )}

            {error && (
              <Alert severity="error" style={{ marginTop: 16 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Assigning...' : 'Assign to Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignGroupModal;

