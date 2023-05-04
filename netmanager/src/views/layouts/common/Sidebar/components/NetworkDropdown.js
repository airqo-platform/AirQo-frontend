import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { addActiveNetwork } from 'redux/AccessControl/operations';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { ArrowDropDown } from '@material-ui/icons';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5'
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
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem);

export default function NetworkDropdown({ userNetworks }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  useEffect(() => {
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
    if (activeNetwork) {
      setSelectedNetwork(activeNetwork);
    } else {
      localStorage.setItem('activeNetwork', JSON.stringify(userNetworks[0]));
      dispatch(addActiveNetwork(userNetworks[0]));
      dispatch(loadDevicesData(userNetworks[0].net_name));
      dispatch(loadSitesData(userNetworks[0].net_name));
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (network) => {
    setSelectedNetwork(network);
    localStorage.setItem('activeNetwork', JSON.stringify(network));
    dispatch(loadDevicesData(network.net_name));
    dispatch(loadSitesData(network.net_name));
    handleClose();
  };

  return (
    <>
      <Button
        aria-controls="network-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="contained"
        color="primary"
      >
        {selectedNetwork ? selectedNetwork.net_name : 'Select a network'} <ArrowDropDown />
      </Button>
      <StyledMenu
        id="network-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {userNetworks &&
          userNetworks.map((network) => (
            <StyledMenuItem key={network.net_id} onClick={() => handleSelect(network)}>
              <ListItemText>{network.net_name}</ListItemText>
            </StyledMenuItem>
          ))}
      </StyledMenu>
    </>
  );
}
