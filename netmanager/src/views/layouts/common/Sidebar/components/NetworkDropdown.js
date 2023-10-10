import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import { Button, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import {
  addActiveNetwork,
  fetchNetworkUsers,
  loadUserRoles,
  fetchAvailableNetworkUsers
} from 'redux/AccessControl/operations';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { ArrowDropDown } from '@material-ui/icons';
import 'assets/css/dropdown.css';

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

  useEffect(() => {
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
    if (activeNetwork) {
      setSelectedItem(activeNetwork);
    } else {
      setSelectedItem(userNetworks[0]);
      localStorage.setItem('activeNetwork', JSON.stringify(userNetworks[0]));
      dispatch(addActiveNetwork(userNetworks[0]));
      dispatch(addActiveNetwork(userNetworks[0]));
      dispatch(loadDevicesData(userNetworks[0].net_name));
      dispatch(loadSitesData(userNetworks[0].net_name));
      dispatch(fetchNetworkUsers(userNetworks[0]._id));
      dispatch(loadUserRoles(userNetworks[0]._id));
      dispatch(fetchAvailableNetworkUsers(userNetworks[0]._id));
    }
  }, [dispatch, userNetworks]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    let newItem = {
      ...item,
      net_name: item.net_name || item.grp_title
    };
    localStorage.setItem('activeNetwork', JSON.stringify(newItem));
    localStorage.setItem('currentUserRole', JSON.stringify(newItem.role));
    dispatch(loadDevicesData(newItem.net_name));
    dispatch(loadSitesData(newItem.net_name));
    dispatch(fetchNetworkUsers(newItem._id));
    dispatch(fetchAvailableNetworkUsers(newItem._id));
    dispatch(loadUserRoles(newItem._id));
    handleClose();
    window.location.reload();
  };

  return (
    <>
      <Tooltip title={view === 'networks' ? 'Networks' : 'Teams'} placement="bottom">
        <Button
          aria-controls="dropdown-menu"
          aria-haspopup="true"
          onClick={handleClick}
          variant="contained"
          color="primary">
          {selectedItem && (selectedItem.net_name || selectedItem.grp_title)}
          <ArrowDropDown />
        </Button>
      </Tooltip>
      <StyledMenu
        id="dropdown-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        {(view === 'networks' ? userNetworks : groupData).map((item) => (
          <StyledMenuItem
            key={item._id}
            onClick={() => handleSelect(item)}
            selected={selectedItem && selectedItem._id === item._id}>
            <ListItemText>{view === 'networks' ? item.net_name : item.grp_title}</ListItemText>
          </StyledMenuItem>
        ))}
        <MenuItem onClick={() => setView(view === 'networks' ? 'Teams' : 'networks')}>
          Switch to {view === 'networks' ? 'Teams' : 'Networks'}
        </MenuItem>
      </StyledMenu>
    </>
  );
}
