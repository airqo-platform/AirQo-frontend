'use client';
import {
  formatISO,
  differenceInDays,
  subDays,
  startOfQuarter,
  subQuarters,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useState, FormEvent } from 'react';
import { FaDownload } from 'react-icons/fa';
import { IoInformationCircleSharp } from 'react-icons/io5';
import { MdOutlineAppShortcut } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { DatePickerWithRange } from '@/components/datePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  setStartDate,
  setEndDate,
  setReportTitle,
  setReportTemplate,
  setReportData,
} from '@/lib/reduxSlices/reportSlice';
import { getReportData } from '@/services/api';

const reportTypes = [{ value: 'airqo', label: 'AirQo Air Quality Template' }];

const ReportForm = ({ grids }: any) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showShortCut, setShowShortCut] = useState(false);
  const [selectedButton, setSelectedButton] = useState('last-7-days');

  const today = new Date();
  const lastWeek = subDays(today, 7);

  const [formState, setFormState] = useState({
    title: '',
    reportTemplate: '',
    location: '',
    dateRange: { from: lastWeek, to: today },
  });

  const handleClearForm = () => {
    setFormState({
      title: '',
      reportTemplate: '',
      location: '',
      dateRange: { from: lastWeek, to: today },
    });

    toast.success('Form cleared successfully', {
      style: {
        background: 'green',
        color: 'white',
        border: 'none',
      },
    });
  };

  const handleChange =
    (name: string, buttonId: string = '') =>
    (value: any) => {
      setSelectedButton(buttonId);
      setFormState({
        ...formState,
        [name]: value,
      });
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { title, reportTemplate, location, dateRange } = formState;

    if (!title || !reportTemplate || !location || !dateRange.from || !dateRange.to) {
      toast.error('All fields are required', {
        style: {
          background: 'red',
          color: 'white',
          border: 'none',
        },
      });
      return;
    }

    const diffDays = differenceInDays(dateRange.to, dateRange.from);

    if (diffDays > 120) {
      toast.info('Date range should not exceed 120 days', {
        style: {
          background: 'blue',
          color: 'white',
          border: 'none',
        },
      });
      return;
    }

    setIsLoading(true);

    const data = {
      grid_id: location,
      start_time: formatISO(dateRange.from, { representation: 'date' }) + 'T00:00',
      end_time: formatISO(dateRange.to, { representation: 'date' }) + 'T00:00',
    };

    try {
      const response = await getReportData(data);

      dispatch(setStartDate(data.start_time));
      dispatch(setEndDate(data.end_time));
      dispatch(setReportTitle(title));
      dispatch(setReportTemplate(reportTemplate));
      dispatch(setReportData(response.airquality));

      toast.success('Finalizing report data', {
        style: {
          background: 'green',
          color: 'white',
          border: 'none',
        },
      });

      // Redirect to the newly generated report page immediately after fetching the report data
      const uuid = uuidv4().replace(/-/g, '').substring(0, 16);
      router.push(`/home/${uuid}`);
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast.error('An error occurred while generating the report. Please try again later.', {
        style: {
          background: 'red',
          color: 'white',
          border: 'none',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClass = (buttonId: string) => {
    return `${selectedButton === buttonId ? 'bg-green-700' : 'bg-blue-700'} hover:${
      selectedButton === buttonId ? 'bg-green-800' : 'bg-blue-800'
    } text-white p-2 rounded transition-all duration-200`;
  };

  return (
    <>
      {isLoading ? (
        <div className="w-full h-[400px] flex flex-col justify-center items-center text-center">
          <div className="spinnerLoader"></div>
          <p className="text-gray-500 pt-4 dark:text-gray-400">Please wait, generating report...</p>
        </div>
      ) : (
        <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-md shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Report Details</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="Title">Enter Report Title</Label>
              <Input
                name="title"
                id="Title"
                type="text"
                className="dark:text-gray-500 p-3 rounded-md border border-gray-300 dark:border-gray-600"
                placeholder="Enter report title"
                value={formState.title}
                onChange={(e) => handleChange('title')(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ReportTemplate">Select Report Template</Label>
              <Select
                name="reportTemplate"
                onValueChange={handleChange('reportTemplate')}
                value={formState.reportTemplate}
              >
                <SelectTrigger id="ReportTemplate" className="dark:text-gray-500 p-3 rounded-md">
                  <SelectValue placeholder="Select report template" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-400 rounded-md shadow-sm">
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

            <div className="space-y-2">
              <Label htmlFor="Locations">Select Location</Label>
              <Select
                name="location"
                onValueChange={handleChange('location')}
                value={formState.location}
              >
                <SelectTrigger id="Locations" className="dark:text-gray-500 p-3 rounded-md">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-400 rounded-md shadow-sm">
                  <SelectGroup>
                    {grids
                      .filter((grid: any) => !['country'].includes(grid.admin_level))
                      .map((type: { _id: string; long_name: string }) => (
                        <SelectItem key={type._id} value={type._id} className="cursor-pointer">
                          {type.long_name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Label htmlFor="date">Select Date Range</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger id="date" type="button">
                      <IoInformationCircleSharp className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-gray-800 dark:text-gray-400 p-2 rounded-md shadow-sm">
                      <p>
                        Select the date range you would like to generate the report for. The date
                        range should not exceed 120 days.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {!showShortCut ? (
                <div className="flex items-center gap-2">
                  <DatePickerWithRange
                    className="dark:text-gray-500"
                    value={formState.dateRange}
                    onChange={handleChange('dateRange')}
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
                      <TooltipContent className="bg-white dark:bg-gray-800 dark:text-gray-400 p-2 rounded-md shadow-sm">
                        <p>Click here to show shortcuts for date range selection.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex flex-wrap gap-2 items-center py-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      <b>From:</b> {formState.dateRange.from.toDateString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
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

                    {[
                      { label: 'Last 7 Days', value: 'last-7-days', from: subDays(today, 7) },
                      { label: 'Last 30 Days', value: 'last-30-days', from: subDays(today, 30) },
                      {
                        label: 'This Month',
                        value: 'this-month',
                        from: startOfMonth(today),
                        to: endOfMonth(today),
                      },
                      {
                        label: 'Last Month',
                        value: 'last-month',
                        from: startOfMonth(subMonths(today, 1)),
                        to: endOfMonth(subMonths(today, 1)),
                      },
                      {
                        label: 'Last Quarter',
                        value: 'last-quarter',
                        from: subQuarters(startOfQuarter(today), 1),
                        to: startOfQuarter(today),
                      },
                    ].map((shortcut) => (
                      <Button
                        key={shortcut.value}
                        type="button"
                        className={getButtonClass(shortcut.value)}
                        onClick={() =>
                          handleChange(
                            'dateRange',
                            shortcut.value,
                          )({
                            from: shortcut.from,
                            to: shortcut.to || today,
                          })
                        }
                      >
                        {shortcut.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 items-center">
              <Button
                type="submit"
                className="p-3 bg-blue-700 hover:bg-blue-800 text-white flex items-center rounded-md"
              >
                <FaDownload className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button
                type="button"
                className="p-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
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
