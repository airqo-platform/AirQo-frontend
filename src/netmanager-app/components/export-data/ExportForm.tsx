"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect, Option } from "react-multi-select-component";
import { useToast } from "@/components/ui/use-toast";
import { ExportType, FormData } from "@/app/types/export";
import { useSites } from "@/core/hooks/useSites";
import { useGrids } from "@/core/hooks/useGrids";
import { Site } from "@/core/redux/slices/sitesSlice";
import { Device } from "@/core/redux/slices/deviceSlice";
import { useDevices } from "@/core/hooks/useDevices";
import { DatePicker } from "@/components/ui/date-picker";
import { dataExport, DataExportForm } from "@/core/apis/analytics";
import { Grid } from "@/app/types/grids";

const pollutantOptions = [
  { value: "pm2.5", label: "PM2.5" },
  { value: "pm10", label: "PM10" },
  { value: "no2", label: "NO2" },
];

interface ExportFormProps {
  exportType: ExportType;
}

const options = {
  frequency: [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ],
  fileType: [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
  ],
  outputFormat: [
    { value: "aqcsv", label: "AQCSV" },
    { value: "airqo-standard", label: "AirQo Standard" },
  ],
  dataType: [
    { value: "calibrated", label: "Calibrated" },
    { value: "raw", label: "Raw" },
  ],
};

