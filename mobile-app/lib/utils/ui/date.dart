import 'package:intl/intl.dart';

String dateToString(String formattedString) {
  try {
    var now = DateTime.now();

    var date = DateFormat('yyyy-MM-dd').parse(
        DateFormat('yyyy-MM-dd').format(DateTime.parse(formattedString)));

    final difference = now.difference(date).inDays;
    var dateString;
    switch (difference) {
      case 0:
        dateString =
            'Today at ${DateFormat('hh:mm a').format(DateTime.parse(formattedString))}';
        break;
      case 1:
        dateString =
            'Yesterday at ${DateFormat('hh:mm a').format(DateTime.parse(formattedString))}';
        break;

      default:
        dateString = DateFormat('EEE, MMM d, hh:mm a')
            .format(DateTime.parse(formattedString));
        break;
    }

    return dateString;
  } on Error catch (e) {
    print('Date Formatting error: $e');
    return formattedString;
  }
}
