import 'package:intl/intl.dart';

String chartDateToString(String formattedString) {
  try {
    var now = DateTime.now();
    var formattedDate = DateTime.parse(formattedString);

    if (now.day == formattedDate.day) {
      return '${DateFormat('hh:mm a').format(formattedDate)}';
    } else {
      if (now.isAfter(formattedDate)) {
        var yesterday = now.subtract(const Duration(hours: 24));
        if (formattedDate.day == yesterday.day) {
          return 'Yesterday, ${DateFormat('hh:mm a').format(formattedDate)}';
        } else {
          return '${DateFormat('d MMM, hh:mm a').format(formattedDate)}';
        }
      } else {
        var tomorrow = now.add(const Duration(hours: 24));
        if (tomorrow.day == formattedDate.day) {
          return 'Tomorrow, ${DateFormat('hh:mm a').format(formattedDate)}';
        } else {
          return '${DateFormat('d MMM, hh:mm a').format(formattedDate)}';
        }
      }
    }
  } on Error catch (e) {
    print('Date Formatting error: $e');
    return formattedString;
  }
}

String dateToString(String formattedString, bool addOffset) {
  try {
    var now = DateTime.now();

    DateTime formattedDate;

    if (addOffset) {
      var offSet = now.timeZoneOffset.inHours;
      formattedDate =
          DateTime.parse(formattedString).add(Duration(hours: offSet));
    } else {
      formattedDate = DateTime.parse(formattedString);
    }

    if (now.day == formattedDate.day) {
      return '${DateFormat('hh:mm a').format(formattedDate)}';
    } else {
      if (now.isAfter(formattedDate)) {
        var yesterday = now.subtract(const Duration(hours: 24));
        if (formattedDate.day == yesterday.day) {
          return 'Yesterday, ${DateFormat('hh:mm a').format(formattedDate)}';
        } else {
          var daysAgo = now.difference(formattedDate).inDays;
          if (daysAgo == 1) {
            return '$daysAgo day ago';
          }
          return '$daysAgo days ago';
        }
      } else {
        var tomorrow = now.add(const Duration(hours: 24));
        if (tomorrow.day == formattedDate.day) {
          return 'Tomorrow, ${DateFormat('hh:mm a').format(formattedDate)}';
        } else {
          return '${DateFormat('d MMM, hh:mm a').format(formattedDate)}';
        }
      }
    }
  } on Error catch (e) {
    print('Date Formatting error: $e');
    return formattedString;
  }
}

String getGreetings() {
  var hour = DateTime.now().hour;
  if (0 <= hour && hour < 12) {
    return 'Good morning!';
  }

  if (12 <= hour && hour < 13) {
    return 'Good afternoon!';
  }

  if (13 <= hour && hour < 16) {
    return 'Good evening!';
  }

  return 'Hello!';
}
