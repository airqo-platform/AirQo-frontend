import React from 'react';
import HeaderNav from '@/components/Layout/header';
import Box from '@/components/Collocation/Report/box';
import ContentBox from '@/components/Layout/content_box';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';

const CollocationReports = () => {
  return (
    <Layout
      topbarTitle={'Collocation'}
      pageTitle={'Collocation Reports'}
      noBorderBottom
    >
      <div className="px-4 md:px-6 lg:px-10 pb-3">
        <HeaderNav category={'Collocation'} component={'Reports'}></HeaderNav>
        <div className="grid grid-cols-2">
          <Box
            title={'Intra Sensor Correlation'}
            subtitle="Detailed comparison of data between two sensors that are located within the same device."
          ></Box>
          <Box
            title={'Inter Sensor Correlation'}
            subtitle="Detailed comparison of data between two sensors that are located within the same device."
          ></Box>
        </div>
        <ContentBox noMargin>
          <table className="border-collapse text-xs text-left w-full mb-6">
            <thead>
              <tr className="border-b border-b-slate-300 text-black">
                <th
                  scope="col"
                  className="font-normal w-[61px] py-[10px] px-[21px]"
                >
                  <input type="checkbox" checked={false} />
                </th>
                <th scope="col" className="font-normal w-[175px] px-4 py-3">
                  Monitor name
                </th>
                <th scope="col" className="font-normal w-[175px] px-4 py-3">
                  Sensor 01
                </th>
                <th scope="col" className="font-normal w-[175px] px-4 py-3">
                  Sensor 02
                </th>
                <th scope="col" className="font-normal w-[175px] px-4 py-3">
                  Voltage
                </th>
                <th scope="col" className="font-normal w-[175px] px-4 py-3">
                  Temperature
                </th>
                <th scope="col" className="font-normal w-[175px] px-4 py-3">
                  Humidity
                </th>
                <th scope="col" className="font-normal w-[175px] px-4 py-3">
                  Altitude
                </th>
              </tr>
            </thead>
          </table>
        </ContentBox>
      </div>
    </Layout>
  );
};

export default withAuth(CollocationReports);
