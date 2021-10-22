import 'package:intl/intl.dart';

String chartDateTimeToString(DateTime dateTime) {
  try {
    var now = DateTime.now();
    dateTime = dateTime.add(Duration(hours: now.timeZoneOffset.inHours));
    if (now.day == dateTime.day) {
      return 'Today, ${DateFormat('hh:mm a').format(dateTime)}';
    } else {
      if (now.isAfter(dateTime)) {
        var yesterday = now.subtract(const Duration(hours: 24));
        if (dateTime.day == yesterday.day) {
          return 'Yesterday, ${DateFormat('hh:mm a').format(dateTime)}';
        } else {
          return '${DateFormat('d MMM, hh:mm a').format(dateTime)}';
        }
      } else {
        var tomorrow = now.add(const Duration(hours: 24));
        if (tomorrow.day == dateTime.day) {
          return 'Tomorrow, ${DateFormat('hh:mm a').format(dateTime)}';
        } else {
          return '${DateFormat('d MMM, hh:mm a').format(dateTime)}';
        }
      }
    }
  } on Error catch (e) {
    print('Date Formatting error: $e');
    return dateTime.toString();
  }
}

String chartDateToString(String formattedString, bool format) {
  try {
    var now = DateTime.now();
    var offSet = 0;
    if (format) {
      offSet = now.timeZoneOffset.inHours;
    }
    var formattedDate =
        DateTime.parse(formattedString).add(Duration(hours: offSet));

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
      return 'Updated today at ${DateFormat('hh:mm a').format(formattedDate)}';
    } else {
      if (now.isAfter(formattedDate)) {
        var yesterday = now.subtract(const Duration(hours: 24));
        if (formattedDate.day == yesterday.day) {
          return 'Updated yesterday at ${DateFormat('hh:mm a').format(formattedDate)}';
        } else {
          var daysAgo = now.difference(formattedDate).inDays;
          if (daysAgo == 1) {
            return 'Updated $daysAgo day ago';
          }
          return 'Updated $daysAgo days ago';
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

String getDateTime() {
  var now = DateTime.now();
  var weekday = now.weekday;
  return '${getWeekday()} ${DateFormat('d').format(now)} ${DateFormat('MMMM').format(now)}'
      .toUpperCase();
}

String getGreetings(name) {
  var hour = DateTime.now().hour;
  if (8 <= hour && hour < 12) {
    return 'Good morning $name';
  }

  if (12 <= hour && hour < 16) {
    return 'Good afternoon $name';
  }

  if (18 <= hour && hour < 21) {
    return 'Good evening $name';
  }

  return 'Hello $name';
}

String getTime(int hour) {
  if (hour > 0 && hour < 12) {
    return '$hour AM';
  } else if (hour == 0 || hour == 24) {
    return 'Midnight';
  } else if (hour == 12) {
    return 'noon';
  } else if (hour == 13) {
    return '1 PM';
  } else if (hour == 14) {
    return '2 PM';
  } else if (hour == 15) {
    return '3 PM';
  } else if (hour == 16) {
    return '4 PM';
  } else if (hour == 17) {
    return '5 PM';
  } else if (hour == 18) {
    return '6 PM';
  } else if (hour == 19) {
    return '7 PM';
  } else if (hour == 20) {
    return '8 PM';
  } else if (hour == 21) {
    return '9 PM';
  } else if (hour == 22) {
    return '10 PM';
  } else if (hour == 23) {
    return '11 PM';
  } else {
    return '';
  }
}

String getWeekday() {
  var weekday = DateTime.now().weekday;
  if (weekday == 1) {
    return 'monday';
  } else if (weekday == 2) {
    return 'tuesday';
  } else if (weekday == 3) {
    return 'wednesday';
  } else if (weekday == 4) {
    return 'thursday';
  } else if (weekday == 5) {
    return 'friday';
  } else if (weekday == 6) {
    return 'saturday';
  } else if (weekday == 7) {
    return 'sunday';
  } else {
    return '';
  }
}

extension DateTimeExtension on DateTime {
  String getMonthString() {
    switch (month) {
      case 1:
        return 'JAN';
      case 2:
        return 'FEB';
      case 3:
        return 'MAR';
      case 4:
        return 'APR';
      case 5:
        return 'MAY';
      case 6:
        return 'JUN';
      case 7:
        return 'JUL';
      case 8:
        return 'AUG';
      case 9:
        return 'SEPT';
      case 10:
        return 'OCT';
      case 11:
        return 'NOV';
      case 12:
        return 'DEC';
      default:
        return 'ERR';
    }
  }
}
