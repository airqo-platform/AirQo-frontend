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
import { loadSitesData } from "redux/SiteRegistry/operations";
import { useSitesData } from "redux/SiteRegistry/selectors";
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

const SitesTable = (props) => {
  const { className, users, ...rest } = props;

  const classes = useStyles();

  const dispatch = useDispatch();
  const sites = useSitesData();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    //code to retrieve all locations data
    if (isEmpty(sites)) {
      setIsLoading(true);
      dispatch(loadSitesData());
      setIsLoading(false);
    }
  }, []);

  return (
    <LoadingOverlay active={isLoading} spinner text="Loading Locations...">
      <CustomMaterialTable
        className={classes.table}
        userPreferencePaginationKey={"sites"}
        title="Site Registry"
        columns={[
          {
            title: "Name",
            field: "name",
            render: (rowData) => (
              <span>
                {rowData.name ||
                  rowData.description ||
                  rowData.formated_name ||
                  rowData.generated_name}
              </span>
            ),
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
            title: "County",
            field: "county",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "District",
            field: "district",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Region",
            field: "region",
            cellStyle: { fontFamily: "Open Sans" },
          },
          {
            title: "Altitude",
            field: "altitude",
            cellStyle: { fontFamily: "Open Sans" },
          },
        ]}
        data={sites}
        options={{
          search: true,
          exportButton: true,
          searchFieldAlignment: "left",
          showTitle: false,
          searchFieldStyle: {
            fontFamily: "Open Sans",
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

SitesTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired,
};

export default SitesTable;
