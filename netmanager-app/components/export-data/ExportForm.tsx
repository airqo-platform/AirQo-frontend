"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, Option } from "react-multi-select-component";
import { useToast } from "@/components/ui/use-toast";
import { ExportType, FormData } from "@/types/export";
import { useSites } from "@/core/hooks/useSites";
import { useCities } from "@/core/hooks/useCities";
import { Site } from "@/core/redux/slices/sitesSlice";
import { City } from "@/core/redux/slices/citiesSlice";
import { Device } from "@/core/redux/slices/deviceSlice";
import { useDevices } from "@/core/hooks/useDevices";
import { DatePicker } from "@/components/ui/date-picker";

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

export default function ExportForm({ exportType }: ExportFormProps) {
    const [loading, setLoading] = useState(false);
    const { sites } = useSites();
    const { cities } = useCities();
    const { devices } = useDevices();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
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
    if (sites?.length) {
      const newSiteOptions = sites.map((site: Site) => ({ value: site._id, label: site.name }));
      if (JSON.stringify(newSiteOptions) !== JSON.stringify(siteOptions)) {
        setSiteOptions(newSiteOptions);
      }
      
    }
    if (cities?.length) {
      const newCityOptions = cities.map((city: City) => ({ value: city._id, label: city.name }));
      if (JSON.stringify(newCityOptions) !== JSON.stringify(cityOptions)) {
        setCityOptions(newCityOptions);
      }
    }
    
    if (devices?.length) {
      const newDeviceOptions = devices.map((device: Device) => ({ value: device._id, label: device.name }));
      if (JSON.stringify(newDeviceOptions) !== JSON.stringify(deviceOptions)) {
        setDeviceOptions(newDeviceOptions);
      }
    }

  }, [sites, cities, devices, siteOptions, cityOptions, deviceOptions]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    console.log("Exporting data:", { ...data, exportType });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    toast({
      title: "Data exported successfully",
      description: "Your data has been exported and is ready for download.",
    });
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
        return renderMultiSelect("sites", siteOptions, "Select sites", { required: "At least one site must be selected" });
      case "devices":
        return renderMultiSelect("devices", deviceOptions, "Select devices", { required: "At least one device must be selected" });
      case "airqlouds":
        return renderMultiSelect("cities", cityOptions, "Select airqlouds", { required: "At least one airqloud must be selected" });
      case "regions":
        return renderMultiSelect("regions", cityOptions, "Select regions", { required: "At least one region must be selected" });
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <DatePicker value={field.value ? new Date(field.value) : undefined} onChange={field.onChange} disabled={field.disabled} />

          )}
        />
        <Controller
          name="endDate"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <DatePicker value={field.value ? new Date(field.value) : undefined} onChange={field.onChange} disabled={field.disabled} />

          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderFieldBasedOnTab()}
        {renderMultiSelect("pollutants", pollutantOptions, "Select pollutants", { required: "At least one pollutant must be selected" })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderSelect("frequency", options.frequency, "Select frequency", { required: "Frequency is required" })}
        {renderSelect("fileType", options.fileType, "Select file type", { required: "File type is required" })}
      </div>

      {renderSelect("outputFormat", options.outputFormat, "Select output format", { required: "Output format is required" })}
      {renderSelect("dataType", options.dataType, "Select data type", { required: "Data type is required" })}

      <div className="flex justify-center space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Exporting..." : "Export Data"}
        </Button>
        <Button variant="outline" onClick={() => reset()}>
          Reset
        </Button>
      </div>

      {Object.keys(errors).length > 0 && (
        <p className="text-red-500 text-center">Please fill in all the required fields</p>
      )}
    </form>
  );
}
