import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { IconButton, InputBase, Paper } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  paperRoot: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    marginBottom: '-4px'
  },
  iconButton: {
    padding: 10
  }
}));

const DashboardSearchBar = () => {
  const classes = useStyles();

  return (
    <Paper component="form" className={classes.paperRoot}>
      <InputBase
        className={classes.input}
        placeholder="Search air quality for any location"
        inputProps={{ 'aria-label': 'search google maps' }}
        onMouseDown={() => console.log('mouse enter')}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default DashboardSearchBar;
