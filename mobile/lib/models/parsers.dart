DateTime dateTimeFromUtcString(dynamic object) {
  return DateTime.parse(object as String).toLocal();
}

String dateTimeToUtcString(DateTime dateTime) {
  return dateTime.toUtc().toString();
}
