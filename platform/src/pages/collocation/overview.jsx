import React, { useEffect, useState } from 'react';
import HeaderNav from '@/components/Layout/header';
import Layout from '@/components/Layout';
import ContentBox from '@/components/Layout/content_box';
import { format } from 'date-fns';
import GraphCard from '@/components/Collocation/AddMonitor/Overview/graph_card';
import {
  useGetCollocationStatisticsMutation,
  useGetDeviceStatusSummaryQuery,
  getRunningQueriesThunk,
} from '@/lib/store/services/collocation';
import { findAllMatchingDevices } from '@/core/utils/matchingDevices';
import moment from 'moment';
import { wrapper } from '@/lib/store';
import Button from '@/components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import {
  addOverviewBatch,
  removeOverviewBatch,
} from '@/lib/store/services/collocation/collocationDataSlice';
import EmptyState from '@/components/Collocation/Overview/empty_state';

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
  const name = context.params?.name;
  if (typeof name === 'string') {
    store.dispatch(getDeviceStatusSummary.initiate(name));
  }

  await Promise.all(store.dispatch(getRunningQueriesThunk()));

  return {
    props: {},
  };
});

const CollocationOverview = () => {
  const dispatch = useDispatch();
  const [deviceStatistics, setDeviceStatistics] = useState([]);
  const [allmatchingDevices, setAllmatchingDevices] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [device1, setDevice1] = useState(null);
  const [device2, setDevice2] = useState(null);

  // get list of selectedCollocateDevices from redux store
  const selectedBatch = useSelector((state) => state.collocationData.overviewBatch);

  // device summary list
  const {
    data: deviceStatusSummary,
    isSuccess: deviceSummarySuccess,
    isLoading: deviceSummaryLoading,
  } = useGetDeviceStatusSummaryQuery();
  let deviceStatusSummaryList = deviceStatusSummary ? deviceStatusSummary.data : [];
  const [
    getCollocationStatistics,
    { isLoading: collocationStatisticsLoading, isSuccess: collocationStatisticsSuccess },
  ] = useGetCollocationStatisticsMutation();

  // matching devices
  useEffect(() => {
    if (!deviceStatusSummaryList) return;

    if (!isEmpty(deviceStatusSummaryList)) {
      const matchingDevices = findAllMatchingDevices(deviceStatusSummaryList);
      setAllmatchingDevices(matchingDevices);

      if (!isEmpty(matchingDevices)) {
        if (matchingDevices.length > 1) {
          const firstBatchPair = [matchingDevices[0][0], matchingDevices[0][1]];
          dispatch(addOverviewBatch(firstBatchPair));
        } else {
          dispatch(addOverviewBatch(matchingDevices[0][0]));
        }
      }
    }
  }, [deviceStatusSummaryList]);

  // update device 1 and device 2 when selected batch changes
  useEffect(() => {
    if (!isEmpty(selectedBatch)) {
      if (selectedBatch.length > 1) {
        setDevice1(selectedBatch[0].device_name);
        setDevice2(selectedBatch[1].device_name);
      } else {
        setDevice1(selectedBatch.device_name);
        setDevice2(null);
      }
    }
  }, [selectedBatch]);

  useEffect(() => {
    const fetchCollocationDeviceStatistics = async () => {
      if (!isEmpty(selectedBatch)) {
        if (selectedBatch.length > 1) {
          const response = await getCollocationStatistics({
            devices: [selectedBatch[0].device_name, selectedBatch[1].device_name],
            startDate: moment(selectedBatch[0].start_date).format('YYYY-MM-DD'),
            endDate: moment(selectedBatch[0].end_date).format('YYYY-MM-DD'),
          });

          if (!response.error) {
            const transformedStatistics = Object.entries(response.data.data).map(
              ([deviceName, deviceData]) => ({
                deviceName,
                s1_pm10_mean: deviceData.s1_pm10_mean,
                s1_pm2_5_mean: deviceData.s1_pm2_5_mean,
                s2_pm10_mean: deviceData.s2_pm10_mean,
                s2_pm2_5_mean: deviceData.s2_pm2_5_mean,
              }),
            );
            setDeviceStatistics(transformedStatistics);
          }
        } else {
          const response = await getCollocationStatistics({
            devices: [selectedBatch.device_name],
            startDate: moment(selectedBatch.start_date).format('YYYY-MM-DD'),
            endDate: moment(selectedBatch.end_date).format('YYYY-MM-DD'),
          });

          if (!response.error) {
            const transformedStatistics = Object.entries(response.data.data).map(
              ([deviceName, deviceData]) => ({
                deviceName,
                s1_pm10_mean: deviceData.s1_pm10_mean,
                s1_pm2_5_mean: deviceData.s1_pm2_5_mean,
                s2_pm10_mean: deviceData.s2_pm10_mean,
                s2_pm2_5_mean: deviceData.s2_pm2_5_mean,
              }),
            );
            setDeviceStatistics(transformedStatistics);
          }
        }
      }
    };
    fetchCollocationDeviceStatistics();
  }, [selectedBatch]);

  return (
    <Layout>
      <HeaderNav category={'Collocation'} component={'Overview'} />
      {deviceSummaryLoading || collocationStatisticsLoading ? (
        <div>I am a skeleton</div>
      ) : collocationStatisticsSuccess ? (
        <ContentBox>
          <div className='grid grid-cols-1 divide-y divide-grey-150'>
            <div className='md:p-6 p-4'>
              <div className='flex justify-between'>
                <div>
                  <h5 className='font-semibold text-lg'>Today</h5>
                  <p className='text-base font-normal opacity-40'>
                    {format(new Date(), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className='md:flex md:items-center'>
                  <span className='text-sm text-black-600 opacity-70 max-w-[96px] md:max-w-full'>
                    Select a collocation period{' '}
                  </span>
                  <div className='relative'>
                    <Button
                      className='w-auto h-10 bg-blue-200 rounded-lg text-base font-semibold text-purple-700 md:ml-2'
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <span>
                        {!isEmpty(selectedBatch) &&
                          (selectedBatch.length > 1
                            ? `${moment(selectedBatch[0].start_date).format(
                                'MMM DD, yyyy',
                              )} - ${moment(selectedBatch[0].end_date).format('MMM DD, yyyy')}`
                            : `${moment(selectedBatch.start_date).format(
                                'MMM DD, yyyy',
                              )} - ${moment(selectedBatch.end_date).format('MMM DD, yyyy')}`)}
                      </span>
                    </Button>
                    {isOpen && (
                      <ul
                        tabIndex={0}
                        className='absolute z-30 mt-1 ml-6 w-auto border border-gray-200 max-h-60 overflow-y-auto text-sm p-2 shadow bg-base-100 rounded-md'
                      >
                        {allmatchingDevices.map((batch, index) => (
                          <li
                            role='button'
                            key={index}
                            className='text-sm text-grey leading-5 p-2 hover:bg-gray-200 rounded'
                            onClick={() => {
                              if (batch.length > 1) {
                                const firstBatchPair = [batch[0], batch[1]];
                                dispatch(removeOverviewBatch());
                                dispatch(addOverviewBatch(firstBatchPair));
                              } else {
                                dispatch(removeOverviewBatch());
                                dispatch(addOverviewBatch(batch[0]));
                              }
                              setIsOpen(false);
                            }}
                          >
                            <a>{`${moment(batch[0].start_date).format('MMM DD')} - ${moment(
                              batch[0].end_date,
                            ).format('MMM DD')}`}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 divide-x divide-grey-150'>
              {!isEmpty(selectedBatch) &&
              selectedBatch.length > 1 &&
              !isEmpty(deviceStatistics) &&
              deviceStatistics.length >= 1 ? (
                <>
                  <GraphCard
                    data={[deviceStatistics[0]]}
                    batch={allmatchingDevices[0]}
                    device={selectedBatch[0]}
                  />
                  <GraphCard
                    data={[deviceStatistics[1]]}
                    secondGraph={true}
                    batch={allmatchingDevices[0]}
                    device={selectedBatch[1]}
                  />
                </>
              ) : (
                !isEmpty(selectedBatch) &&
                !isEmpty(deviceStatistics) && (
                  <>
                    <GraphCard
                      data={[deviceStatistics[0]]}
                      secondGraph={true}
                      batch={allmatchingDevices[0]}
                      device={selectedBatch}
                    />
                  </>
                )
              )}
            </div>
            <div className='divide-y pt-20'>
              <div className='flex flex-row items-center justify-between p-7 md:px-12'>
                <span className='font-normal text-base opacity-60'>Monitor name</span>
                <span className='font-normal text-base opacity-60 text-left'>End date</span>
              </div>
              {device1 && (
                <div className='flex flex-row items-center justify-between p-7 md:px-12'>
                  <span className='font-semibold text-base flex justify-between items-center uppercase'>
                    {device1}
                  </span>
                  <span className='text-xl font-normal'>{format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
              )}

              {device2 && (
                <div className='flex flex-row items-center justify-between p-7 md:px-12'>
                  <span className='font-semibold text-base flex justify-between items-center uppercase'>
                    {device2}
                  </span>
                  <span className='text-xl font-normal'>{format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </ContentBox>
      ) : (
        <EmptyState />
      )}
    </Layout>
  );
};

export default CollocationOverview;
