import 'package:intl/intl.dart';

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

DateTime dateTimeFromUtcString(dynamic object) {
  try {
    return DateTime.parse(object as String).toLocal();
  } catch (e) {
    return DateFormat("EEE, d MMM yyyy HH:mm:ss 'GMT'")
        .parseUTC(object as String)
        .toLocal();
  }
}

String dateTimeToUtcString(DateTime dateTime) {
  return dateTime.toUtc().toString();
}
