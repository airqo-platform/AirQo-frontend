import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import MaterialTable from "material-table";
import { useUserPreferencePaginationData } from "redux/UserPreference/selectors";
import {
  generatePaginateOptions,
  getPaginationOption,
  getPaginationOptionIndexMapper,
} from "utils/pagination";
import { updateUserPreferenceData } from "redux/UserPreference/operators";

export default function ({
  className,
  style,
  userPreferencePaginationKey,
  ...props
}) {
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
    <div className={className || ""} style={style || {}}>
      <MaterialTable {...props} />
    </div>
  );
}
