import 'package:app/models/enum_constants.dart';

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

Frequency frequencyFromString(String string) {
  if (string.toLowerCase() == Frequency.daily.string) {
    return Frequency.daily;
  }

  return Frequency.hourly;
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
