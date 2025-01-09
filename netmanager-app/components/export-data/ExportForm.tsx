"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, Option } from "react-multi-select-component";
import { useToast } from "@/components/ui/use-toast";
import { ExportType, FormData } from "@/types/export";

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
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      startDate: "",
      endDate: "",
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
  const [pollutantOptions, setPollutantOptions] = useState<Option[]>([]);

  useEffect(() => {
    // Simulate fetching options from an API
    setSiteOptions([
      { value: "site1", label: "Site 1" },
      { value: "site2", label: "Site 2" },
      { value: "site3", label: "Site 3" },
    ]);

    setPollutantOptions([
      { value: "pm2.5", label: "PM2.5" },
      { value: "pm10", label: "PM10" },
      { value: "no2", label: "NO2" },
    ]);
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    console.log("Exporting data:", { ...data, exportType });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating an async operation
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <Input type="date" placeholder="Start Date" {...field} />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <Input type="date" placeholder="End Date" {...field} />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderMultiSelect("sites", siteOptions, "Select sites", { required: "At least one site must be selected" })}
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
