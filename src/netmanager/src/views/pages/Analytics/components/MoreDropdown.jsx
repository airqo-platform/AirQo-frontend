import React from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Button, Menu, MenuItem } from '@material-ui/core';

const MoreDropdown = ({ dropdownItems, openMenu, handleClickMenu, handleCloseMenu, anchorEl }) => {
  return (
    <>
      <Button
        aria-controls="dropdown-menu"
        aria-haspopup="true"
        onClick={handleClickMenu}
        style={{
          width: '24px',
          height: '44px',
          padding: '0',
          textTransform: 'initial'
        }}
      >
        <MoreVertIcon />
      </Button>
      <Menu
        id="dropdown-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={openMenu}
        onClose={handleCloseMenu}
      >
        {dropdownItems.length > 0 &&
          dropdownItems.map((item, index) => {
            return (
              <MenuItem key={index} onClick={item.onClick}>
                {item.loading ? 'Loading...' : item.title}
              </MenuItem>
            );
          })}
      </Menu>
    </>
  );
};

export default MoreDropdown;
