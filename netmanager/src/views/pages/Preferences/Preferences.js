import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Snackbar,
  Modal,
  Chip,
  CircularProgress,
  Box
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { getUserPreferencesApi, setUserPreferencesApi } from 'views/apis/authService';
import { useSitesSummaryData } from 'redux/SiteRegistry/selectors';
import { Autocomplete } from '@material-ui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { loadSitesSummary } from 'redux/SiteRegistry/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(3)
  },
  title: {
    marginBottom: theme.spacing(3)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(1)
  },
  addCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  addIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2)
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    width: '50%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  inputField: {
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  chip: {
    margin: theme.spacing(0.5)
  },
  autocomplete: {
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  cardContent: {
    padding: theme.spacing(1, 1, 0, 1)
  },
  cardActions: {
    padding: theme.spacing(0, 1, 1, 1),
    justifyContent: 'center'
  },
  siteName: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5)
  },
  siteSearchName: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}));

const Preferences = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selectedSites, setSelectedSites] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newSelectedSites, setNewSelectedSites] = useState([]);
  const [manualSiteInput, setManualSiteInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const allSites = useSitesSummaryData();
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    fetchSelectedSites();
    if (allSites.length === 0 && activeNetwork) {
      dispatch(loadSitesSummary(activeNetwork.net_name));
    }
  }, [dispatch, activeNetwork]);

  const fetchSelectedSites = async () => {
    setIsLoading(true);
    try {
      const response = await getUserPreferencesApi();
      setSelectedSites(response.selected_sites || []);
    } catch (error) {
      console.error('Error fetching selected sites:', error);
      setSnackbarMessage('Error fetching selected sites');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setNewSelectedSites([]);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Filter out already selected sites, ensure unique search_name, and check isOnline status
  const availableSites = useMemo(() => {
    const selectedSiteIds = new Set(selectedSites.map((site) => site.site_id));
    const uniqueSearchNames = new Set();
    return allSites.filter((site) => {
      if (!site.search_name || selectedSiteIds.has(site._id) || !site.isOnline) {
        return false;
      }
      if (uniqueSearchNames.has(site.search_name)) {
        return false;
      }
      uniqueSearchNames.add(site.search_name);
      return true;
    });
  }, [allSites, selectedSites]);

  const handleAddManualSite = (event, newValue) => {
    if (newValue) {
      const { _id, name, search_name } = newValue;
      const newSite = {
        site_id: _id,
        name,
        search_name
      };
      setNewSelectedSites([...newSelectedSites, newSite]);
      setManualSiteInput('');
    }
  };

  const handleRemoveNewSite = (siteToRemove) => {
    setNewSelectedSites(newSelectedSites.filter((site) => site.site_id !== siteToRemove.site_id));
  };

  const handleSaveSites = async () => {
    setIsSaving(true);
    try {
      const updatedSites = [...selectedSites, ...newSelectedSites];
      await setUserPreferencesApi(updatedSites);
      setSelectedSites(updatedSites);
      setModalOpen(false);
      setSnackbarMessage('Sites updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating sites:', error);
      setSnackbarMessage('Error updating sites');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSite = async (siteToRemove) => {
    const updatedSites = selectedSites.filter((site) => site.site_id !== siteToRemove.site_id);
    try {
      await setUserPreferencesApi(updatedSites);
      setSelectedSites(updatedSites);
      setSnackbarMessage('Site removed successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error removing site:', error);
      setSnackbarMessage('Error removing site');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        User Preferences
      </Typography>
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Selected Sites
        </Typography>
        {isLoading ? (
          <div className={classes.loaderContainer}>
            <CircularProgress />
          </div>
        ) : (
          <Grid container spacing={2}>
            {selectedSites.map((site) => (
              <Grid item xs={12} sm={6} md={4} key={site.site_id}>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <Typography variant="subtitle1" className={classes.siteName}>
                      {site.name}
                    </Typography>
                    <Typography variant="body2" className={classes.siteSearchName}>
                      {site.search_name}
                    </Typography>
                  </CardContent>
                  <CardActions className={classes.cardActions}>
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemoveSite(site)}
                      color="secondary"
                      size="small"
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <Card className={classes.addCard} onClick={handleOpenModal}>
                <AddIcon className={classes.addIcon} color="action" />
                <Typography variant="subtitle1">Add Sites</Typography>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
      <Modal className={classes.modal} open={modalOpen} onClose={handleCloseModal}>
        <div className={classes.modalContent}>
          <Typography variant="h6" gutterBottom>
            Select sites
          </Typography>
          <Autocomplete
            className={classes.autocomplete}
            options={availableSites}
            getOptionLabel={(option) => `${option.name} (${option.search_name})`}
            value={null}
            inputValue={manualSiteInput}
            onInputChange={(event, newInputValue) => {
              setManualSiteInput(newInputValue);
            }}
            onChange={handleAddManualSite}
            renderInput={(params) => (
              <TextField {...params} label="Enter site name" variant="outlined" />
            )}
          />
          <div className={classes.chipContainer}>
            {newSelectedSites.map((site) => (
              <Chip
                key={site.site_id}
                label={`${site.name} (${site.search_name})`}
                onDelete={() => handleRemoveNewSite(site)}
                className={classes.chip}
              />
            ))}
          </div>
          <div className={classes.wrapper}>
            <Button
              onClick={handleSaveSites}
              color="primary"
              variant="contained"
              disabled={newSelectedSites.length === 0 || isSaving}
            >
              Save Selected Sites
              {isSaving && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </div>
        </div>
      </Modal>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Preferences;
