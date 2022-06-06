import 'package:app/models/measurement_value.dart';

import '../utils/exception.dart';
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

List<Measurement> parseMeasurements(dynamic jsonBody) {
  final measurements = <Measurement>[];

  final jsonArray = jsonBody['measurements'];
  final offSet = DateTime.now().timeZoneOffset.inHours;
  for (final jsonElement in jsonArray) {
    try {
      final measurement = Measurement.fromJson(jsonElement);
      final value = measurement.getPm2_5Value();
      if (value != -0.1 && value >= 0.00 && value <= 500.40) {
        final formattedDate =
            DateTime.parse(measurement.time).add(Duration(hours: offSet));
        measurement.time = formattedDate.toString();
        measurements.add(measurement);
      }
    } catch (exception, stackTrace) {
      logException(exception, stackTrace, remoteLogging: false);
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
  final regionJson = json as String;
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
