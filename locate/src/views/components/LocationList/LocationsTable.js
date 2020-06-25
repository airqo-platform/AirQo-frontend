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
import { SearchInput } from "../SearchInput";
import constants from '../../../config/constants.js';

import MaterialTable, { MTablePagination, Paper} from 'material-table';
import { configs } from 'eslint-plugin-prettier';


const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    padding: 0,
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
  const [filterInput, setFilterInput] = useState('');
  const handleFilterChange = filter =>{
    const value = filter.target.value || undefined
    setFilterInput(value);
  }

 

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
      //'http://127.0.0.1:4000/api/v1/location_registry/locations'
      constants.ALL_LOCATIONS_URI
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
      {/*
      <div className={classes.row}>
    
        <SearchInput
          className={classes.searchInput}
          placeholder="Search location"
          modifier='material'
          onChange={handleFilterChange}
          value = {filterInput}
        />
      </div> */}
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent className={classes.content}>
        <PerfectScrollbar>
          {/*
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
                 
                 
                
                    
              </TableBody>
            </Table>
          </div> */}
          <MaterialTable
            className = {classes.table}
            title="Location Registry"
            columns={[
             { title: 'Reference', 
               field: 'loc_ref', 
               render: rowData => <Link className={classes.link} to={`/locations/${rowData.loc_ref}`}>{rowData.loc_ref}</Link>
             },
             { title: 'Name', field: 'location_name', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Mobility', field: 'mobility', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Latitude', field: 'latitude', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Longitude', field: 'longitude', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Country', field: 'country', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'District', field: 'district', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Subcounty', field: 'subcounty', cellStyle:{ fontFamily: 'Open Sans'} },
             { title: 'Parish', field: 'parish', cellStyle:{ fontFamily: 'Open Sans'} },
             //{title: 'Birth Place',mfield: 'birthCity', lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },},
      ]}   
      data = {data}  
      options={{
        search: true,
        exportButton: true,
        searchFieldAlignment: 'left',
        showTitle: false,
        searchFieldStyle: {
          fontFamily: 'Open Sans',
          border: '2px solid #7575FF',
        },
        headerStyle: {
          fontFamily: 'Open Sans',
          fontSize: 16,
          fontWeight: 600
        },
        pageSizeOptions : [10, 25, 50, data.length],
        pageSize: 10
      }}
    />
        </PerfectScrollbar> 
        {/*
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
      {/*<CardActions className = {classes.actions}>*/}
      {/*
      <CardContent className={classes.content}>
      <br/>
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
      </CardContent>
      
      {/*
        <TablePagination 
          component="div"
          count={data.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        /> 

      {/*</CardActions>*/}
      </Card>

    </LoadingOverlay>
  );
};

LocationsTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired
};

export default LocationsTable;
