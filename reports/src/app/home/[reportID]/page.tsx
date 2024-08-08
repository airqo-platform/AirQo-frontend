'use client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { BlobProvider } from '@react-pdf/renderer';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import React, { useMemo } from 'react';
import { ClipLoader } from 'react-spinners';

import Template1 from '@/components/reportTemplates/template1';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import MainLayout from '@/layout/MainLayout';
import { useAppSelector } from '@/lib/utils';

interface IReport {
  reportID: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function ReportPage({ params }: { params: IReport }) {
  const reportData = useAppSelector((state) => state.report);
  const { theme } = useTheme();
  const loaderColor = theme === 'dark' ? '#fff' : '#013ee6';

  const formattedStartDate = useMemo(
    () => formatDate(reportData.startDate),
    [reportData.startDate],
  );

  const formattedEndDate = useMemo(() => formatDate(reportData.endDate), [reportData.endDate]);

  return (
    <MainLayout>
      <div className="space-y-5">
        <Breadcrumb className="w-full py-4 px-2 border border-gray-400 rounded-md">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/home" className="text-blue-600">
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
            <span className="font-medium mr-2 w-[200px] text-xl">Report ID:</span>
            <span className="text-green-600">{params.reportID}</span>
          </div>
          <div className="flex">
            <span className="font-medium mr-2 w-[200px] text-xl">Report title:</span>
            <span>{reportData.reportTitle}</span>
          </div>
          <div className="flex">
            <span className="font-medium mr-2 w-[200px] text-xl">Report template:</span>
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
            {({ url, loading, error }) => {
              if (error) {
                console.error(error);
                return (
                  <p className="text-red-700">An error occurred while generating the report</p>
                );
              }

              return loading ? (
                <div className="flex items-center space-x-4">
                  <ClipLoader color={loaderColor} size={14} />
                  <p className="text-blue-600 dark:text-blue-400">Processing your report...</p>
                </div>
              ) : (
                <div className="space-x-3">
                  <a
                    href={url ? url : '#'}
                    download={`${reportData.reportTitle.replace(/ /g, '')}.pdf`}
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
                      <DialogTitle>
                        <VisuallyHidden>Report Preview</VisuallyHidden>
                      </DialogTitle>
                      <DialogDescription>
                        <VisuallyHidden>
                          This dialog contains a preview of the report.
                        </VisuallyHidden>
                      </DialogDescription>
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
