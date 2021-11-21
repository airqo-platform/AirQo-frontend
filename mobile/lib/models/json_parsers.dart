bool boolFromJson(dynamic json) {
  return '$json' == 'true' ? true : false;
}

String boolToJson(bool boolValue) {
  return boolValue ? 'true' : 'false';
}

DateTime timeFromJson(dynamic json) {
  return DateTime.parse('$json');
}

String timeToJson(DateTime dateTime) {
  return dateTime.toString();
}
