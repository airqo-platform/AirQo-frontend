'use client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { BlobProvider } from '@react-pdf/renderer';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import React, { useMemo } from 'react';
import { AiOutlineFilePdf } from 'react-icons/ai';
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
import { formatDate } from '@/lib/util';
import { useAppSelector } from '@/lib/utils';

interface ReportRowProps {
  label: string;
  value: string | React.ReactNode;
  isLast?: boolean;
}

const ReportRow: React.FC<ReportRowProps> = ({ label, value, isLast }) => (
  <div
    className={`flex py-4 ${
      !isLast ? 'border-b border-gray-300 dark:border-gray-600' : ''
    } last:border-b-0`}
  >
    <span className="font-medium mr-4 w-[200px] text-xl text-gray-800 dark:text-white">
      {label}:
    </span>
    <span className="text-green-700 dark:text-green-400">{value}</span>
  </div>
);

const ReportPage = ({ params }: { params: { reportID: string } }) => {
  const reportData = useAppSelector((state) => state.report);
  const { theme } = useTheme();
  const loaderColor = theme === 'dark' ? '#fff' : '#013ee6';

  // Formatting dates using memoization for performance improvement
  const formattedStartDate = useMemo(
    () => formatDate(reportData.startDate),
    [reportData.startDate],
  );
  const formattedEndDate = useMemo(() => formatDate(reportData.endDate), [reportData.endDate]);

  return (
    <div>
      <div className="space-y-8 px-8 py-6">
        <Breadcrumb className="w-full py-4 px-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/home" className="text-blue-600 hover:underline">
                Home
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Generate Report</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-white p-8 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            Report Details
          </h2>
          <ReportRow label="Report ID" value={params.reportID} />
          <ReportRow label="Report Title" value={reportData.reportTitle} />
          <ReportRow label="Report Template" value={reportData.reportTemplate} />
          <ReportRow label="From" value={formattedStartDate} />
          <ReportRow label="To" value={formattedEndDate} isLast />
        </div>

        <div>
          <BlobProvider document={<Template1 data={reportData?.reportData} />}>
            {({ url, loading, error }) => {
              if (error) {
                console.error(error);
                return (
                  <p className="text-red-600 text-center font-semibold">
                    An error occurred while generating the report. Please try again later.
                  </p>
                );
              }

              return (
                <div className="flex items-center justify-center space-x-6 mt-8">
                  {loading ? (
                    <div className="flex items-center space-x-4">
                      <ClipLoader color={loaderColor} size={24} />
                      <p className="text-blue-600 dark:text-blue-400">Processing your report...</p>
                    </div>
                  ) : (
                    <>
                      <a
                        href={url || '#'}
                        download={`${reportData.reportTitle.replace(/ /g, '_')}.pdf`}
                        className="no-underline"
                      >
                        <Button className="bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out px-6 py-3 rounded-lg flex items-center">
                          <AiOutlineFilePdf className="mr-2" /> Download Report as PDF
                        </Button>
                      </a>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-400 transition ease-in-out px-6 py-3 rounded-lg">
                            Preview Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-100 p-6 font-bold max-w-4xl rounded-lg shadow-lg">
                          <DialogTitle>
                            <VisuallyHidden>Report Preview</VisuallyHidden>
                          </DialogTitle>
                          <DialogDescription>
                            <VisuallyHidden>
                              This dialog contains a preview of the report.
                            </VisuallyHidden>
                          </DialogDescription>
                          <iframe
                            src={url || ''}
                            className="w-full h-[800px] mt-6 border border-gray-300 rounded-md"
                            title={`${reportData.reportTitle}.pdf`}
                            allow="fullscreen"
                          />
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              );
            }}
          </BlobProvider>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
