import React from "react";
import ErrorBoundary from "../../ErrorBoundary/ErrorBoundary";
import { useReportsData } from "utils/customHooks/ReportsHooks";
import { Button } from "@material-ui/core";
import CustomMaterialTable from "../../components/Table/CustomMaterialTable";
import ConfirmDialog from "../../containers/ConfirmDialog";
import Tooltip from "@material-ui/core/Tooltip";
import EditIcon from "@material-ui/icons/EditOutlined";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

const reportsColumns = [
  {
    title: "Title",
    // render: (data) => <Cell fieldValue={data.long_name} />,
    field: "name",
    width: "80%",
  },
  {
    title: "Actions",
    width: "20%",
    render: (rowData) => (
      <div>
        <Tooltip title="Edit">
          <EditIcon
            className={"hover-blue"}
            style={{ margin: "0 5px" }}
            // onClick={(event) => {
            //   event.preventDefault();
            //   event.stopPropagation();
            //   history.push(`/device/${rowData.name}/edit`);
            // }}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <DeleteIcon
            // className={"hover-red"}
            style={{ margin: "0 5px", cursor: "not-allowed", color: "grey" }}
            // disable deletion for now
            // onClick={(event) => {
            //   event.stopPropagation();
            //   setDelState({ open: true, name: rowData.name });
            // }}
          />
        </Tooltip>
      </div>
    ),
  },
];

const Reports = () => {
  const classes = useStyles();
  const reports = useReportsData();

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            type="submit"
            align="right"
            // onClick={() => setRegisterOpen(true)}
          >
            {" "}
            Add Report
          </Button>
        </div>
        <br />

        <CustomMaterialTable
          title="Reports"
          userPreferencePaginationKey={"reports"}
          columns={reportsColumns}
          data={reports}
          // onRowClick={(event, rowData) => {
          //   event.preventDefault();
          //   return history.push(`/device/${rowData.name}/overview`);
          // }}
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

        {/*<ConfirmDialog*/}
        {/*  open={delDevice.open}*/}
        {/*  title={"Delete a device?"}*/}
        {/*  message={`Are you sure you want to delete this ${delDevice.name} device`}*/}
        {/*  close={() => setDelDevice({ open: false, name: "" })}*/}
        {/*  confirm={handleDeleteDevice}*/}
        {/*  error*/}
        {/*/>*/}
      </div>
    </ErrorBoundary>
  );
};

export default Reports;
