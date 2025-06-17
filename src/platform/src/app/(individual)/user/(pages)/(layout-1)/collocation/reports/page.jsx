'use client';

import HeaderNav from '@/common/layouts/components/HeaderNav';
import Box from '@/components/Collocation/Report/box';
import ContentBox from '@/common/layouts/components/ContentBox';
import { withUserAuth } from '@/core/HOC';

const CollocationReports = () => {
  return (
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
      <ContentBox>
        <table className="border-collapse text-xs text-left w-full mb-6">
          <thead>
            <tr className="border-b border-b-slate-300 text-black">
              <th className="text-left pl-4 py-2 font-medium">Device Name</th>
              <th className="text-left pl-4 py-2 font-medium">Batch Name</th>
              <th className="text-left pl-4 py-2 font-medium">Start Date</th>
              <th className="text-left pl-4 py-2 font-medium">End Date</th>
              <th className="text-left pl-4 py-2 font-medium">Status</th>
              <th className="text-left pl-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-b-slate-200">
              <td className="pl-4 py-3">AirQo_Monitor_001</td>
              <td className="pl-4 py-3">Batch_A_2023</td>
              <td className="pl-4 py-3">2023-01-15</td>
              <td className="pl-4 py-3">2023-02-15</td>
              <td className="pl-4 py-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Completed
                </span>
              </td>
              <td className="pl-4 py-3">
                <button className="text-blue-600 hover:text-blue-800 text-xs">
                  View Report
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </ContentBox>
    </div>
  );
};

export default withUserAuth(CollocationReports);
