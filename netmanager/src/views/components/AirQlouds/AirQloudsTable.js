import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import LoadingOverlay from "react-loading-overlay";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";
import { Parser } from "json2csv";
import CustomMaterialTable from "../Table/CustomMaterialTable";
import { useAirQloudsData } from "utils/customHooks/AirQloudsHooks";

// css
import "assets/css/location-registry.css";

const BLANK_SPACE_HOLDER = "-";
const renderCell = (field) => (rowData) => (
  <span>{rowData[field] || BLANK_SPACE_HOLDER}</span>
);

const renderBooleanCell = (field) => (rowData) => (
  <span>
    {(rowData[field] && <span style={{ color: "green" }}>Yes</span>) || (
      <span style={{ color: "red" }}>No</span>
    )}
  </span>
);

const AirQloudsTable = () => {
  const history = useHistory();
  const airqlouds_objects = useAirQloudsData();
  const airqlouds = Object.values(airqlouds_objects);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <LoadingOverlay active={isLoading} spinner text="Loading AirQlouds...">
        <CustomMaterialTable
          pointerCursor
          userPreferencePaginationKey={"airqlouds"}
          title="AirQloud Registry"
          columns={[
            {
              title: "Name",
              field: "long_name",
              render: renderCell("long_name"),
            },
            {
              title: "AirQloud ID",
              field: "name",
              render: renderCell("name"),
              cellStyle: { fontFamily: "Open Sans" },
            },
            {
              title: "Admin Level",
              field: "admin_level",
              render: renderCell("admin_level"),
              cellStyle: { fontFamily: "Open Sans" },
            },
            {
              title: "Is Custom",
              field: "isCustom",
              render: renderBooleanCell("isCustom"),
              cellStyle: { fontFamily: "Open Sans" },
            },
            {
              title: "Site Count",
              field: "district",
              render: (rowData) => (
                <span>{(rowData.sites && rowData.sites.length) || 0}</span>
              ),
              cellStyle: { fontFamily: "Open Sans" },
            },
            {
              title: "Actions",
              render: (rowData) => (
                <div>
                  <Tooltip title="Delete">
                    <DeleteIcon
                      // className={"hover-red"}
                      style={{
                        margin: "0 5px",
                        cursor: "not-allowed",
                        color: "grey",
                      }}
                      // disable deletion for now
                      // onClick={(event) => {
                      //   event.stopPropagation();
                      //   setDelState({
                      //     open: true,
                      //     name: rowData.name || rowData.description,
                      //     id: rowData._id,
                      //   });
                      // }}
                    />
                  </Tooltip>
                </div>
              ),
            },
          ]}
          onRowClick={(event, data) => {
            event.preventDefault();
            history.push(`/airqlouds/${data._id}`);
          }}
          data={airqlouds}
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
            exportCsv: (columns, data) => {
              const fields = ["long_name", "name", "admin_level", "isCustom"];
              const json2csvParser = new Parser({ fields });
              const csv = json2csvParser.parse(data);
              let filename = `airqloud-registry.csv`;
              const link = document.createElement("a");
              link.setAttribute(
                "href",
                "data:text/csv;charset=utf-8,%EF%BB%BF" +
                  encodeURIComponent(csv)
              );
              link.setAttribute("download", filename);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            },
          }}
        />
      </LoadingOverlay>
    </>
  );
};

export default AirQloudsTable;
