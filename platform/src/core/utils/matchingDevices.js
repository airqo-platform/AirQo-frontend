// Description: This function is used to find the first two matching devices from the list of devices
import moment from 'moment';

export const findMatchingDevices = (devices) => {
  const datePairs = new Map();

  for (const device of devices) {
    const key = `${device.start_date}_${device.end_date}`;

    if (!datePairs.has(key)) {
      datePairs.set(key, []);
    }

    datePairs.get(key).push(device);

    if (datePairs.get(key).length === 2) {
      return datePairs.get(key);
    }
  }

  return [];
};

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
  const returnPairs = [];
  for (const [key, value] of datePairs) {
    returnPairs.push(value);
  }

  return returnPairs;
};
