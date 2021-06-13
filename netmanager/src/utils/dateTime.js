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
    Math.abs(
      new Date() - new Date(moment.utc(dateTimeStr).tz(moment.tz.guess()))
    ) / 1000;
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
