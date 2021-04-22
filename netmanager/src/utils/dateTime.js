import moment from "moment-timezone";

export const formatDateString = (
  t,
  format = "YYYY-MM-DD HH:mm",
  tz = "Africa/Kampala"
) => {
  return moment
    .utc(t, format)
    .tz(tz || "Africa/Kampala")
    .format(format);
};

export const getElapsedDurationMapper = (dateTimeStr) => {
  let delta = Math.abs(new Date() - new Date(dateTimeStr)) / 1000;
  let seconds = delta;
  let result = {};
  let structure = {
    year: 31536000,
    month: 2592000,
    week: 604800, // uncomment row to ignore
    day: 86400, // feel free to add your own row
    hour: 3600,
    minute: 60,
    second: 1,
  };

  Object.keys(structure).forEach(function (key) {
    result[key] = Math.floor(delta / structure[key]);
    delta -= result[key] * structure[key];
  });

  return [seconds, result];
};
