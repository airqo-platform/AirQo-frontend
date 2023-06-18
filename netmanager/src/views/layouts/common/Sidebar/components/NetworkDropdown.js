import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ArrowDropDown } from '@material-ui/icons';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  ListItemText,
  makeStyles
} from '@material-ui/core';
import {
  addActiveNetwork,
  fetchNetworkUsers,
  loadUserRoles,
  fetchAvailableNetworkUsers
} from 'redux/AccessControl/operations';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { loadSitesData } from 'redux/SiteRegistry/operations';

const useStyles = makeStyles((theme) => ({
  listItem: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
    fontWeight: '1rem',
    color: '#175df5'
  },
  listItemText: {
    color: '#175df5'
  },
  selectedListItem: {
    backgroundColor: 'green',
  },
  activeListItem: {
    backgroundColor: 'white',
  }
}));

export default function NetworkDropdown({ userNetworks }) {
  const dispatch = useDispatch();
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
    if (activeNetwork) {
      setSelectedNetwork(activeNetwork);
    } else if (userNetworks.length > 0) {
      setSelectedNetwork(userNetworks[0]);
      localStorage.setItem('activeNetwork', JSON.stringify(userNetworks[0]));
      dispatch(addActiveNetwork(userNetworks[0]));
      dispatch(loadDevicesData(userNetworks[0]?.net_name));
      dispatch(loadSitesData(userNetworks[0]?.net_name));
      dispatch(fetchNetworkUsers(userNetworks[0]?._id));
      dispatch(loadUserRoles(userNetworks[0]?._id));
      dispatch(fetchAvailableNetworkUsers(userNetworks[0]?._id));
    }
  }, []);

  const handleSelect = (network) => {
    setSelectedNetwork(network);
    localStorage.setItem('activeNetwork', JSON.stringify(network));
    dispatch(loadDevicesData(network?.net_name));
    dispatch(loadSitesData(network?.net_name));
    dispatch(fetchNetworkUsers(network?._id));
    dispatch(fetchAvailableNetworkUsers(network?._id));
    setOpenDialog(false);
    window.location.reload();
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
        {selectedNetwork && selectedNetwork.net_name} <ArrowDropDown />
      </Button>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          style: {
            width: '500px'
          }
        }}
      >
        <DialogTitle>Select Network</DialogTitle>
        <DialogContent dividers>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto' }}>
            {userNetworks.map((network) => (
              <ListItem
                key={network.net_id}
                button
                onClick={() => handleSelect(network)}
                className={`${classes.listItem} ${
                  selectedNetwork && selectedNetwork.net_id === network.net_id
                    ? classes.selectedListItem
                    : ''
                } ${selectedNetwork && selectedNetwork.net_id === network.net_id ? classes.activeListItem : ''}`}
                
              >
                <ListItemText primary={network.net_name?.toUpperCase()} />
              </ListItem>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
