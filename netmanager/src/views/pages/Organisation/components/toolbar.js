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
    label: 'Research',
    value: 'research'
  },
  {
    label: 'Environment',
    value: 'environment'
  },
  {
    label: 'Health',
    value: 'health'
  },
  {
    label: 'Agriculture',
    value: 'agriculture'
  },
  {
    label: 'Policy and Governance',
    value: 'policy and governance'
  },
  {
    label: 'Technology',
    value: 'technology'
  }
];

const OrgToolbar = (props) => {
  const classes = useStyles();
  const { className, ...rest } = props;
  const initialState = {
    orgName: '',
    orgEmail: '',
    orgContact: '',
    website: '',
    description: ''
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
    setOpen(false);

    // register organisation

    // update active network

    // refresh the page without reloading

    // go to add new users page
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
                  id="orgName"
                  name="org_name"
                  type="text"
                  label="Organisation name"
                  onChange={onChange}
                  variant="outlined"
                  value={form.orgName}
                  fullWidth
                  style={{ marginBottom: '30px' }}
                  required
                />

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
                  style={{ marginBottom: '30px' }}
                  required
                />

                <TextField
                  id="category"
                  select
                  fullWidth
                  label="Category"
                  style={{ marginTop: '15px', marginBottom: '30px' }}
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
                  style={{ marginBottom: '30px' }}
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
                  style={{ marginBottom: '30px' }}
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
                  style={{ marginBottom: '30px' }}
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
