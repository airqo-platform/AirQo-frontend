import React, { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import clsx from 'clsx';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardContent,
} from '@material-ui/core';
import LoadingOverlay from 'react-loading-overlay';
import '../../../assets/css/location-registry.css';

import MaterialTable from 'material-table';
import { isEmpty } from "underscore";
import { useLocationsData } from "redux/LocationRegistry/selectors";
import { loadLocationsData } from "redux/LocationRegistry/operations";


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

  const dispatch = useDispatch()
  const locations = useLocationsData()

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [filterInput, setFilterInput] = useState('');
  const handleFilterChange = filter =>{
    const value = filter.target.value || undefined
    setFilterInput(value);
  }
  
  useEffect(() => {
    //code to retrieve all locations data
    if (isEmpty(locations)) {
      setIsLoading(true);
      dispatch(loadLocationsData());
      setIsLoading(false);
    }
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
      ]}   
      data = {locations}
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
        pageSizeOptions : [10, 25, 50, Object.values(locations).length],
        pageSize: 10
      }}
    />
        </PerfectScrollbar>
      </CardContent> 

      </Card>

    </LoadingOverlay>
  );
};

LocationsTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired
};

export default LocationsTable;
