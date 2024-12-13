import React from 'react';

const TableLoadingSkeleton = ({ rows = 7 }) => {
  return (
    <div className="relative overflow-x-auto border rounded-xl">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 border-b capitalize bg-[#f9fafb] dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </th>
            <th scope="col" className="py-3 font-normal">
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="w-4 p-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </td>
              <td className="py-2">
                <div className="flex items-center">
                  <span className="p-2 rounded-full bg-gray-200 mr-3 w-8 h-8"></span>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableLoadingSkeleton;
