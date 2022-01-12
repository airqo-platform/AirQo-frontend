import 'package:app/utils/extensions.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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
      return DateFormat('hh:mm a').format(formattedDate);
    } else {
      if (now.isAfter(formattedDate)) {
        var yesterday = now.subtract(const Duration(hours: 24));
        if (formattedDate.day == yesterday.day) {
          return 'Yesterday, ${DateFormat('hh:mm a').format(formattedDate)}';
        } else {
          return DateFormat('d MMM, hh:mm a').format(formattedDate);
        }
      } else {
        var tomorrow = now.add(const Duration(hours: 24));
        if (tomorrow.day == formattedDate.day) {
          return 'Tomorrow, ${DateFormat('hh:mm a').format(formattedDate)}';
        } else {
          return DateFormat('d MMM, hh:mm a').format(formattedDate);
        }
      }
    }
  } on Error catch (exception, stackTrace) {
    debugPrint('$exception\n$stackTrace');
    return formattedString;
  }
}

String dateToShareString(String formattedString) {
  try {
    var formattedDate = DateTime.parse(formattedString);
    var dateFormatter = DateFormat('EEE, d MMM yyyy hh:mm a');
    return dateFormatter.format(formattedDate);
  } on Error catch (exception, stackTrace) {
    debugPrint('$exception\n$stackTrace');
    return dateToString(formattedString);
  }
}

String dateToString(String formattedString) {
  try {
    var now = DateTime.now();
    var formattedDate = DateTime.parse(formattedString);

    if (now.day == formattedDate.day) {
      return 'Updated today at ${DateFormat('hh:mm a').format(formattedDate)}';
    } else {
      if (now.isAfter(formattedDate)) {
        var yesterday = now.subtract(const Duration(hours: 24));
        if (formattedDate.day == yesterday.day) {
          return 'Updated yesterday at'
              ' ${DateFormat('hh:mm a').format(formattedDate)}';
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
          return DateFormat('d MMM, hh:mm a').format(formattedDate);
        }
      }
    }
  } on Error catch (exception, stackTrace) {
    debugPrint('$exception\n$stackTrace');
    return formattedString;
  }
}

DateTime getDateOfFirstDayOfWeek(DateTime datetime) {
  var firstDate = datetime;
  var weekday = firstDate.weekday;

  if (weekday != 1) {
    var offset = weekday - 1;
    firstDate = firstDate.subtract(Duration(days: offset));
  }

  return firstDate;
}

DateTime getDateOfLastDayOfWeek(DateTime datetime) {
  var lastDate = datetime;
  var weekday = lastDate.weekday;

  if (weekday != 7) {
    var offset = 7 - weekday;
    lastDate = lastDate.add(Duration(days: offset));
  }

  return lastDate;
}

String getDateTime() {
  var now = DateTime.now();
  return '${getWeekday()} ${DateFormat('d').format(now)}'
          ' ${DateFormat('MMMM').format(now)}'
      .toUpperCase();
}

String getGreetings(String name) {
  if (name.isNull() || name.toLowerCase() == 'guest') {
    return 'Hello';
  }

  var hour = DateTime.now().hour;
  if (00 <= hour && hour < 12) {
    return 'Good morning $name';
  }

  if (12 <= hour && hour < 16) {
    return 'Good afternoon $name';
  }

  if (18 <= hour && hour <= 23) {
    return 'Good evening $name';
  }

  return 'Hello $name';
}

// TODO: verify yesterday and tomorrow. Explore unit tests
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

String insightsChartTitleDateTimeToString(DateTime dateTime, bool daily) {
  try {
    if (daily) {
      return '${getDateOfFirstDayOfWeek(dateTime).getShortDate()}'
          ' - '
          '${getDateOfLastDayOfWeek(dateTime).getShortDate()}';
    } else {
      var prefix = '';

      if (dateTime.isToday()) {
        prefix = 'Today';
      } else if (dateTime.day == yesterday().day &&
          dateTime.month == yesterday().month) {
        prefix = 'Yesterday';
      } else if (dateTime.day == tomorrow().day &&
          dateTime.month == tomorrow().month) {
        prefix = 'Tomorrow';
      } else {
        prefix = '';
      }

      if (prefix == '') {
        return dateTime.getShortDate();
      }

      return '$prefix, ${dateTime.getShortDate()}';
    }
  } on Error catch (exception, stackTrace) {
    debugPrint('$exception\n$stackTrace');
    return dateTime.toString();
  }
}

DateTime tomorrow() {
  return DateTime.now().add(const Duration(days: 1));
}

