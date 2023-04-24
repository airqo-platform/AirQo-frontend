import React, { useState } from 'react';
import ArrowDownIcon from '@/icons/Common/arrow_down';
import ArrowUpIcon from '@/icons/Common/arrow_up';
import { useWindowSize } from '@/lib/windowSize';

const CustomTable = ({
  headers,
  data,
  sortableColumns,
  onRowSelect,
  dataTestId,
  activeColumnIndex,
}) => {
  const size = useWindowSize();
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(activeColumnIndex);
  const [sortDirection, setSortDirection] = useState('asc');

  const toggleRow = (rowIndex) => {
    const selectedIndex = selectedRows.indexOf(rowIndex);
    let newSelectedRows = [...selectedRows];

    if (selectedIndex === -1) {
      newSelectedRows.push(rowIndex);
    } else {
      newSelectedRows.splice(selectedIndex, 1);
    }

    setSelectedRows(newSelectedRows);
    onRowSelect(newSelectedRows.map((selectedIndex) => data[selectedIndex]));
  };

  const handleSort = (columnIndex) => {
    if (!sortableColumns.includes(columnIndex)) {
      return;
    }

    if (columnIndex === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data];
  if (sortColumn !== null) {
    sortedData.sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    });
  }

  return (
    <div className='overflow-x-auto'>
      <table
        className='table-fixed border-collapse text-xs text-left w-full my-6'
        data-testid={dataTestId}
      >
        <colgroup>
          <col className='w-[61px]' />
          {headers.map((header, columnIndex) => (
            <col key={header} style={{ width: `${size - 61 / headers.length}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr className='border-b border-b-slate-300 text-black-900'>
            <th className='px-4 py-2'></th>
            {headers.map((header, columnIndex) => (
              <th
                key={header}
                className={`px-4 py-2 font-normal ${
                  sortColumn === columnIndex &&
                  'bg-[#0000000F] flex justify-between items-center cursor-pointer'
                }`}
                onClick={() => handleSort(columnIndex)}
              >
                {header}
                {sortableColumns.includes(columnIndex) && (
                  <>
                    {sortColumn === columnIndex &&
                      (sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className='border-b border-b-slate-300'>
              <td className='px-4 py-2 w-[61px] h-14'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-indigo-600 transition duration-150 ease-in-out'
                  checked={selectedRows.includes(rowIndex)}
                  onChange={() => toggleRow(rowIndex)}
                />
              </td>
              <td className='px-4 py-2'>{row.firstName}</td>
              <td className='px-4 py-2'>{row.lastName}</td>
              <td className='px-4 py-2'>{row.age}</td>
              <td className='px-4 py-2'>{row.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
