// import { useEffect, useState } from 'react';

// const PM_25_CATEGORY = {
//   Good: [0, 12],
//   Moderate: [12.1, 35.4],
//   UHFSG: [35.5, 55.4],
//   Unhealthy: [55.5, 150.4],
//   VeryUnhealthy: [150.5, 250.4],
//   Hazardous: [250.5, Infinity],
// };

// export const createDeviceOptions = (devices) => {
//     const options = [];
//     devices.map((device) => {
//       options.push({
//         value: device._id,
//         label: device.name
//       });
//     });
//     return options;
//   };

// const useReadingsSiteCount = (recentEventsData: any, activeGrid: any, activeCohort: any) => {
//     const [pm2_5SiteCount, setPm2_5SiteCount] = useState({
//       Good: 0,
//       Moderate: 0,
//       UHFSG: 0,
//       Unhealthy: 0,
//       VeryUnhealthy: 0,
//       Hazardous: 0,
//     });

//     useEffect(() => {
//       const initialCount = {
//         Good: 0,
//         Moderate: 0,
//         UHFSG: 0,
//         Unhealthy: 0,
//         VeryUnhealthy: 0,
//         Hazardous: 0,
//       };

//       const devices = activeCohort?.devices || [];
//       const sites = activeGrid?.sites || [];

//       const cohortDevicesObj = devices.map((device:any) => createDeviceOptions([device])).flat().reduce((acc, curr) => {
//         acc[curr.value] = curr;
//         return acc;
//       }, {});

//       const allFeatures = recentEventsData.features || [];

//       allFeatures.forEach((feature: any) => {
//         const deviceId = feature.properties.device_id;
//         const device = cohortDevicesObj[deviceId];

//         if (device) {
//           const pm2_5 = feature.properties.pm2_5.value;

//           Object.keys(PM_25_CATEGORY).forEach((key) => {
//             const valid = PM_25_CATEGORY[key];
//             if (pm2_5 > valid[0] && pm2_5 <= valid[1]) {
//               initialCount[key] += 1;
//             }
//           });
//         }
//       });

//       setPm2_5SiteCount(initialCount);
//     }, [recentEventsData, activeGrid, activeCohort]);

//     return pm2_5SiteCount;
//   };

// export default useReadingsSiteCount;
