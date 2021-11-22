import 'package:flutter/foundation.dart';

import 'measurement.dart';

bool boolFromJson(dynamic json) {
  return '$json' == 'true' ? true : false;
}

String boolToJson(bool boolValue) {
  return boolValue ? 'true' : 'false';
}

Measurement parseMeasurement(dynamic jsonBody) {
  var measurements = parseMeasurements(jsonBody);
  return measurements.first;
}

List<Measurement> parseMeasurements(dynamic jsonBody) {
  var measurements = <Measurement>[];

  var jsonArray = jsonBody['measurements'];
  var offSet = DateTime.now().timeZoneOffset.inHours;
  for (var jsonElement in jsonArray) {
    try {
      var measurement = Measurement.fromJson(jsonElement);
      var value = measurement.getPm2_5Value();
      if (value != -0.1 && value >= 0.00 && value <= 500.40) {
        var formattedDate =
            DateTime.parse(measurement.time).add(Duration(hours: offSet));
        measurement.time = formattedDate.toString();
        measurements.add(measurement);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }
  measurements.sort((siteA, siteB) => siteA.site
      .getName()
      .toLowerCase()
      .compareTo(siteB.site.getName().toLowerCase()));

  return measurements;
}

DateTime timeFromJson(dynamic json) {
  return DateTime.parse('$json');
}

String timeToJson(DateTime dateTime) {
  return dateTime.toString();
}
