"use client";
import React, { useCallback, useMemo, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAppSelector } from "@/lib/hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BlobProvider } from "@react-pdf/renderer";
import Template1 from "@/components/reportTemplates/template1";
import { Parser } from "json2csv";
import { ClipLoader } from "react-spinners";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface IReport {
  reportID: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ReportPage({ params }: { params: IReport }) {
  const reportData = useAppSelector((state) => state.report);
  const { theme } = useTheme();
  const loaderColor = theme === "dark" ? "#fff" : "#013ee6";

  const handleClick = useCallback(async () => {
    try {
      const parser = new Parser();
      const csv = parser.parse(reportData?.reportData);
      const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const csvURL = window.URL.createObjectURL(csvData);
      let tempLink = document.createElement("a");
      tempLink.href = csvURL;
      tempLink.setAttribute(
        "download",
        `${reportData.reportTitle.replace(/ /g, "")}.csv`
      );
      tempLink.click();
    } catch (err) {
      console.error(err);
    }
  }, [reportData]);

  const formattedStartDate = useMemo(
    () => formatDate(reportData.startDate),
    [reportData.startDate]
  );
  const formattedEndDate = useMemo(
    () => formatDate(reportData.endDate),
    [reportData.endDate]
  );

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* <div className="flex justify-end">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleClick}
          >
            Export Raw Data
          </Button>
        </div> */}
        <Breadcrumb className="w-full py-4 px-2 border border-gray-400 rounded-md">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/report" className="text-blue-600">
                Home
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Generate Report</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="text-gray-800 p-3 border dark:text-white border-gray-400 rounded-md">
          <div className="flex">
            <span className="font-medium mr-2 w-[200px] text-xl">
              Report ID:
            </span>
            <span className="text-green-600">{params.reportID}</span>
          </div>
          <div className="flex">
            <span className="font-medium mr-2 w-[200px] text-xl">
              Report title:
            </span>
            <span>{reportData.reportTitle}</span>
          </div>
          <div className="flex">
            <span className="font-medium mr-2 w-[200px] text-xl">
              Report template:
            </span>
            <span>{reportData.reportTemplate}</span>
          </div>
          <div className="flex">
            <span className="font-medium mr-2 w-[200px] text-xl">From:</span>
            <span>{formattedStartDate}</span>
          </div>
          <div className="flex">
            <span className="font-medium mr-2 w-[200px] text-xl">To:</span>
            <span>{formattedEndDate}</span>
          </div>
        </div>
        <div>
          <BlobProvider document={<Template1 data={reportData?.reportData} />}>
            {({ blob, url, loading, error }) => {
              if (error) {
                console.error(error);
                return (
                  <p className="text-red-700">
                    An error occurred while generating the report
                  </p>
                );
              }

              return loading ? (
                <div className="flex items-center space-x-4">
                  <ClipLoader color={loaderColor} size={14} />
                  <p className="text-blue-600 dark:text-blue-400">
                    Processing your report...
                  </p>
                </div>
              ) : (
                <div className="space-x-3">
                  <a
                    href={url ? url : "#"}
                    download={`${reportData.reportTitle.replace(/ /g, "")}.pdf`}
                  >
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                      Download Report
                    </Button>
                  </a>

                  <Dialog>
                    <DialogTrigger className="bg-gray-300 rounded-md hover:bg-gray-400 text-gray-800 p-2">
                      Preview Report
                    </DialogTrigger>
                    <DialogContent className="text-red-500 bg-[#d4d4d7] p-4 font-bold max-w-[800px]">
                      <iframe
                        src={url as string}
                        className="w-full h-[800px] mt-6"
                        title={`${reportData.reportTitle}.pdf`}
                        allow="fullscreen"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              );
            }}
          </BlobProvider>
        </div>
      </div>
    </MainLayout>
  );
}
