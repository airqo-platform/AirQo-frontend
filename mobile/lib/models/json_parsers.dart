import 'package:app/models/measurement_value.dart';
import 'package:flutter/foundation.dart';

import 'measurement.dart';

String notificationIconFromJson(dynamic json) {
  switch ('$json'.toLowerCase()) {
    case 'location_icon':
      return 'assets/icon/airqo_logo.svg';
    default:
      return 'assets/icon/airqo_logo.svg';
  }
}

String notificationIconToJson(String assetPath) {
  switch (assetPath) {
    case 'assets/icon/airqo_logo.svg':
      return 'location_icon';
    default:
      return 'airqo_logo';
  }
}

bool boolFromJson(dynamic json) {
  return '$json'.toLowerCase() == 'true' ? true : false;
}

String boolToJson(bool boolValue) {
  return boolValue ? 'true' : 'false';
}

String frequencyFromJson(String frequency) {
  return frequency.toLowerCase();
}

MeasurementValue measurementValueFromJson(dynamic json) {
  if (json == null) {
    return MeasurementValue(value: -0.1, calibratedValue: -0.1);
  }
  return MeasurementValue.fromJson(json);
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
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }
  measurements.sort((siteA, siteB) =>
      siteA.site.name.toLowerCase().compareTo(siteB.site.name.toLowerCase()));

  return measurements;
}

String regionFromJson(dynamic json) {
  if (json == null) {
    return 'Central Region';
  }
  var regionJson = json as String;
  if (regionJson.toLowerCase().contains('central')) {
    return 'Central Region';
  } else if (regionJson.toLowerCase().contains('east')) {
    return 'Eastern Region';
  } else if (regionJson.toLowerCase().contains('west')) {
    return 'Western Region';
  } else if (regionJson.toLowerCase().contains('north')) {
    return 'Northern Region';
  } else {
    return 'Central Region';
  }
}

DateTime timeFromJson(dynamic json) {
  return DateTime.parse('$json');
}

String timeToJson(DateTime dateTime) {
  return dateTime.toString();
}
