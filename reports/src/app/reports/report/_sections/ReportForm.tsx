import React, { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaDownload } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DatePickerWithRange } from "@/components/datePicker";
import { getReportData } from "@/services/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setStartDate,
  setEndDate,
  setReportTitle,
  setReportTemplate,
  setReportData,
} from "@/lib/reduxSlices/reportSlice";
import { v4 as uuidv4 } from "uuid";
import { MdOutlineAppShortcut } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoInformationCircleSharp } from "react-icons/io5";
import { RingLoader } from "react-spinners";
import { useTheme } from "next-themes";
import {
  formatISO,
  addDays,
  differenceInDays,
  subDays,
  subMonths,
  startOfQuarter,
  subQuarters,
} from "date-fns";

const reportTypes = [{ value: "airqo", label: "AirQo Template" }];

const ReportForm = ({ grids }: any) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  const loaderColor = theme === "dark" ? "#fff" : "#013ee6";
  const [isLoading, setIsLoading] = useState(false);
  const [showShortCut, setShowShortCut] = useState(false);
  const [selectedButton, setSelectedButton] = useState("last-7-days");

  // Get today's date and the date 7 days ago
  const today = new Date();
  const lastWeek = addDays(today, -7);

  const [formState, setFormState] = useState({
    title: "",
    reportTemplate: "",
    location: "",
    dateRange: { from: lastWeek, to: today },
  });

  const handleClearForm = () => {
    setFormState({
      title: "",
      reportTemplate: "",
      location: "",
      dateRange: { from: lastWeek, to: today },
    });

    toast.success("Form cleared successfully", {
      style: {
        background: "green",
        color: "white",
        border: "none",
      },
    });
  };

  const handleChange = (name: string, buttonId: string) => (value: any) => {
    setSelectedButton(buttonId);
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { title, reportTemplate, location, dateRange } = formState;

    if (
      !title ||
      !reportTemplate ||
      !location ||
      !dateRange.from ||
      !dateRange.to
    ) {
      toast.error("All fields are required", {
        style: {
          background: "red",
          color: "white",
          border: "none",
        },
      });
      return;
    }

    const diffDays = differenceInDays(dateRange.to, dateRange.from);

    if (diffDays > 120) {
      toast.info("Date range should not exceed 120 days", {
        style: {
          background: "blue",
          color: "white",
          border: "none",
        },
      });
      return;
    }

    setIsLoading(true);

    const data = {
      grid_id: location,
      start_time:
        formatISO(dateRange.from, { representation: "date" }) + "T00:00",
      end_time: formatISO(dateRange.to, { representation: "date" }) + "T00:00",
    };

    try {
      const response = await getReportData(data);

      dispatch(setStartDate(data.start_time));
      dispatch(setEndDate(data.end_time));
      dispatch(setReportTitle(title));
      dispatch(setReportTemplate(reportTemplate));
      dispatch(setReportData(response.airquality));

      toast.success("Finalizing report data", {
        style: {
          background: "green",
          color: "white",
          border: "none",
        },
      });

      setFormState({
        title: "",
        reportTemplate: "",
        location: "",
        dateRange: {
          from: new Date(),
          to: new Date(),
        },
      });

      const uuid = uuidv4();
      const idWithoutHyphens = uuid.replace(/-/g, "");
      const randomId = idWithoutHyphens.substring(0, 16);

      router.push(`/reports/report/${randomId}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data.message ||
        error.message ||
        "Server timeout, please try again later";
      toast.error(errorMessage, {
        style: {
          background: "red",
          color: "white",
          border: "none",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClass = (buttonId: string) => {
    return `${
      selectedButton === buttonId ? "bg-green-700" : "bg-blue-700"
    } hover:${
      selectedButton === buttonId ? "bg-green-800" : "bg-blue-800"
    } text-white p-2`;
  };

  return (
    <>
      {isLoading ? (
        <div className="w-full h-[400px] flex flex-col justify-center text-center items-center">
          <RingLoader color={loaderColor} />
          <p className="text-gray-500 pt-4 dark:text-gray-400">
            Please wait, generating report...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <h1 className="text-2xl font-semibold">Report Details</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="Title">Enter report title</Label>
              <Input
                name="title"
                id="Title"
                type="text"
                className="dark:text-gray-500"
                placeholder="Enter report title"
                value={formState.title}
                onChange={(e) => handleChange("title", "")(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ReportTemplate">Select report template</Label>
              <Select
                name="reportTemplate"
                onValueChange={(value) =>
                  handleChange("reportTemplate", "")(value)
                }
                value={formState.reportTemplate}
              >
                <SelectTrigger
                  id="ReportTemplate"
                  className="dark:text-gray-500"
                >
                  <SelectValue placeholder="Select report template" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-400">
                  <SelectGroup>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="Locations">Select location</Label>
              <Select
                name="location"
                onValueChange={(value) => handleChange("location", "")(value)}
                value={formState.location}
              >
                <SelectTrigger id="Locations" className="dark:text-gray-500">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-400">
                  <SelectGroup>
                    {grids
                      .filter(
                        (grid: any) =>
                          !["country", "region"].includes(grid.admin_level)
                      )
                      .map((type: { _id: string; long_name: string }) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.long_name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Label htmlFor="date">Select date range</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger id="date" type="button">
                      <IoInformationCircleSharp className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-gray-800 dark:text-gray-400 p-2 rounded-md">
                      <p>
                        Select the date range you would like to generate the
                        report for not exceeding 2 months.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {!showShortCut ? (
                <div className="flex flex-wrap gap-2 items-center">
                  <DatePickerWithRange
                    className="dark:text-gray-500"
                    value={formState.dateRange}
                    onChange={(value: any) =>
                      handleChange("dateRange", "")(value)
                    }
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        className="bg-blue-700 hover:bg-blue-800 rounded-md text-white p-2"
                        onClick={() => setShowShortCut(true)}
                      >
                        <MdOutlineAppShortcut size={25} />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-gray-800 dark:text-gray-400 p-2 rounded-md">
                        <p>
                          Click here to show shortcuts for date range selection.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex flex-wrap gap-2 items-center py-4">
                    <span className="text-sm text-gray-500">
                      <b>From:</b> {formState.dateRange.from.toDateString()}
                    </span>
                    <span className="text-sm text-gray-500">-</span>
                    <span className="text-sm text-gray-500">
                      <b>To:</b> {formState.dateRange.to.toDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Button
                      type="button"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-2"
                      onClick={() => setShowShortCut(false)}
                    >
                      Hide Shortcuts
                    </Button>

                    <Button
                      type="button"
                      className={getButtonClass("last-7-days")}
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = subDays(today, 7);
                        handleChange(
                          "dateRange",
                          "last-7-days"
                        )({
                          from: lastWeek,
                          to: today,
                        });
                      }}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      type="button"
                      className={getButtonClass("last-30-days")}
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = subDays(today, 30);
                        handleChange(
                          "dateRange",
                          "last-30-days"
                        )({
                          from: lastMonth,
                          to: today,
                        });
                      }}
                    >
                      Last 30 days
                    </Button>
                    <Button
                      type="button"
                      className={getButtonClass("last-quarter")}
                      onClick={() => {
                        const today = new Date();
                        const startOfCurrentQuarter = startOfQuarter(today);
                        const lastQuarter = subQuarters(
                          startOfCurrentQuarter,
                          1
                        );
                        handleChange(
                          "dateRange",
                          "last-quarter"
                        )({
                          from: lastQuarter,
                          to: startOfCurrentQuarter,
                        });
                      }}
                    >
                      Last Quarter
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 items-center">
              <Button
                type="submit"
                className="p-2 bg-blue-700 hover:bg-blue-800 text-white"
              >
                <FaDownload className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-2"
                onClick={handleClearForm}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ReportForm;
