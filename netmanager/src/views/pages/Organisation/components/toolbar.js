import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  makeStyles,
  Drawer
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { isEmpty } from 'underscore';
import React, { useEffect, useState } from 'react';
import { createNetworkApi } from '../../../apis/accessControl';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import HorizontalLoader from '../../../components/HorizontalLoader/HorizontalLoader';
import CustomMaterialTable from '../../../components/Table/CustomMaterialTable';
import { getNetworksApi, updateNetworkApi } from '../../../apis/accessControl';

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
    width: '100%',
    maxWidth: 650,
    margin: '0 auto',
    padding: '18px 0'
  },
  formTitle: {
    fontWeight: 600,
    textAlign: 'center',
    padding: theme.spacing(2)
  },
  formSubtitle: {
    color: 'grey',
    margin: '3px auto'
  },
  modelWidth: {
    minWidth: 450,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%'
    }
  }
}));

// dropdown component options
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

const options =
  CATEGORIES &&
  CATEGORIES.map((option) => ({
    value: option.value,
    label: option.label
  }));

// dropdown component styles
const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '50px',
    marginBottom: '12px',
    borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : 'black'
    },
    boxShadow: state.isFocused ? '0 0 1px 1px #3f51b5' : null
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
    color: '#000'
  }),
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999
  })
};

const DrawerStyles = makeStyles((theme) => ({
  drawer: {
    width: '300px',
    padding: '12px'
  }
}));

const DrawerComponent = ({ drawerData, showFullDescription, toggleDrawer }) => {
  const classes = DrawerStyles();
  return (
    <Drawer anchor={'right'} open={showFullDescription} onClose={toggleDrawer}>
      {drawerData && (
        <div className={classes.drawer}>
          <Typography variant="h6">Description</Typography>
          <Typography variant="body1">{drawerData.net_description}</Typography>
        </div>
      )}
    </Drawer>
  );
};

