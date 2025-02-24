import React, { useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '@/components/Button';
import { useDispatch } from 'react-redux';
import { addOverviewBatch } from '@/lib/store/services/collocation/collocationDataSlice';
import { useRouter } from 'next/router';

const GraphCard = ({ data, secondGraph, batch, device, selectedBatch }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [pollutantConcentration, setPollutantConcentration] = useState('2.5');
  const [isOpen, setIsOpen] = useState(false);
  const [toggleDeviceDropdown, setToggleDeviceDropdown] = useState(false);
  let pollutantOptions = [
    { value: '2.5', label: 'pm2_5' },
    { value: '10', label: 'pm10' },
  ];

  const togglePmConcentration = (newValue) => {
    setPollutantConcentration(newValue);
    setIsOpen(false);
  };

  const tooltipFormatter = (value) => {
    return `${value.toFixed(2)}`;
  };

  const goToReport = () => {
    router.push({
      pathname: `/collocation/reports/${device.device_name}`,
      query: {
        device: device.device_name,
        batchId: device.batch_id,
      },
    });
  };

  const toggleDropdown = (option) => {
    const newArray = [...selectedBatch];
    const currentDeviceIndex = newArray.findIndex(
      (item) => item.device_name === device.device_name,
    );
    if (currentDeviceIndex !== -1) {
      const optionIndex = newArray.findIndex((item) => {
        // Replace 'device_name' with the appropriate key for your objects
        return item.device_name === option.device_name;
      });

      if (optionIndex === -1) {
        newArray[currentDeviceIndex] = option;
        dispatch(addOverviewBatch(newArray));
      }
      setToggleDeviceDropdown(false);
    }
  };

  return (
    <div className="md:grid md:grid-cols-4 md:divide-x divide-grey-150">
      <div className="md:col-span-3 lg:col-span-2">
        <div className="flex flex-col py-4 md:px-4">
          <div className="flex flex-row items-center justify-between">
            <div className="relative">
              <Button
                onClick={() => setToggleDeviceDropdown(!toggleDeviceDropdown)}
              >
                <span className="font-semibold text-base flex justify-between items-center uppercase">
                  {device.device_name}{' '}
                  {batch && batch.length > 1 && (
                    <span className="text-lg ml-2">
                      <MdArrowDropDown />
                    </span>
                  )}
                </span>
              </Button>
              {batch && toggleDeviceDropdown && (
                <ul
                  tabIndex={0}
                  className="absolute z-50 mt-1 ml-6 w-32 border border-gray-200 max-h-60 overflow-y-auto text-sm p-2 shadow bg-white-900 rounded-md bg-white"
                >
                  {batch.map((option) => {
                    if (option.device_name !== device.device_name) {
                      return (
                        <li
                          role="button"
                          key={option.device_name}
                          onClick={() => toggleDropdown(option)}
                          className="text-sm text-grey leading-5"
                        >
                          <a>{option.device_name}</a>
                        </li>
                      );
                    }
                  })}
                </ul>
              )}
            </div>

            <span
              className="text-sm text-blue-950 cursor-pointer"
              onClick={goToReport}
            >
              Full report
            </span>
          </div>
          <div className="flex flex-row">
            <div className="dropdown">
              <Button onClick={() => setIsOpen(!isOpen)}>
                <span className="mt-4 text-sm font-semibold flex justify-between items-center rounded border border-grey-150 p-1">
                  PM<sub>{pollutantConcentration}</sub>
                  <span className="text-lg ml-2">
                    <MdArrowDropDown />
                  </span>
                </span>
              </Button>
              {isOpen && (
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44"
                >
                  {pollutantOptions.map((option) => (
                    <li
                      role="button"
                      key={option.value}
                      onClick={() => togglePmConcentration(option.value)}
                      className="text-sm text-grey leading-5"
                    >
                      <a>{option.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {secondGraph ? (
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart barCategoryGap={30} data={data} barGap={32}>
                  <YAxis
                    label={{
                      value: 'µg/m3',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <XAxis dataKey={'deviceName'} />
                  <CartesianGrid
                    vertical={false}
                    stroke="#000000"
                    strokeOpacity="0.1"
                    strokeWidth={0.5}
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Bar
                    dataKey={
                      pollutantConcentration === '2.5'
                        ? 's1_pm2_5_mean'
                        : 's1_pm10_mean'
                    }
                    fill="#FE9E35"
                    name={'Sensor 01'}
                    background={{ fill: '#F4F6F8' }}
                  />
                  <Bar
                    dataKey={
                      pollutantConcentration === '2.5'
                        ? 's2_pm2_5_mean'
                        : 's2_pm10_mean'
                    }
                    fill="#0CE87E"
                    name={'Sensor 02'}
                    background={{ fill: '#F4F6F8' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={'100%'}
                  height={140}
                  barCategoryGap={30}
                  data={data}
                  barGap={32}
                >
                  <YAxis
                    label={{
                      value: 'µg/m3',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <XAxis dataKey={'deviceName'} />
                  <CartesianGrid
                    vertical={false}
                    stroke="#000000"
                    strokeOpacity="0.1"
                    strokeWidth={0.5}
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Bar
                    dataKey={
                      pollutantConcentration === '2.5'
                        ? 's1_pm2_5_mean'
                        : 's1_pm10_mean'
                    }
                    fill="#FE9E35"
                    name={'Sensor 01'}
                    background={{ fill: '#F4F6F8' }}
                  />
                  <Bar
                    dataKey={
                      pollutantConcentration === '2.5'
                        ? 's2_pm2_5_mean'
                        : 's2_pm10_mean'
                    }
                    fill="#0CE87E"
                    name={'Sensor 02'}
                    background={{ fill: '#F4F6F8' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <div className="md:col-span-1 lg:col-span-2">
        <div className="flex flex-col py-6">
          <div className="w-full border-b border-grey-150 pl-5 pr-6 pb-6">
            <div className="flex flex-row items-center">
              <div
                className={
                  secondGraph
                    ? 'rounded-full w-3 h-3 bg-orange-450 mr-2'
                    : 'rounded-full w-3 h-3 bg-green-550 mr-2'
                }
              ></div>
              <span className="text-sm font-semibold">Sensor 01</span>
            </div>
            <div className="mt-1 mb-4">
              <span className="md:text-5xl font-normal text-3xl">
                {pollutantConcentration === '2.5'
                  ? data?.[0]?.s1_pm2_5_mean?.toFixed(1)
                  : data?.[0]?.s1_pm10_mean?.toFixed(1)}
              </span>
              <span className="opacity-30 font-normal text-3xl">
                <sub>
                  µg/m<sup>3</sup>
                </sub>
              </span>
            </div>
          </div>
          <div className="w-full pl-5 pr-6 py-6">
            <div className="flex flex-row items-center">
              <div
                className={
                  secondGraph
                    ? 'rounded-full w-3 h-3 bg-green-550 mr-2'
                    : 'rounded-full w-3 h-3 bg-green-50 mr-2'
                }
              ></div>
              <span className="text-sm font-semibold">Sensor 02</span>
            </div>
            <div className="mt-1 md:mb-4">
              <span className="md:text-5xl font-normal text-3xl">
                {pollutantConcentration === '2.5'
                  ? data?.[0]?.s2_pm2_5_mean?.toFixed(1)
                  : data?.[0]?.s2_pm10_mean?.toFixed(1)}
              </span>
              <span className="opacity-30 font-normal text-3xl">
                <sub>
                  µg/m<sup>3</sup>
                </sub>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphCard;
