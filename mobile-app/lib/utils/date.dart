import 'package:intl/intl.dart';

String dateToEnglishString(String formattedString) {
  try {
    var now = DateTime.now();
    var offSet = now.timeZoneOffset.inHours;
    var formattedDate = DateTime.parse(formattedString);
    var newDate = formattedDate.add(Duration(hours: offSet));

    final difference = now.difference(newDate).inDays;
    //
    // var date = DateFormat('yyyy-MM-dd').parse(
    //     DateFormat('yyyy-MM-dd').format(DateTime.parse(formattedString)));

    var dateString = DateFormat('EEE, MMM d, hh:mm a')
        .format(DateTime.parse(formattedString));

    // if (now.weekday == newDate.weekday){
    //   dateString =
    //       'Today, ${DateFormat('hh:mm a')
    //           .format(newDate)}';
    //   return dateString;
    // }

    // switch (difference) {
    //   case 1:
    //     dateString =
    //         'Yesterday, ${DateFormat('hh:mm a')
    //             .format(newDate)}';
    //     break;
    //   default:
    //     break;
    // }

    return dateString;
  } on Error catch (e) {
    print('Date Formatting error: $e');
    return formattedString;
  }
}

String dateToString(String formattedString) {
  try {
    var now = DateTime.now();
    var offSet = now.timeZoneOffset.inHours;
    var formattedDate = DateTime.parse(formattedString);
    var newDate = formattedDate.add(Duration(hours: offSet));

    final difference = now.difference(newDate).inDays;

    var dateString = DateFormat('EEE, MMM d, hh:mm a').format(newDate);

    // if (now.weekday == newDate.weekday){
    //   dateString =
    //   'Today, ${DateFormat('hh:mm a')
    //       .format(newDate)}';
    //   return dateString;
    // }

    switch (difference) {
      case 0:
        dateString = '${DateFormat('hh:mm a').format(newDate)}';
        break;
      case 1:
        dateString = 'Yesterday, ${DateFormat('hh:mm a').format(newDate)}';
        break;
      case 2:
        dateString = '2 days ago';
        break;
      case 3:
        dateString = '3 days ago';
        break;
      case 4:
        dateString = '4 days ago';
        break;
      case 5:
        dateString = '5 days ago';
        break;
      default:
        break;
    }

    // switch (difference) {
    //   case 0:
    //     dateString =
    //         '${DateFormat('hh:mm a').format(DateTime.parse(formattedString))}';
    //     break;
    //   case 1:
    //     dateString =
    //         'Yesterday, ${DateFormat('hh:mm a')
    //             .format(DateTime.parse(formattedString))}';
    //     break;
    //   case 2:
    //     dateString = '2 days ago';
    //     break;
    //   case 3:
    //     dateString = '3 days ago';
    //     break;
    //   case 4:
    //     dateString = '4 days ago';
    //     break;
    //   case 5:
    //     dateString = '5 days ago';
    //     break;
    //   default:
    //     dateString = DateFormat('EEE, MMM d, hh:mm a')
    //         .format(DateTime.parse(formattedString));
    //     break;
    // }

    return dateString;
  } on Error catch (e) {
    print('Date Formatting error: $e');
    return formattedString;
  }
}
