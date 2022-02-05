import 'package:app/utils/extensions.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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

String getDateTime() {
  var now = DateTime.now();
  return '${now.getWeekday()} ${DateFormat('d').format(now)}'
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

String insightsChartTitleDateTimeToString(DateTime dateTime, bool daily) {
  try {
    if (daily) {
      return '${dateTime.getDateOfFirstDayOfWeek().getShortDate()}'
          ' - '
          '${dateTime.getDateOfLastDayOfWeek().getShortDate()}';
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
