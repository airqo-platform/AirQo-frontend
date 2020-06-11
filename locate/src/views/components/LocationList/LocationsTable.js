import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import axios from 'axios';
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardActions,
  CardContent,
  Avatar,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TablePagination
} from '@material-ui/core';
import LoadingOverlay from 'react-loading-overlay';
import {CSVLink, CSVDownload} from 'react-csv';
import { Button } from "@material-ui/core";
//import './assets/css/location-registry.css';
import '../../../assets/css/location-registry.css';


const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    padding: 0
  },
  inner: {
    minWidth: 1050
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  actions: {
    justifyContent: 'flex-end'
  },
  link: {
    color: '#3344FF',
    fontFamily: 'Open Sans'
    },
  table: {
    fontFamily:'Open Sans'
  }
}));

const LocationsTable = props => {
  const { className, users, ...rest } = props;

  const classes = useStyles();

  const [data, setData] = useState([]);   

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  /*
  useEffect(() => {
    const GetData = async () => {
      const result = await axios.get('http://127.0.0.1:4000/api/v1/location_registry/locations');
      setData(result.data);
    }
    
    GetData();
    console.log('we did it');    
    console.log(data);
  }, []); */

  
  useEffect(() => {
    //code to retrieve all locations data
    setIsLoading(true);
    axios.get(
      //'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/device/graph',
      'http://127.0.0.1:4000/api/v1/location_registry/locations'
    )
    .then(
      res=>{
        setIsLoading(false);
        const ref = res.data;
        console.log(ref);
        setData(ref);

    }).catch(
      console.log
    )
  }, []);

  const handleSelectAll = event => {
    const { users } = props;

    let selectedLocations;

    if (event.target.checked) {
      selectedLocations = users.map(user => user.id);
    } else {
      selectedLocations = [];
    }

    setSelectedLocations(selectedLocations);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedLocations.indexOf(id);
    let newSelectedLocations = [];

    if (selectedIndex === -1) {
      newSelectedLocations = newSelectedLocations.concat(selectedLocations, id);
    } else if (selectedIndex === 0) {
      newSelectedLocations = newSelectedLocations.concat(selectedLocations.slice(1));
    } else if (selectedIndex === selectedLocations.length - 1) {
      newSelectedLocations = newSelectedLocations.concat(selectedLocations.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedLocations = newSelectedLocations.concat(
        selectedLocations.slice(0, selectedIndex),
        selectedLocations.slice(selectedIndex + 1)
      );
    }

    setSelectedLocations(newSelectedLocations);
  };

  const handlePageChange = (event, page) => {
    setPage(page);
  };

  const handleRowsPerPageChange = event => {
    setRowsPerPage(event.target.value);
  };

  return (
    <LoadingOverlay
      active={isLoading}
      spinner
      text='Loading Locations...'
    >
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <div className={classes.inner}>
            <Table className ={classes.table}>
              <TableHead>
                <TableRow>
                  {/*<TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedLocations.length === users.length}
                      color="primary"
                      indeterminate={
                        selectedLocations.length > 0 &&
                        selectedLocations.length < users.length
                      }
                      onChange={handleSelectAll}
                    />
                    </TableCell>*/}
                  <TableCell className = {classes.table}><b>Location Ref</b></TableCell>
                  <TableCell className = {classes.table}><b>Location Name</b></TableCell>
                  <TableCell className = {classes.table}><b>Mobility</b></TableCell>
                  <TableCell className = {classes.table}><b>Latitude</b></TableCell>
                  <TableCell className = {classes.table}><b>Longitude</b></TableCell>
                  <TableCell className = {classes.table}><b>Country</b></TableCell>
                  <TableCell className = {classes.table}><b>District</b></TableCell>
                  <TableCell className = {classes.table}><b>Subcounty</b></TableCell>  
                  <TableCell className = {classes.table}><b>Parish</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
                return (
                <TableRow >
                  <TableCell> 
                    <Link className={classes.link} to={`/locations/${row.loc_ref}`}>{row.loc_ref}</Link>
                  </TableCell>
                  <TableCell className = {classes.table}>{row.location_name}</TableCell>
                  <TableCell className = {classes.table}>{row.mobility}</TableCell>
                  <TableCell className = {classes.table}>{row.latitude}</TableCell>
                  <TableCell className = {classes.table}>{row.longitude}</TableCell>
                  <TableCell className = {classes.table}>{row.country}</TableCell>
                  <TableCell className = {classes.table}>{row.district}</TableCell>
                  <TableCell className = {classes.table}>{row.subcounty}</TableCell>
                  <TableCell className = {classes.table}>{row.parish}</TableCell>
                </TableRow>
                 );  
               })}  
                 
                 
                 
                {/*
                {users.slice(0, rowsPerPage).map(user => (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    key={user.id}
                    selected={selectedLocations.indexOf(user.id) !== -1}
                  >
                    {/*<TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedLocations.indexOf(user.id) !== -1}
                        color="primary"
                        onChange={event => handleSelectOne(event, user.id)}
                        value="true"
                      />
                    </TableCell>
                    <TableCell>
                        {user.loc_ref}
                    </TableCell>
                    <TableCell>
                      {user.location_name}
                    </TableCell>
                    <TableCell>
                      {user.host}
                    </TableCell>
                    <TableCell>
                      {user.latitude}
                    </TableCell>
                    <TableCell>
                      {user.longitude}
                    </TableCell>
                    <TableCell>
                      {user.country}
                    </TableCell>
                    <TableCell>
                      {user.district}
                    </TableCell>
                    <TableCell>
                      {user.subcounty}
                    </TableCell>
                    <TableCell>
                      {user.parish}
                    </TableCell>
                  </TableRow>
                ))}*/}
              </TableBody>
            </Table>
          </div>
        </PerfectScrollbar>
        {/*}
        <br/>
        <CSVLink data={data} 
         align = "center">
        <Button 
        className={classes.exportButton}
        variant="contained" 
        color="primary"
        align = "centre"
        >Export as CSV
        </Button>
              </CSVLink>*/}
      </CardContent>
      <CardActions className = {classes.actions}>
      <CSVLink 
        data={data} 
        filename="locations_data.csv"
        align = "center">
        <Button 
          className={classes.exportButton}
          variant="contained" 
          color="primary"
          align = "centre"
        >Export to CSV
        </Button>
      </CSVLink>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      
        <TablePagination 
          component="div"
          count={data.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />

      </CardActions>

     
     
      
    </Card>
    </LoadingOverlay>
  );
};

LocationsTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired
};

export default LocationsTable;