DateTime yesterday() {
  return DateTime.now().subtract(const Duration(days: 1));
}

extension DateTimeExtension on DateTime {
  String getShortDate() {
    if (day.toString().endsWith('1')) {
      return '${day}st ${getShortMonthString()}';
    } else if (day.toString().endsWith('2')) {
      return '${day}st ${getShortMonthString()}';
    } else if (day.toString().endsWith('3')) {
      return '${day}st ${getShortMonthString()}';
    } else {
      return '${day}th ${getShortMonthString()}';
    }
  }

  DateTime tomorrow() {
    return DateTime.now().add(const Duration(days: 1));
  }

  bool isToday() {
    if (day == DateTime.now().day &&
        month == DateTime.now().month &&
        year == DateTime.now().year) {
      return true;
    }

    return false;
  }

  bool isTomorrow() {
    if (day == tomorrow().day &&
        month == tomorrow().month &&
        year == tomorrow().year) {
      return true;
    }

    return false;
  }

  static DateTime yesterday() {
    return DateTime.now().subtract(const Duration(days: 1));
  }

  String notificationDisplayDate() {
    if (day == DateTime.now().day) {
      var hours = hour.toString();
      if (hours.length <= 1) {
        hours = '0$hour';
      }

      var minutes = minute.toString();
      if (minutes.length <= 1) {
        minutes = '0$minutes';
      }
      return '$hours:$minutes';
    } else {
      return '$day ${getShortMonthString()}';
    }
  }

  String getMonth(DateTime? datetime) {
    var referenceMonth = datetime != null ? datetime.month : month;
    if (referenceMonth.toString().length > 1) {
      return referenceMonth.toString();
    }
    return '0$referenceMonth';
  }

  String getDay(DateTime? datetime) {
    var referenceDay = datetime != null ? datetime.day : day;
    if (referenceDay.toString().length > 1) {
      return referenceDay.toString();
    }
    return '0$referenceDay';
  }

  DateTime firstDateOfCalendarMonth() {
    var firstDate = DateTime.parse('$year-${getMonth(null)}-01T00:00:00Z');

    while (firstDate.weekday != 1) {
      firstDate = firstDate.subtract(const Duration(days: 1));
    }

    return firstDate;
  }

  DateTime lastDateOfCalendarMonth() {
    var lastDate = DateTime.parse('$year-${getMonth(null)}'
        '-${getDay(getLastDateOfMonth())}T00:00:00Z');

    while (lastDate.weekday != 7) {
      lastDate = lastDate.add(const Duration(days: 1));
    }

    return lastDate;
  }

  DateTime getFirstDateOfMonth() {
    var firstDate = DateTime.parse('$year-${getMonth(null)}-01T00:00:00Z');
    return firstDate;
  }

  DateTime getLastDateOfMonth() {
    var lastDate = DateTime.parse('$year-${getMonth(null)}-26T00:00:00Z');
    var referenceMonth = month;

    while (lastDate.month == referenceMonth) {
      lastDate = lastDate.add(const Duration(days: 1));
    }
    lastDate = lastDate.subtract(const Duration(days: 1));

    return lastDate;
  }

  DateTime getDateOfFirstDayOfWeek() {
    var firstDate = DateTime.now();
    var weekday = firstDate.weekday;

    if (weekday != 1) {
      var offset = weekday - 1;
      firstDate = firstDate.subtract(Duration(days: offset));
    }

    return firstDate;
  }

  DateTime getDateOfLastDayOfWeek() {
    var lastDate = DateTime.now();
    var weekday = lastDate.weekday;

    if (weekday != 7) {
      var offset = 7 - weekday;
      lastDate = lastDate.add(Duration(days: offset));
    }

    return lastDate;
  }

  String getShortMonthString() {
    switch (month) {
      case 1:
        return 'Jan';
      case 2:
        return 'Feb';
      case 3:
        return 'Mar';
      case 4:
        return 'Apr';
      case 5:
        return 'May';
      case 6:
        return 'Jun';
      case 7:
        return 'Jul';
      case 8:
        return 'Aug';
      case 9:
        return 'Sept';
      case 10:
        return 'Oct';
      case 11:
        return 'Nov';
      case 12:
        return 'Dec';
      default:
        return '';
    }
  }

  String getLongMonthString() {
    switch (month) {
      case 1:
        return 'January';
      case 2:
        return 'February';
      case 3:
        return 'March';
      case 4:
        return 'April';
      case 5:
        return 'May';
      case 6:
        return 'June';
      case 7:
        return 'July';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'October';
      case 11:
        return 'November';
      case 12:
        return 'December';
      default:
        return '';
    }
  }
}
