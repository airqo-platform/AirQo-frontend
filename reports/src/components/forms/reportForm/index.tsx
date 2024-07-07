import React, { useState, FormEvent, useEffect } from "react";
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
import { getGridData, getReportData } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch } from "react-redux";
import {
  setStartDate,
  setEndDate,
  setReportTitle,
  setReportTemplate,
  setReportData,
} from "@/lib/reduxSlices/reportSlice";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { RingLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import { MdOutlineAppShortcut } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoInformationCircleSharp } from "react-icons/io5";

const reportTypes = [
  // { value: "airqo", label: "AirQo Template" },
  { value: "standard", label: "Standard Template" },
];

export default function ReportGenerator() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  const loaderColor = theme === "dark" ? "#fff" : "#013ee6";
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [islLoading, setIsLoading] = useState(false);
  const [showShortCut, setShowShortCut] = useState(false);
  const [selectedButton, setSelectedButton] = useState("last-7-days");

  // Get today's date and the date 7 days ago
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { grids, success } = await getGridData();
        if (!success) {
          throw new Error("Error fetching data");
        }
        setGrids(grids);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formState.title ||
      !formState.reportTemplate ||
      !formState.location ||
      !formState.dateRange.from ||
      !formState.dateRange.to
    ) {
      toast.error("All fields are required", {
        style: {
          background: "red",
          color: "white",
          border: "none",
        },
      });
      setIsLoading(false);
      return;
    }

    const from = new Date(formState.dateRange.from);
    const to = new Date(formState.dateRange.to);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 60) {
      toast.info("Date range should not exceed 2 months", {
        style: {
          background: "blue",
          color: "white",
          border: "none",
        },
      });
      setIsLoading(false);
      return;
    }

    const data = {
      grid_id: formState.location,
      start_time:
        new Date(formState.dateRange.from).toISOString().split("T")[0] +
        "T00:00",
      end_time:
        new Date(formState.dateRange.to).toISOString().split("T")[0] + "T00:00",
    };

    getReportData(data)
      .then((response) => {
        dispatch(setStartDate(data.start_time));
        dispatch(setEndDate(data.end_time));
        dispatch(setReportTitle(formState.title));
        dispatch(setReportTemplate(formState.reportTemplate));
        dispatch(setReportData(response.airquality));

        toast.success("Finalizing report data", {
          style: {
            background: "green",
            color: "white",
            border: "none",
          },
        });

        // clear form
        setFormState({
          title: "",
          reportTemplate: "",
          location: "",
          dateRange: {
            from: new Date(),
            to: new Date(),
          },
        });

        // Generate a random ID of 16 characters without hyphens
        const uuid = uuidv4();
        const idWithoutHyphens = uuid.replace(/-/g, "");
        const randomId = idWithoutHyphens.substring(0, 16);

        return router.push(`/report/${randomId}`);
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error(error.response.data.message, {
          style: {
            background: "red",
            color: "white",
            border: "none",
          },
        });
      });
  };

  const getButtonClass = (buttonId: string) => {
    return `${
      selectedButton === buttonId ? "bg-green-700" : "bg-blue-700"
    } hover:${
      selectedButton === buttonId ? "bg-green-800" : "bg-blue-800"
    } text-white p-2`;
  };

  return (
    <div className="report-generator space-y-5">
      {loading ? (
        <>
          <Skeleton className="h-[50px] rounded-md w-[150px] bg-slate-300" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-[50px] rounded-md w-full bg-slate-300"
            />
          ))}
          <div className="flex space-x-3">
            <Skeleton className="h-[50px] rounded-md w-[200px] bg-slate-300" />
            <Skeleton className="h-[50px] rounded-md w-[150px] bg-slate-300" />
          </div>
        </>
      ) : (
        !islLoading && (
          <div className="space-y-5">
            <h1 className="text-2xl font-semibold">Report Details</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="title">Enter report title</Label>
                <Input
                  name="title"
                  id="title"
                  type="text"
                  className="dark:text-gray-500"
                  placeholder="Enter report title"
                  value={formState.title}
                  onChange={(e) => handleChange("title", "")(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reportTemplate">Select report template</Label>
                <Select
                  name="reportTemplate"
                  onValueChange={(value) =>
                    handleChange("reportTemplate", "")(value)
                  }
                  value={formState.reportTemplate}
                >
                  <SelectTrigger className="dark:text-gray-500">
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
                <Label htmlFor="location">Select location</Label>
                <Select
                  name="location"
                  onValueChange={(value) => handleChange("location", "")(value)}
                  value={formState.location}
                >
                  <SelectTrigger className="dark:text-gray-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-400">
                    <SelectGroup>
                      {grids.map((type: { _id: string; long_name: string }) => (
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
                      <TooltipTrigger>
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
                        <TooltipTrigger>
                          <Button
                            type="button"
                            className="bg-blue-700 hover:bg-blue-800 text-white p-2"
                            onClick={() => setShowShortCut(true)}
                          >
                            <MdOutlineAppShortcut size={25} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white dark:bg-gray-800 dark:text-gray-400 p-2 rounded-md">
                          <p>
                            Click here to show shortcuts for date range
                            selection.
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
                        className={getButtonClass("yesterday-today")}
                        onClick={() => {
                          const today = new Date();
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);
                          handleChange(
                            "dateRange",
                            "yesterday-today"
                          )({
                            from: yesterday,
                            to: today,
                          });
                        }}
                      >
                        Yesterday - Today
                      </Button>
                      <Button
                        type="button"
                        className={getButtonClass("last-7-days")}
                        onClick={() => {
                          const today = new Date();
                          const lastWeek = new Date(today);
                          lastWeek.setDate(lastWeek.getDate() - 7);
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
                          const lastMonth = new Date(today);
                          lastMonth.setMonth(lastMonth.getMonth() - 1);
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
        )
      )}
      {islLoading && (
        <div className="w-full h-[400px] flex justify-center items-center">
          <RingLoader color={loaderColor} />
        </div>
      )}
    </div>
  );
}
