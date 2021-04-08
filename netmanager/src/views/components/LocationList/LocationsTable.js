import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import LoadingOverlay from "react-loading-overlay";
import "../../../assets/css/location-registry.css";
import { isEmpty } from "underscore";
import { useLocationsData } from "redux/LocationRegistry/selectors";
import { loadLocationsData } from "redux/LocationRegistry/operations";
import CustomMaterialTable from "../Table/CustomMaterialTable";

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    padding: 0,
  },
  inner: {
    minWidth: 1050,
  },
  nameContainer: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  actions: {
    justifyContent: "flex-end",
  },
  link: {
    color: "#3344FF",
    fontFamily: "Open Sans",
  },
  table: {
    fontFamily: "Open Sans",
  },
}));

const LocationsTable = (props) => {
  const { className, users, ...rest } = props;

  const classes = useStyles();

  const dispatch = useDispatch();
  const locations = useLocationsData();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    //code to retrieve all locations data
    if (isEmpty(locations)) {
      setIsLoading(true);
      dispatch(loadLocationsData());
      setIsLoading(false);
    }
  }, []);

  return (
    <LoadingOverlay active={isLoading} spinner text="Loading Locations...">
      <CustomMaterialTable
        className={classes.table}
        userPreferencePaginationKey={"locations"}
        title="Location Registry"
        columns={[
          {
            title: "Reference",
            field: "loc_ref",
            render: (rowData) => (
              <Link
                className={classes.link}
                to={`/locations/${rowData.loc_ref}`}
              >
                {rowData.loc_ref}
              </Link>
            ),
          },
          {
            title: "Name",
            field: "location_name",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Mobility",
            field: "mobility",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Latitude",
            field: "latitude",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Longitude",
            field: "longitude",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Country",
            field: "country",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "District",
            field: "district",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Subcounty",
            field: "subcounty",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Parish",
            field: "parish",
            cellStyle: { fontFamily: "Open Sans" },
          },
        ]}
        data={locations}
        options={{
          search: true,
          exportButton: true,
          searchFieldAlignment: "left",
          showTitle: false,
          searchFieldStyle: {
            fontFamily: "Open Sans",
            border: "2px solid #7575FF",
          },
          headerStyle: {
            fontFamily: "Open Sans",
            fontSize: 16,
            fontWeight: 600,
          },
        }}
      />
    </LoadingOverlay>
  );
};

LocationsTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired,
};

export default LocationsTable;