export const roundToEndOfDay = (dateISOString: string): Date => {
  const end = new Date(dateISOString);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

const getValues = (options: Option[] | undefined): string[] => {
  return options?.map(option => option.value) || [];
};

export const roundToStartOfDay = (dateISOString: string): Date => {
  const start = new Date(dateISOString);
  start.setUTCHours(0, 0, 0, 1);
  return start;
};

export default function ExportForm({ exportType }: ExportFormProps) {
  const [loading, setLoading] = useState(false);
  const { sites } = useSites();
  const { grids } = useGrids();
  const { devices } = useDevices();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      startDateTime: undefined,
      endDateTime: undefined,
      sites: [],
      pollutants: [],
      frequency: "",
      fileType: "",
      outputFormat: "",
      dataType: "",
    },
  });
  const { toast } = useToast();

  const [siteOptions, setSiteOptions] = useState<Option[]>([]);
  const [cityOptions, setCityOptions] = useState<Option[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<Option[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    if (sites?.length) {
      const newSiteOptions = sites.map((site: Site) => ({
        value: site._id,
        label: site.name,
      }));
      if (
        isSubscribed &&
        JSON.stringify(newSiteOptions) !== JSON.stringify(siteOptions)
      ) {
        setSiteOptions(newSiteOptions);
      }
    }
    if (grids?.length) {
      const newCityOptions = grids.map((grid: Grid) => ({
        value: grid._id,
        label: grid.name,
      }));
      if (
        isSubscribed &&
        JSON.stringify(newCityOptions) !== JSON.stringify(cityOptions)
      ) {
        setCityOptions(newCityOptions);
      }
    }

    if (devices?.length) {
      const newDeviceOptions = (devices as unknown as Device[]).map((device) => ({
        value: device._id,
        label: device.name,
      }));
      if (
        isSubscribed &&
        JSON.stringify(newDeviceOptions) !== JSON.stringify(deviceOptions)
      ) {
        setDeviceOptions(newDeviceOptions);
      }
    }
    return () => {
      isSubscribed = false;
    };
  }, [sites, grids, devices, siteOptions, cityOptions, deviceOptions]);

  const exportData = (data: string, filename: string, type: string) => {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizedFilename;
    a.rel = "noopener";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadData = async (data: DataExportForm) => {
    try {
      const response = await dataExport(data as unknown as DataExportForm);

      const filename = `airquality-data.${data.downloadType}`;

      if (response) {
        if (data.downloadType === "csv") {
          if (typeof response !== "string") {
            throw new Error("Invalid CSV data format.");
          }
          exportData(response, filename, "text/csv;charset=utf-8;");
        }

        if (data.downloadType === "json") {
          const jsonString = JSON.stringify(response.data);
          exportData(jsonString, filename, "application/json");
        }

        toast({
          title: "Data exported successfully",
          description: "Your data has been exported and is ready for download.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error exporting data",
          description:
            "An error occurred while exporting your data. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Error exporting data", error);
      let errorMessage;

      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status: number; data: { status?: string; message?: string } }; request?: unknown; message?: string };
        if (err.response) {
          if (err.response.status >= 500) {
            errorMessage =
              "An error occurred while exporting your data. Please try again later.";
          } else {
            if (err.response.data.status === "success") {
              toast({
                title: "Error exporting data",
                description: "No data found for the selected parameters",
                variant: "default",
              });
              return;
            }
            errorMessage =
              typeof err.response.data.message === "string"
                ? err.response.data.message
                : "An error occurred while downloading data";
          }
        } else if (err.request) {
          errorMessage = "No response received from server";
        } else {
          errorMessage =
            "An error occurred while exporting your data. Please try again later.";
        }
      } else {
        errorMessage = "An error occurred while exporting your data. Please try again later.";
      }

      toast({
        title: "Error exporting data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    if (data.startDateTime > data.endDateTime) {
      toast({
        title: "Invalid date range",
        description: "The start date must be before the end date.",
        variant: "default",
      });
      setLoading(false);
      return;
    }

    const Difference_In_Time =
      new Date(data.endDateTime).getTime() -
      new Date(data.startDateTime).getTime();
    const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    if (Difference_In_Days > 28) {
      toast({
        title: "Invalid date range",
        description:
          "For time periods greater than a month, please reduce the time difference to a week to avoid timeouts!",
        variant: "default",
      });
      setLoading(false);
      return;
    }

    const body: DataExportForm = {
      startDateTime: roundToStartOfDay(data.startDateTime).toISOString(),
      endDateTime: roundToEndOfDay(data.endDateTime).toISOString(),
      sites: getValues(data.sites),
      datatype: data.dataType as "raw" | "calibrated",
      device_names: getValues(data.devices || []),
      pollutants: getValues(data.pollutants),
      frequency: data.frequency as "daily" | "hourly" | "monthly" | "weekly",
      outputFormat: data.outputFormat as "airqo-standard",
      minimum: true,
      downloadType: data.fileType as "csv" | "json"
    };

    await downloadData(body);
  };

  const renderSelect = (
    name: keyof FormData,
    options: Option[],
    placeholder: string,
    rules?: Record<string, unknown>
  ) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <div>
          <Select onValueChange={field.onChange} value={field.value as string}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );

  const renderMultiSelect = (
    name: keyof FormData,
    options: Option[],
    placeholder: string,
    rules?: Record<string, unknown>
  ) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <div>
          <MultiSelect
            options={options}
            value={Array.isArray(field.value) ? field.value : []}
            onChange={field.onChange}
            labelledBy={placeholder}
          />
          {error && <p className="text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );

  const renderFieldBasedOnTab = () => {
    switch (exportType) {
      case "sites":
        return renderMultiSelect("sites", siteOptions, "Select sites", {
          required: "At least one site must be selected",
        });
      case "devices":
        return renderMultiSelect("devices", deviceOptions, "Select devices", {
          required: "At least one device must be selected",
        });
      case "airqlouds":
        return renderMultiSelect("cities", cityOptions, "Select Grids", {
          required: "At least one Grids must be selected",
        });
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startDateTime"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <DatePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={field.onChange}
              disabled={field.disabled}
            />
          )}
        />
        <Controller
          name="endDateTime"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <DatePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={field.onChange}
              disabled={field.disabled}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderFieldBasedOnTab()}
        {renderMultiSelect(
          "pollutants",
          pollutantOptions,
          "Select pollutants",
          { required: "At least one pollutant must be selected" }
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderSelect("frequency", options.frequency, "Select frequency", {
          required: "Frequency is required",
        })}
        {renderSelect("fileType", options.fileType, "Select file type", {
          required: "File type is required",
        })}
      </div>

      {renderSelect(
        "outputFormat",
        options.outputFormat,
        "Select output format",
        { required: "Output format is required" }
      )}
      {renderSelect("dataType", options.dataType, "Select data type", {
        required: "Data type is required",
      })}

      <div className="flex justify-center space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Exporting..." : "Export Data"}
        </Button>
        <Button variant="outline" onClick={() => reset()}>
          Reset
        </Button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div>
          <p className="text-red-500 text-center">
            Please fill in all the required fields
          </p>
        </div>
      )}
    </form>
  );
}
