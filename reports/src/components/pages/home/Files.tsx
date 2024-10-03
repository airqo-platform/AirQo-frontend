'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { AiOutlineFilePdf } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';

import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils';

interface SavedReport {
  title: string;
  url: string;
  date: string;
}

const Files = () => {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const reports = JSON.parse(
        localStorage.getItem(`savedReports-${session.user.email}`) || '[]',
      );
      setSavedReports(reports);
    }
  }, [session]);

  const handleRemoveReport = (index: number) => {
    if (!session?.user) return;

    const updatedReports = savedReports.filter((_, i) => i !== index);
    localStorage.setItem(
      `savedReports-${session.user.email}`,
      JSON.stringify(updatedReports),
    );
    setSavedReports(updatedReports);
  };

  return (
    <MainLayout>
      <div className="space-y-6 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Saved Reports
        </h1>

        {savedReports.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              You have no saved reports. Go to{' '}
              <Link href="/home" className="text-blue-600 hover:underline">
                Home
              </Link>{' '}
              to generate and save a report.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {savedReports.map((report, index) => (
              <SavedReportItem
                key={index}
                report={report}
                onRemove={() => handleRemoveReport(index)}
              />
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
};

interface SavedReportItemProps {
  report: SavedReport;
  onRemove: () => void;
}

const SavedReportItem: React.FC<SavedReportItemProps> = ({
  report,
  onRemove,
}) => (
  <li className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700">
    <div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <AiOutlineFilePdf className="mr-2" /> {report.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Saved on: {formatDate(report.date)}
      </p>
    </div>
    <div className="flex items-center space-x-4">
      <a
        href={report.url}
        download={`${report.title.replace(/ /g, '_')}.pdf`}
        className="no-underline"
      >
        <Button className="bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out">
          Download
        </Button>
      </a>
      <Button
        onClick={onRemove}
        className="bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition ease-in-out flex items-center"
      >
        <MdDelete className="mr-1" /> Delete
      </Button>
    </div>
  </li>
);

export default Files;
