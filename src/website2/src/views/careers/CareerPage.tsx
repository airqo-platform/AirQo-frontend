'use client';

import { isBefore, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { CustomButton, NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useCareers, useDepartments } from '@/hooks/useApiHooks';

const CareerPage: React.FC = () => {
  const router = useRouter();
  const {
    data: departments,
    isLoading: departmentsLoading,
    isError: departmentsError,
  } = useDepartments();
  const {
    data: careers,
    isLoading: careersLoading,
    isError: careersError,
  } = useCareers();
  const [selectedDepartmentId, setSelectedDepartmentId] =
    useState<string>('all'); // Default to All

  // Add "Open Positions" to the departments list
  const allDepartments = [
    { id: 'all', name: 'Open Positions' },
    ...(departments || []),
  ];

  // Function to check if the position is still open (closing date in the future)
  const isJobOpen = (closingDate: string) => {
    return isBefore(new Date(), parseISO(closingDate));
  };

  // Filter jobs based on the selected department ID and show only open positions
  const filteredJobs = careers?.filter((career: any) => {
    const isOpen = isJobOpen(career.closing_date);
    if (selectedDepartmentId === 'all') return isOpen;
    return isOpen && career.department === selectedDepartmentId;
  });

  // Group the jobs by department and filter only open jobs
  const groupedJobsByDepartment = filteredJobs?.reduce((acc: any, job: any) => {
    const department = departments?.find(
      (dept: any) => dept.id === job.department,
    );
    const departmentName = department ? department.name : 'Open Positions';
    if (!acc[departmentName]) {
      acc[departmentName] = { jobs: [], openCount: 0 };
    }
    acc[departmentName].openCount++;
    acc[departmentName].jobs.push(job);
    return acc;
  }, {});

  // Show loading skeletons
  const isLoading = departmentsLoading || careersLoading;

  return (
    <div className="flex flex-col w-full bg-[#F2F1F6]">
      {/* Header Section */}
      <header
        className="relative h-[300px] lg:h-[400px] mb-16 w-full bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://res.cloudinary.com/dbibjvyhm/image/upload/v1728310706/website/photos/about/careerImage_t91yzh.png")',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-5xl mx-auto w-full space-y-6 px-4 lg:px-8 pt-20 text-white">
          <p className="text-sm">Careers &gt; Welcome to AirQo</p>
          <h1 className="text-4xl lg:text-5xl font-bold mt-2">Join our team</h1>
          <p className="text-sm lg:text-xl mt-4">
            Be part of a team pioneering air quality monitoring in Africa.
            Together, we work passionately towards our vision for Clean Air for
            all African Cities.
          </p>
        </div>
      </header>

      <div className={`space-y-16 w-full ${mainConfig.containerClass}`}>
        {/* Categories Section */}
        <section className="px-4 lg:px-8">
          <h2 className="text-3xl font-normal mb-8">Categories</h2>
          <div className="flex flex-wrap gap-4">
            {isLoading
              ? [...Array(5)].map((_, idx) => (
                  <div
                    key={idx}
                    className="w-32 h-10 bg-gray-300 rounded-full animate-pulse"
                  ></div>
                ))
              : allDepartments.map((department: any) => (
                  <button
                    key={department.id}
                    onClick={() => setSelectedDepartmentId(department.id)}
                    className={`px-6 py-2 rounded-full transition-colors ${
                      selectedDepartmentId === department.id
                        ? 'bg-[#0CE87E] text-black'
                        : 'bg-[#FFFFFF80] text-gray-600 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {department.name}
                  </button>
                ))}
          </div>
        </section>

        {/* Loading Skeleton for Job Listings */}
        {isLoading && (
          <section className="w-full px-4 lg:px-8 space-y-12">
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 lg:p-6 bg-[#E0E0E0] rounded-lg animate-pulse"
                >
                  <div className="h-6 bg-gray-300 w-1/3 rounded"></div>
                  <div className="h-6 bg-gray-300 w-1/6 rounded"></div>
                  <div className="h-6 bg-gray-300 w-8 rounded-full"></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Job Listings Section */}
        {!isLoading && (
          <section className="w-full px-4 lg:px-8 space-y-12">
            {careersError || departmentsError ? (
              <NoData message="Failed to load careers or departments. Please try again later." />
            ) : Object.keys(groupedJobsByDepartment || {}).length === 0 ? (
              <NoData message="No open positions found." />
            ) : (
              Object.keys(groupedJobsByDepartment || {}).map(
                (departmentName) => (
                  <div key={departmentName} className="cursor-pointer">
                    <h3 className="text-2xl text-gray-400 font-semibold mb-4">
                      {departmentName} (
                      {groupedJobsByDepartment[departmentName].openCount})
                    </h3>
                    <div className="space-y-4">
                      {groupedJobsByDepartment[departmentName].jobs.map(
                        (job: any, idx: number) => (
                          <CustomButton
                            key={idx}
                            onClick={() => router.push(`careers/${job.id}`)}
                            className="flex items-center justify-between p-4 lg:p-6 text-black w-full bg-[#FFFFFF80] rounded-lg shadow-sm hover:shadow-md"
                          >
                            <div className="text-left">
                              <h4 className="text-lg font-semibold">
                                {job.title}
                              </h4>
                              <p
                                className={`text-sm ${
                                  isJobOpen(job.closing_date)
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }`}
                              >
                                {isJobOpen(job.closing_date)
                                  ? 'Open'
                                  : 'Closed'}
                              </p>
                            </div>
                            <p className="text-gray-500">{job.type}</p>
                            <span className="text-gray-700 hover:text-black">
                              <FiArrowRight size={24} />
                            </span>
                          </CustomButton>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )
            )}
          </section>
        )}

        {/* Contact Section */}
        <footer className="py-16 text-center">
          <p className="text-xl mb-4">
            Don&apos;t see a position that fits you perfectly?
          </p>
          <p className="text-lg">
            Introduce yourself here <br />
            <a
              href="mailto:careers@airqo.africa"
              className="text-blue-600 underline"
            >
              careers@airqo.africa
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CareerPage;
