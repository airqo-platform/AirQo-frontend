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
import { Skeleton } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  getUserPreferencesApi,
  setUserPreferencesApi,
  deleteUserPreferenceSiteApi
} from 'views/apis/authService';
import { useSitesSummaryData } from 'redux/SiteRegistry/selectors';
import { Alert, Autocomplete } from '@material-ui/lab';
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
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    textAlign: 'center'
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0'
  },
  skeletonCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(1)
  }
}));

const Preferences = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selectedSites, setSelectedSites] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [newSelectedSites, setNewSelectedSites] = useState([]);
  const [manualSiteInput, setManualSiteInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [removingSites, setRemovingSites] = useState(new Set());

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
    setError(null);
    try {
      const response = await getUserPreferencesApi();
      setSelectedSites(response.selected_sites || []);
    } catch (error) {
      console.error('Error fetching selected sites:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'An unknown error occurred';
      setError(`Failed to fetch selected sites: ${errorMessage}`);
      showSnackbar(`Error fetching selected sites: ${errorMessage}`, 'error');
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
    setError(null);
    try {
      const updatedSites = [...selectedSites, ...newSelectedSites];
      await setUserPreferencesApi(updatedSites);
      setSelectedSites(updatedSites);
      setModalOpen(false);
      showSnackbar('Sites updated successfully');
    } catch (error) {
      console.error('Error updating sites:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'An unknown error occurred';
      setError(`Failed to update sites: ${errorMessage}`);
      showSnackbar(`Error updating sites: ${errorMessage}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSite = async (siteToRemove) => {
    if (removingSites.has(siteToRemove.site_id)) {
      return; // Prevent multiple removal attempts for the same site
    }

    setRemovingSites((prev) => new Set(prev).add(siteToRemove.site_id));
    setError(null);

    try {
      await deleteUserPreferenceSiteApi(siteToRemove.site_id);
      setSelectedSites((prevSites) =>
        prevSites.filter((site) => site.site_id !== siteToRemove.site_id)
      );
      showSnackbar('Site removed successfully');
    } catch (error) {
      console.error('Error removing site:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'An unknown error occurred';
      setError(`Failed to remove site: ${errorMessage}`);
      showSnackbar(`Error removing site: ${errorMessage}`, 'error');
    } finally {
      setRemovingSites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(siteToRemove.site_id);
        return newSet;
      });
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleCloseModal();
    }
  };

  const handleTabKey = (e) => {
    const focusableModalElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableModalElements[0];
    const lastElement = focusableModalElements[focusableModalElements.length - 1];

    if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }

    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    }
  };

  const modalRef = React.useRef(null);

  useEffect(() => {
    if (modalOpen) {
      const timer = setTimeout(() => modalRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [modalOpen]);

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
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card className={classes.skeletonCard}>
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rect" width={100} height={36} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : selectedSites.length === 0 ? (
          <div className={classes.emptyState}>
            <AddIcon className={classes.emptyStateIcon} />
            <Typography variant="h6" gutterBottom>
              No sites selected
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              You haven't selected any sites yet. Click the button below to add sites.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              Add Sites
            </Button>
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
                      disabled={removingSites.has(site.site_id)}
                    >
                      {removingSites.has(site.site_id) ? 'Removing...' : 'Remove'}
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
      <Modal
        className={classes.modal}
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          className={classes.modalContent}
          ref={modalRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
        >
          <Typography id="modal-title" variant="h6" gutterBottom>
            Select sites
          </Typography>
          <div id="modal-description" className={classes.srOnly}>
            This modal allows you to select sites to add to your preferences.
          </div>
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
              <TextField
                {...params}
                label="Enter site name"
                variant="outlined"
                aria-label="Site selection"
              />
            )}
          />
          <div className={classes.chipContainer} role="list" aria-label="Selected sites">
            {newSelectedSites.map((site) => (
              <Chip
                key={site.site_id}
                label={`${site.name} (${site.search_name})`}
                onDelete={() => handleRemoveNewSite(site)}
                className={classes.chip}
                role="listitem"
              />
            ))}
          </div>
          <div className={classes.wrapper}>
            <Button
              onClick={handleSaveSites}
              color="primary"
              variant="contained"
              disabled={newSelectedSites.length === 0 || isSaving}
              aria-label="Save selected sites"
            >
              Save Selected Sites
              {isSaving && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </div>
          <Button
            onClick={handleCloseModal}
            color="secondary"
            aria-label="Close modal"
            style={{ position: 'absolute', top: 10, right: 10 }}
          >
            Close
          </Button>
        </div>
      </Modal>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Preferences;