const RegisterOrg = ({ props, setLoading, open, setOpen }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const { className, ...rest } = props;
  const [selectedOption, setSelectedOption] = React.useState(null);
  const initialState = {
    orgEmail: '',
    orgContact: '',
    website: '',
    description: '',
    category: CATEGORIES[0].value
  };
  const [form, setState] = useState(initialState);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const clearState = () => {
    setState({ ...initialState });
  };

  const onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;

    setState({
      ...form,
      [id]: value
    });
  };

  // handle dropdown component
  const onChangeDropdown = (selectedOption, { name }) => {
    setState({
      ...form,
      [name]: selectedOption.value
    });
    setSelectedOption(selectedOption);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
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

        setOpen(false);

        // refresh the page without reloading
        setTimeout(() => {
          window.location.reload(false);
        }, 5000);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        setLoading(false);
        if (errors) {
          const errorMessages = createAlertBarExtraContentFromObject(errors);
          setErrorMessage(errorMessages);
          setShowError(true);
        } else {
          setErrorMessage([error.response.data.message]);
          setShowError(true);
        }
      });
  };

  useEffect(() => {
    clearState();
  }, []);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title">
      <Typography variant="h4" className={classes.formTitle}>
        Register new organisation
      </Typography>
      <DialogContent>
        <p className={classes.formSubtitle}>
          Get access to customised tools to help you manage your own air quality network
        </p>
        {showError && (
          <Alert style={{ marginBottom: 10 }} severity="error">
            {errorMessage.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </Alert>
        )}
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

        <Select
          label="Category"
          options={options}
          value={selectedOption}
          onChange={onChangeDropdown}
          styles={customStyles}
          isMulti={false}
          name="category"
          fullWidth
          placeholder="Select category"
        />

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

        <DialogActions>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={onSubmit}
              color="primary"
              variant="contained"
              style={{ marginRight: '-8px' }}>
              Submit
            </Button>
          </div>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const EditOrg = ({ props, setLoading, open, setOpen, selected }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const { className, ...rest } = props;
  const [selectedOption, setSelectedOption] = React.useState(null);
  const initialState = {
    orgEmail: '',
    orgContact: '',
    website: '',
    description: '',
    category: CATEGORIES[0].value
  };

  const [form, setState] = useState(initialState);

  useEffect(() => {
    if (selected) {
      setState({
        orgEmail: selected.net_email,
        orgContact: selected.net_phoneNumber,
        website: selected.net_website,
        description: selected.net_description
      });
      setSelectedOption({
        value: selected.net_category,
        label: selected.net_category
      });
    }
  }, [selected]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const clearState = () => {
    setState({ ...initialState });
  };

  const onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;

    setState({
      ...form,
      [id]: value
    });
  };

  // handle dropdown component
  const onChangeDropdown = (selectedOption, { name }) => {
    setState({
      ...form,
      [name]: selectedOption.value
    });
    setSelectedOption(selectedOption);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const body = {
      net_email: form.orgEmail,
      net_phoneNumber: form.orgContact,
      net_website: form.website,
      net_description: form.description,
      net_category: form.category
    };
    // register organisation
    updateNetworkApi(selected._id, body)
      .then((res) => {
        setLoading(false);
        dispatch(
          updateMainAlert({
            message: 'You have successfully updated your organisation details!',
            show: true,
            severity: 'success'
          })
        );
        setOpen(false);
        // refresh the page without reloading
        setTimeout(() => {
          window.location.reload(false);
        }, 5000);
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        setLoading(false);
        if (errors) {
          const errorMessages = createAlertBarExtraContentFromObject(errors);
          setErrorMessage(errorMessages);
          setShowError(true);
        } else {
          setErrorMessage([error.response.data.message]);
          setShowError(true);
        }
      });
  };

  useEffect(() => {
    clearState();
  }, []);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title">
      <Typography variant="h4" className={classes.formTitle}>
        Edit organisation
      </Typography>

      <DialogContent>
        {showError && (
          <Alert style={{ marginBottom: 10 }} severity="error">
            {errorMessage.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </Alert>
        )}
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

        <Select
          label="Category"
          options={options}
          isLoading={isEmpty(selected)}
          value={selectedOption}
          onChange={onChangeDropdown}
          styles={customStyles}
          isMulti={false}
          name="category"
          fullWidth
          placeholder="Select category"
        />

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

        <DialogActions>
          <Button
            onClick={onSubmit}
            color="primary"
            variant="contained"
            style={{ marginRight: '-8px' }}>
            Save changes
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const OrgToolbar = (props) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [organisationData, setOrganisationData] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDrawer = () => {
    setShowFullDescription(!showFullDescription);
  };

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const userID = currentUser && currentUser._id;

  useEffect(() => {
    setIsLoading(true);
    getNetworksApi()
      .then((res) => {
        setIsLoading(false);
        const { networks } = res;
        networks.map((network) => {
          const { net_manager, ...rest } = network;
          if (net_manager && net_manager._id === userID) {
            setOrganisationData((prevState) => [...prevState, rest]);
          }
        });
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateMainAlert({
            message: 'Something went wrong while fetching your organisation details',
            show: true,
            severity: 'error'
          })
        );
      });
  }, []);

  return (
    <>
      <HorizontalLoader loading={loading} />
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
        <Button onClick={() => setOpen(true)} color="primary" variant="contained">
          Register new organisation
        </Button>
      </div>

      <CustomMaterialTable
        pointerCursor
        userPreferencePaginationKey={'Organisation'}
        title={`Organisation Registry`}
        columns={[
          {
            title: 'Name',
            field: 'net_name'
          },
          {
            title: 'Email',
            field: 'net_email'
          },
          {
            title: 'Contact',
            field: 'net_phoneNumber'
          },
          {
            title: 'Website',
            field: 'net_website'
          },
          {
            title: 'Category',
            field: 'net_category'
          },
          {
            title: 'Description',
            field: 'net_description',
            render: (rowData) => {
              const truncatedDescription =
                rowData.net_description.length > 180
                  ? rowData.net_description.substring(0, 180) + '...'
                  : rowData.net_description;
              return (
                <>
                  <Typography variant="body1">{truncatedDescription}</Typography>
                  {rowData.net_description.length > 180 && (
                    <span
                      style={{
                        color: '#3f51b5'
                      }}
                      onClick={() => {
                        setSelectedOption(rowData);
                        toggleDrawer();
                      }}>
                      Show More
                    </span>
                  )}
                </>
              );
            }
          }
        ]}
        data={organisationData}
        isLoading={isLoading}
        options={{
          actionsColumnIndex: -1,
          pageSize: 10,
          pageSizeOptions: [10, 20, 50, 100],
          headerStyle: {
            color: '#000'
          },
          rowStyle: (rowData) => ({
            backgroundColor: rowData.tableData.id % 2 ? '#EEE' : '#FFF'
          })
        }}
        actions={[
          {
            icon: 'edit',
            tooltip: 'Edit Organisation',
            onClick: (event, rowData) => {
              setOpenEdit(true);
              setSelectedOption(rowData);
            }
          }
        ]}
      />

      <RegisterOrg open={open} setOpen={setOpen} props={props} setLoading={setLoading} />

      <EditOrg
        open={openEdit}
        setOpen={setOpenEdit}
        props={props}
        setLoading={setLoading}
        selected={selectedOption}
      />

      <DrawerComponent
        drawerData={selectedOption}
        showFullDescription={showFullDescription}
        toggleDrawer={toggleDrawer}
      />
    </>
  );
};

export default OrgToolbar;
