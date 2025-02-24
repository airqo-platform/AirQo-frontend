export const updateDevices = (devices, newValues) => {
  const newDevices = [];
  (devices || []).map((device) => {
    newDevices.push({ ...device, ...newValues });
  });
  return newDevices;
};
