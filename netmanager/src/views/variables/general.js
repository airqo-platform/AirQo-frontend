// ##############################
// // // Tasks for TasksCard - see Dashboard view
// #############################

var data = [
  "Bwaise-2020-01-15T13:16:43.218Z",
  "MUK-2020-01-15T13:16:43.218Z",
  "Entebbe-2020-01-15T13:16:43.218Z",
  "Kireka-2020-01-15T13:16:43.218Z",
];
var momo = [
  "Kaazi-2020-01-15T13:16:43.218Z",
  'Kajjansi-2020-01-15T13:16:43.218Z"',
];
var config = [
  "Allow manual creation of devices (recommended: off)",
  "Allow notifications",
];

var social = ["sms", "Twitter", "emails"];

var bugs = [
  'AirQo Makerere reporting data out of range"',
  "AirQo Lungujja is not showing the correct GPS coordinates",
  "AirQo Mbale has been off for 2 weeks now",
  "AirQo Jinja has been off for 3 days",
];
var website = [
  "AirQo Kabale scheduled for maintenance on 4th May 2020",
  'AirQo Kireka scheduled for maintenance on 24th April 2020"',
];
var server = ['AirQo Bundibugyo was last seen 4 days ago due to low battery"'];

module.exports = {
  // these 3 are used to create the tasks lists in TasksCard - Dashboard view
  data,
  momo,
  config,
  social,
  bugs,
  website,
  server,
};
