// Description: This function is used to organise devices by batch and returns the device batches and a list of unique time periods
import moment from 'moment';

export const findAllMatchingDevices = (devices) => {
  const datePairs = new Map();

  for (const device of devices) {
    const key = `${device.start_date}_${device.end_date}`;

    if (!datePairs.has(key)) {
      datePairs.set(key, []);
    }

    datePairs.get(key).push(device);
  }

  // convert map to array
  const matchingDevicePairs = [];
  for (const [key, value] of datePairs) {
    matchingDevicePairs.push(value);
  }

  // return an array with unique start date and end date objects
  const uniqueDatePairs = [];
  const addedPairs = new Set();

  for (const pair of matchingDevicePairs) {
    const startDate = moment(pair[0].start_date).format('YYYY-MM-DD');
    const endDate = moment(pair[0].end_date).format('YYYY-MM-DD');
    const uniquePair = {
      start_date: startDate,
      end_date: endDate,
    };
    // Check if the pair has already been added
    const pairString = JSON.stringify(uniquePair);
    if (!addedPairs.has(pairString)) {
      addedPairs.add(pairString);
      uniqueDatePairs.push(uniquePair);
    }
  }

  return { matchingDevicePairs, uniqueDatePairs };
};
