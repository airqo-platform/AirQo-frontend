import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import { Button, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import {
  addActiveNetwork,
  fetchNetworkUsers,
  loadUserRoles,
  fetchAvailableNetworkUsers,
  addCurrentUserRole
} from 'redux/AccessControl/operations';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { ArrowDropDown } from '@material-ui/icons';
import 'assets/css/dropdown.css';
import Slide from '@material-ui/core/Slide';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    width: '200px',
    borderRadius: '4px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    maxHeight: '200px',
    overflowY: 'auto'
  }
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center'
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: '#2a3daa',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white
      },

      '&:hover': {
        backgroundColor: 'lightgray',
        '& .MuiListItemText-primary': {
          color: '#175df5'
        }
      }
    },
    '& .MuiListItemText-primary': {
      fontWeight: 'bold',
      color: '#175df5'
    }
  }
}))(MenuItem);

export default function NetworkDropdown({ userNetworks, groupData }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [view, setView] = useState('networks');
  const [open, setOpen] = useState(false);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!userNetworks.length || !activeNetwork) return;

    const networkToSet =
      activeNetwork && userNetworks.find((n) => n._id === activeNetwork._id)
        ? activeNetwork
        : userNetworks[0];

    setSelectedItem(networkToSet);
    dispatch(addActiveNetwork(networkToSet));
    localStorage.setItem('activeNetwork', JSON.stringify(networkToSet));
    localStorage.setItem('currentUserRole', JSON.stringify(networkToSet.role));

    loadNetworkData(networkToSet);
  }, [dispatch, userNetworks]);

  const loadNetworkData = async (network) => {
    try {
      await Promise.all([
        dispatch(loadDevicesData(network.net_name)),
        dispatch(loadSitesData(network.net_name)),
        dispatch(fetchNetworkUsers(network._id)),
        dispatch(loadUserRoles(network._id)),
        dispatch(fetchAvailableNetworkUsers(network._id))
      ]);
    } catch (error) {
      console.error('Error loading network data:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = async (item) => {
    setSelectedItem(item);
    setAnchorEl(null);

    dispatch(addActiveNetwork(item));
    dispatch(addCurrentUserRole(item.role));
    localStorage.setItem('activeNetwork', JSON.stringify(item));
    localStorage.setItem('currentUserRole', JSON.stringify(item.role));

    await loadNetworkData(item);

    const networkChangeEvent = new CustomEvent('networkChanged', { detail: item });
    window.dispatchEvent(networkChangeEvent);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {open && (
          <Slide direction="up" in={open}>
            <div
              style={{
                display: 'flex',
                alignItems: 'left',
                marginRight: '10px',
                position: 'absolute',
                top: '-20px',
                left: '0px'
              }}
            >
              <span
                style={{
                  color: '#175df5',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  backgroundColor: '#f5e942',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                  padding: '2px 5px'
                }}
              >
                {view !== 'networks' ? 'Teams' : 'Networks'}
              </span>
            </div>
          </Slide>
        )}
        <Tooltip title={view === 'networks' ? 'Networks' : 'Teams'} placement="bottom">
          <Button
            aria-controls="dropdown-menu"
            aria-haspopup="true"
            onClick={handleClick}
            variant="contained"
            color="primary"
          >
            {selectedItem && (selectedItem.net_name || selectedItem.grp_title)}
            <ArrowDropDown />
          </Button>
        </Tooltip>
      </div>
      <StyledMenu
        id="dropdown-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {(view === 'networks' ? userNetworks : groupData).length > 0 ? (
          (view === 'networks' ? userNetworks : groupData).map((item) => (
            <StyledMenuItem
              key={item._id}
              onClick={() => handleSelect(item)}
              selected={selectedItem && selectedItem._id === item._id}
            >
              <ListItemText>{view === 'networks' ? item.net_name : item.grp_title}</ListItemText>
            </StyledMenuItem>
          ))
        ) : (
          <StyledMenuItem style={{ color: 'white', textAlign: 'center' }}>
            {view === 'networks' ? 'You do not have any networks' : 'You do not have any teams'}
          </StyledMenuItem>
        )}
        {/* <MenuItem
          onClick={() => {
            setView(view === 'networks' ? 'Teams' : 'networks');
            setOpen(true);
          }}>
          Switch to {view === 'networks' ? 'Teams' : 'Networks'}
        </MenuItem> */}
      </StyledMenu>
    </>
  );
}
