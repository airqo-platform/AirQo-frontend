import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import LoadingOverlay from "react-loading-overlay";
import "../../../assets/css/location-registry.css";
import { isEmpty } from "underscore";
import { loadSitesData } from "redux/SiteRegistry/operations";
import { useSitesArrayData } from "redux/SiteRegistry/selectors";
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
  const history = useHistory();
  const dispatch = useDispatch();
  const sites = useSitesArrayData();

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
        pointerCursor
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
        onRowClick={(event, data) => {
          event.preventDefault();
          history.push(`/sites/${data._id}`);
        }}
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
