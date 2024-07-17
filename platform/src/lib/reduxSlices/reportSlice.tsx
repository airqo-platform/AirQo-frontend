import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

interface ReportState {
  startDate: string;
  endDate: string;
  generatedID: string;
  reportTitle: string;
  reportTemplate: string;
  reportData: any;
}

const initialState: ReportState = {
  startDate: "",
  endDate: "",
  generatedID: "",
  reportTitle: "",
  reportTemplate: "",
  reportData: null,
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    setReportTitle: (state, action: PayloadAction<string>) => {
      state.reportTitle = action.payload;
    },
    setReportTemplate: (state, action: PayloadAction<string>) => {
      state.reportTemplate = action.payload;
    },
    setReportData: (state, action: PayloadAction<any>) => {
      state.reportData = action.payload;
    },
    generateID: (state) => {
      const uuid = uuidv4();
      const idWithoutHyphens = uuid.replace(/-/g, "");
      state.generatedID = idWithoutHyphens.substring(0, 16);
    },
    reset: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setStartDate,
  setEndDate,
  setReportTitle,
  setReportTemplate,
  setReportData,
  generateID,
  reset,
} = reportSlice.actions;

export default reportSlice.reducer;
