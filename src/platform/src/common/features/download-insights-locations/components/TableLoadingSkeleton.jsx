import React from 'react';

const shimmer = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

const TableLoadingSkeleton = ({ rows = 7 }) => {
  return (
    <div className="relative overflow-x-auto border dark:border-gray-700 rounded-xl dark:bg-transparent">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white">
        <thead className="text-xs font-normal border-b capitalize bg-[#f9fafb] dark:bg-transparent dark:border-b dark:border-gray-700 dark:text-white">
          <tr>
            <th scope="col" className="p-4">
              <div className={`w-4 h-4 ${shimmer}`}></div>
            </th>
            <th scope="col" className="py-3">
              <div className={`w-32 h-4 ${shimmer}`}></div>
            </th>
            <th scope="col" className="px-3 py-3">
              <div className={`w-24 h-4 ${shimmer}`}></div>
            </th>
            <th scope="col" className="px-3 py-3">
              <div className={`w-24 h-4 ${shimmer}`}></div>
            </th>
            <th scope="col" className="px-3 py-3">
              <div className={`w-24 h-4 ${shimmer}`}></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="bg-white dark:bg-transparent border-b dark:border-gray-700 hover:dark:bg-gray-800"
            >
              <td className="w-4 p-4">
                <div className={`w-4 h-4 ${shimmer}`}></div>
              </td>
              <td className="py-2">
                <div className="flex items-center">
                  <div className={`mr-3 w-8 h-8 rounded-full ${shimmer}`}></div>
                  <div className={`w-32 h-4 ${shimmer}`}></div>
                </div>
              </td>
              <td className="px-3 py-2">
                <div className={`w-24 h-4 ${shimmer}`}></div>
              </td>
              <td className="px-3 py-2">
                <div className={`w-24 h-4 ${shimmer}`}></div>
              </td>
              <td className="px-3 py-2">
                <div className={`w-24 h-4 ${shimmer}`}></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableLoadingSkeleton;
