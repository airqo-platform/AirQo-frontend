import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import { _useReportsData } from "redux/reports/selectors";
import { loadAllReports } from "redux/reports/operations";

export const useReportsData = () => {
  const reports = _useReportsData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isEmpty(reports)) dispatch(loadAllReports());
  }, []);

  return reports;
};
