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
  let delta =
    Math.abs(moment.utc(new Date()) - moment.utc(new Date(dateTimeStr))) / 1000;
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

export const getFirstNDurations = (duration, n) => {
  let format = "";
  let count = n;
  const keys = ["year", "month", "week", "day", "hour", "minute", "second"];
  for (const key of keys) {
    const elapsedTime = duration[key];
    if (elapsedTime > 0) {
      format = `${format} ${elapsedTime} ${key}${elapsedTime > 1 ? "s" : ""},`;
      count -= 1;
    }

    if (count <= 0) break;
  }
  format = format.substring(0, format.length - 1);
  return format;
};

export const getFirstDuration = (dateTimeStr) => {
  const [seconds, durations] = getElapsedDurationMapper(dateTimeStr);
  return [seconds, getFirstNDurations(durations, 1)];
};

export const humanReadableDate = (dateString, options) => {
  const format = (options && options.format) || {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, format);
};

export const formatDate = (date) => {
    if(!date) return '-';

    date = new Date(date)
    let day = date.getDate();
    let month = date.getMonth()+1;
    const year = date.getFullYear();

    if (day < 10) day = `0${day}`
    if (month < 10) month = `0${month}`

  return [year, month, day].join('-');
};

export const roundToEndOfDay = (dateISOString) => {
  let end = new Date(dateISOString);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

export const roundToStartOfDay = (dateISOString) => {
  let start = new Date(dateISOString);
  start.setUTCHours(0, 0, 0, 1);
  return start;
};

export const getDateString = (ISODateString) => {
  if (ISODateString) return ISODateString.split("T")[0];
  return "";
};
