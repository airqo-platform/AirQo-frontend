import React, { useEffect, useState } from 'react';
import HeaderNav from '@/components/Layout/header';
import Layout from '@/components/Layout';
import CollocationNone from '@/icons/Collocation/overview.svg';
import ContentBox from '@/components/Layout/content_box';
import { format } from 'date-fns';
import GraphCard from '@/components/Collocation/AddMonitor/Overview/graph_card';
import {
  useGetCollocationStatisticsMutation,
  useGetDeviceStatusSummaryQuery,
} from '../../lib/store/services/collocation';
import { findMatchingDevices } from '@/core/utils/matchingDevices';
import moment from 'moment';

const CollocationOverview = () => {
  const [deviceStatistics, setDeviceStatistics] = useState([]);
  const [matchingDevices, setMatchingDevices] = useState(null);

  // device summary list
  const { data: deviceStatusSummary, isSuccess } = useGetDeviceStatusSummaryQuery();
  let deviceStatusSummaryList = deviceStatusSummary ? deviceStatusSummary.data : [];
  const [getCollocationStatistics] = useGetCollocationStatisticsMutation();

  // matching devices
  useEffect(() => {
    if (deviceStatusSummaryList) {
      setMatchingDevices(findMatchingDevices(deviceStatusSummaryList));
    }
  }, [deviceStatusSummaryList]);

  useEffect(() => {
    const fetchCollocationDeviceStatistics = async () => {
      if (!matchingDevices) return;
      if (matchingDevices.length > 0) {
        const response = await getCollocationStatistics({
          devices: [matchingDevices[0].device_name, matchingDevices[1].device_name],
          startDate: moment(matchingDevices[0].start_date).format('YYYY-MM-DD'),
          endDate: moment(matchingDevices[0].end_date).format('YYYY-MM-DD'),
        });

        if (!response.error) {
          setDeviceStatistics(response.data.data);
        }
      }
    };
    fetchCollocationDeviceStatistics();
  }, [matchingDevices]);

  const transformedStatistics = (statistics) => {
    return Object.entries(statistics).map(([deviceName, deviceData]) => ({
      deviceName,
      s1_pm10_mean: deviceData.s1_pm10_mean,
      s1_pm2_5_mean: deviceData.s1_pm2_5_mean,
      s2_pm10_mean: deviceData.s2_pm10_mean,
      s2_pm2_5_mean: deviceData.s2_pm2_5_mean,
    }));
  };

  return (
    <Layout>
      <HeaderNav category={'Collocation'} component={'Overview'} />
      {deviceStatusSummary ? (
        <ContentBox>
          <div className='grid grid-cols-1 divide-y divide-grey-150'>
            <div className='md:p-6 p-4'>
              <h5 className='font-semibold text-lg'>Today</h5>
              <p className='text-base font-normal opacity-40'>
                {format(new Date(), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 divide-x divide-grey-150'>
              {matchingDevices && (
                <>
                  <GraphCard data={[transformedStatistics(deviceStatistics)[0]]} />
                  <GraphCard
                    data={[transformedStatistics(deviceStatistics)[1]]}
                    secondGraph={true}
                  />
                </>
              )}
            </div>
            <div className='divide-y pt-20'>
              <div className='flex flex-row items-center justify-between p-7 md:px-12'>
                <span className='font-normal text-base opacity-60'>Monitor name</span>
                <span className='font-normal text-base opacity-60 text-left'>End date</span>
              </div>
              {matchingDevices &&
                matchingDevices.map((device) => (
                  <div className='flex flex-row items-center justify-between p-7 md:px-12'>
                    <span className='font-semibold text-base flex justify-between items-center uppercase'>
                      {device.device_name}
                    </span>
                    <span className='text-xl font-normal'>
                      {format(new Date(), 'MMM dd, yyyy')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </ContentBox>
      ) : (
        <ContentBox>
          {/* NO DEVICES COMPONENT */}
          <div className='flex justify-center items-center flex-col mx-auto py-28'>
            <CollocationNone />
            <div className='flex flex-col justify-center text-center mt-10'>
              <h4 className='text-xl font-normal mb-6'>You have no devices under collocation</h4>
              <div>
                <p className='text-grey-300 text-sm font-light max-w-96'>
                  This is where you'll find quick highlights of your collocated monitors
                </p>
              </div>
            </div>
          </div>
        </ContentBox>
      )}
    </Layout>
  );
};

export default CollocationOverview;
