import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import MaterialTable from "material-table";
import PropTypes from "prop-types";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useUserPreferencePaginationData } from "redux/UserPreference/selectors";
import {
  generatePaginateOptions,
  getPaginationOption,
  getPaginationOptionIndexMapper,
} from "utils/pagination";
import { updateUserPreferenceData } from "redux/UserPreference/operators";

const useStyles = makeStyles((theme) => ({
  tableWrapper: {
    "& tbody>.MuiTableRow-root:hover": {
      background: "#EEE",
    },
  },
  cursorPointer: {
    cursor: "pointer",
  },
}));

export default function CustomMaterialTable({
  className,
  style,
  userPreferencePaginationKey,
  pointerCursor,
  ...props
}) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const tableRef = useRef(null);
  const userPreferencePaginationData = useUserPreferencePaginationData();
  const pageSizeOptions = generatePaginateOptions(props.data.length);
  const [defaultPageSize, setDefaultPageSize] = useState(
    getPaginationOption(
      userPreferencePaginationData[userPreferencePaginationKey],
      pageSizeOptions
    )
  );
  const pageSizeMapper = getPaginationOptionIndexMapper(pageSizeOptions);

  useEffect(() => {
    const newPageSize = getPaginationOption(
      userPreferencePaginationData[userPreferencePaginationKey],
      pageSizeOptions
    );
    setDefaultPageSize(newPageSize);
    if (tableRef.current) {
      tableRef.current.dataManager.changePageSize(newPageSize);
    }
  }, [pageSizeOptions]);

  props = {
    ...props,
    tableRef,
    options: {
      ...(props.options || {}),
      pageSizeOptions: pageSizeOptions,
      pageSize: defaultPageSize,
    },
    onChangeRowsPerPage: (pageSize) => {
      const itemsPerPage = pageSizeMapper[pageSize] || defaultPageSize;
      dispatch(
        updateUserPreferenceData("pagination", {
          [userPreferencePaginationKey]: itemsPerPage,
        })
      );
    },
  };
  return (
    <div
      className={
        className ||
        `${classes.tableWrapper} ${pointerCursor ? classes.cursorPointer : ""}`
      }
      style={style || {}}
    >
      <PerfectScrollbar>
        <div className={classes.tableWrapper}>
          <MaterialTable {...props} />
        </div>
      </PerfectScrollbar>
    </div>
  );
}

CustomMaterialTable.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  userPreferencePaginationKey: PropTypes.string,
  pointerCursor: PropTypes.bool,
  data: PropTypes.array,
  options: PropTypes.object,
};
