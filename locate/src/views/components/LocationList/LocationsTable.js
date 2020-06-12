import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
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
  }
}));

const LocationsTable = props => {
  const { className, users, ...rest } = props;

  const classes = useStyles();

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

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
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <div className={classes.inner}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedLocations.length === users.length}
                      color="primary"
                      indeterminate={
                        selectedLocations.length > 0 &&
                        selectedLocations.length < users.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Location Ref</TableCell>
                  <TableCell>Device Ref</TableCell>
                  <TableCell>Channel ID</TableCell>
                  <TableCell>Host Name</TableCell>
                  <TableCell>Location (country, region, district, subcounty, parish)</TableCell>
                  <TableCell>latitude</TableCell>
                  <TableCell>longitude</TableCell>  
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(0, rowsPerPage).map(user => (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    key={user.id}
                    selected={selectedLocations.indexOf(user.id) !== -1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedLocations.indexOf(user.id) !== -1}
                        color="primary"
                        onChange={event => handleSelectOne(event, user.id)}
                        value="true"
                      />
                    </TableCell>
                    <TableCell>
                        {user.location_ref}
                    </TableCell>
                    <TableCell>
                      {user.address.device_ref}
                    </TableCell>
                    <TableCell>
                      {user.address.channel_id}
                    </TableCell>
                    <TableCell>
                      {user.address.host_name}
                    </TableCell>
                    <TableCell>
                      {user.address.parish}, {user.address.subcounty},{' '}
                      {user.address.district}, {user.address.region}, {' '}
                      {user.address.country}
                    </TableCell>
                    <TableCell>
                      {user.address.latitude}
                    </TableCell>
                    <TableCell>
                      {user.address.longitude}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </PerfectScrollbar>
      </CardContent>
      <CardActions className={classes.actions}>
        <TablePagination
          component="div"
          count={users.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </CardActions>
    </Card>
  );
};

LocationsTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired
};

export default LocationsTable;
