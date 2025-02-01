"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid } from "@/app/types/grids";
import { Cohort } from "@/app/types/cohorts";

interface AnalyticsAirqloudsDropDownProps {
  isCohort: boolean;
  airqloudsData?: Cohort[] | Grid[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const AnalyticsAirqloudsDropDown = ({
  isCohort,
  airqloudsData = [],
  onSelect,
  selectedId,
}: AnalyticsAirqloudsDropDownProps) => {
  const handleAirqloudChange = (value: string) => {
    const selectedAirqloud = airqloudsData.find((a) => a._id === value);
    if (selectedAirqloud) {
      const storageKey = isCohort ? "activeCohort" : "activeGrid";
      localStorage.setItem(storageKey, JSON.stringify(selectedAirqloud));
      onSelect(value);
    }
  };

  const formatString = (string: string) => {
    return string
      .replace(/_/g, " ")
      .replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })
      .replace("Id", "ID");
  };

  return (
    <div className="relative w-full">
      {airqloudsData.length === 0 ? (
        <p className="text-gray-500">
          {isCohort ? "No Cohorts" : "No Grids"} data available
        </p>
      ) : (
        <Select
          onValueChange={handleAirqloudChange}
          value={selectedId || undefined}
        >
          <SelectTrigger className="w-full h-11 bg-white border-gray-200 text-blue-600 font-bold capitalize">
            <SelectValue
              placeholder={`Select a ${isCohort ? "Cohort" : "Grid"}`}
            >
              {selectedId &&
                formatString(
                  airqloudsData.find((a) => a._id === selectedId)?.name || ""
                )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(airqloudsData) &&
              airqloudsData.map((airqloud) => (
                <SelectItem
                  key={airqloud._id}
                  value={airqloud._id}
                  className="cursor-pointer"
                >
                  <div className="grid grid-cols-12 gap-2 w-full items-center">
                    <div className="col-span-9">
                      <span className="font-medium truncate ">
                        {formatString(airqloud.name)}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 text-right">
                      <span className=" text-sm text-gray-500 text-right">
                        {isCohort
                          ? "devices" in airqloud
                            ? `${airqloud.devices?.length || 0} devices`
                            : ""
                          : "sites" in airqloud
                          ? `${airqloud.sites?.length || 0} sites`
                          : ""}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default AnalyticsAirqloudsDropDown;
