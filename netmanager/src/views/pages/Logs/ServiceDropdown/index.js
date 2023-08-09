import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import { Button, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import 'assets/css/dropdown.css';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveService } from 'redux/Logs/operations';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    width: 'auto',
    borderRadius: '4px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: '5px'
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

const ServiceDropdown = ({ services }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedService, setSelectedService] = useState(services[0]);

  useEffect(() => {
    dispatch(setActiveService(selectedService.value));
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (service) => {
    setSelectedService(service);
    dispatch(setActiveService(service.value));
    handleClose();
  };
  return (
    <>
      <Tooltip title="Organizations" placement="bottom">
        <Button
          aria-controls="network-menu"
          aria-haspopup="true"
          onClick={handleClick}
          variant="contained"
          color="primary"
        >
          {selectedService && selectedService.label} <ArrowDropDown />
        </Button>
      </Tooltip>
      <StyledMenu
        id="network-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {services &&
          services.map((service, index) => (
            <StyledMenuItem
              key={index}
              onClick={() => handleSelect(service)}
              selected={selectedService && selectedService.label === service.label}
            >
              <ListItemText>{service.label.toUpperCase()}</ListItemText>
            </StyledMenuItem>
          ))}
      </StyledMenu>
    </>
  );
};

export default ServiceDropdown;
