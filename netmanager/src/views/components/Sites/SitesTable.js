import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import LoadingOverlay from "react-loading-overlay";
import { isEmpty } from "underscore";
import { loadSitesData } from "redux/SiteRegistry/operations";
import { useSitesArrayData } from "redux/SiteRegistry/selectors";
import CustomMaterialTable from "../Table/CustomMaterialTable";

// css
import "assets/css/location-registry.css";

const SitesTable = () => {
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

export default SitesTable;
