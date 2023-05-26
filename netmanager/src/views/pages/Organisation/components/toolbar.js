import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  makeStyles
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { createNetworkApi } from '../../../apis/accessControl';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  root: {
    '&$error': {
      color: 'red'
    }
  },
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  },
  modelWidth: {
    minWidth: 450
  }
}));

const CATEGORIES = [
  {
    value: 'business',
    label: 'Business'
  },
  {
    value: 'research',
    label: 'Research'
  },
  {
    value: 'policy',
    label: 'Policy'
  },
  {
    value: 'awareness',
    label: 'Awareness'
  },
  {
    value: 'school',
    label: 'School'
  },
  {
    value: 'others',
    label: 'Others'
  }
];

const OrgToolbar = (props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { className, ...rest } = props;
  const initialState = {
    orgEmail: '',
    orgContact: '',
    website: '',
    description: '',
    category: CATEGORIES[0].value
  };
  const [form, setState] = useState(initialState);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearState = () => {
    setState({ ...initialState });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setState(initialState);
  };

  const onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;

    setState({
      ...form,
      [id]: value
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(form);
    const body = {
      net_email: form.orgEmail,
      net_phoneNumber: form.orgContact,
      net_website: form.website,
      net_description: form.description,
      net_category: form.category
    };
    // register organisation
    createNetworkApi(body)
      .then((res) => {
        setLoading(false);
        dispatch(
          updateMainAlert({
            message:
              "You've successfully registered a new organisation. You can now add users to your organisation and manage your own air quality network!",
            show: true,
            severity: 'success'
          })
        );

        // update active network
        localStorage.setItem(
          'activeNetwork',
          JSON.stringify({
            _id: res.created_network._id,
            net_name: res.created_network.net_name
          })
        );

        // refresh the page without reloading
        window.location.reload(false);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        setLoading(false);
        dispatch(
          updateMainAlert({
            message: error.response && error.response.data && error.response.data.message,
            show: true,
            severity: 'error',
            extra: createAlertBarExtraContentFromObject(errors || {})
          })
        );
        handleClose();
      });
    setOpen(false);
  };

  useEffect(() => {
    clearState();
  }, []);

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.row}>
        <span className={classes.spacer} />
        <div>
          <Button variant="contained" color="primary" onClick={handleClickOpen} disabled={loading}>
            Add organisation
          </Button>
          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Lets get started</DialogTitle>
            <DialogContent>
              <div className={classes.modelWidth}>
                <TextField
                  margin="dense"
                  id="orgEmail"
                  name="org_email"
                  type="email"
                  label="Organisation email"
                  onChange={onChange}
                  variant="outlined"
                  value={form.orgEmail}
                  fullWidth
                  style={{ marginBottom: '12px' }}
                  required
                />

                <TextField
                  id="category"
                  select
                  fullWidth
                  label="Category"
                  style={{ marginTop: '15px', marginBottom: '12px' }}
                  onChange={onChange}
                  SelectProps={{
                    native: true,
                    style: { width: '100%', height: '50px' },
                    MenuProps: {
                      className: classes.menu
                    }
                  }}
                  variant="outlined"
                  isMulti
                >
                  {CATEGORIES &&
                    CATEGORIES.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </TextField>

                <TextField
                  margin="dense"
                  id="orgContact"
                  name="org_contact"
                  type="text"
                  label="Organisation contact"
                  onChange={onChange}
                  variant="outlined"
                  value={form.orgContact}
                  fullWidth
                  style={{ marginBottom: '12px' }}
                  required
                />

                <TextField
                  margin="dense"
                  id="website"
                  label="Website"
                  name="website"
                  type="text"
                  onChange={onChange}
                  value={form.website}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: '12px' }}
                  required
                />

                <TextField
                  margin="dense"
                  id="description"
                  label="Tell us something about your organisation"
                  name="description"
                  type="text"
                  onChange={onChange}
                  value={form.description}
                  variant="outlined"
                  fullWidth
                  style={{ marginBottom: '12px' }}
                  required
                />
              </div>
            </DialogContent>

            <DialogActions>
              <div>
                <Button onClick={handleClose} color="primary" variant="outlined">
                  Cancel
                </Button>
                <Button
                  style={{ margin: '0 15px' }}
                  onClick={onSubmit}
                  color="primary"
                  variant="contained"
                >
                  Submit
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default OrgToolbar;
