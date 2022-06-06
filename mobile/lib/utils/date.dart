import 'package:app/utils/extensions.dart';
import 'package:intl/intl.dart';

import '../models/enum_constants.dart';
import 'exception.dart';

String dateToShareString(String formattedString) {
  try {
    final formattedDate = DateTime.parse(formattedString);
    final dateFormatter = DateFormat('EEE, d MMM yyyy hh:mm a');
    return dateFormatter.format(formattedDate);
  } catch (exception, stackTrace) {
    logException(exception, stackTrace);
    return dateToString(formattedString);
  }
}

String dateToString(String formattedString) {
  try {
    final now = DateTime.now();
    final formattedDate = DateTime.parse(formattedString);

    if (now.day == formattedDate.day) {
      return 'Updated today at ${DateFormat('hh:mm a').format(formattedDate)}';
    } else if (now.isAfter(formattedDate)) {
      final yesterday = now.subtract(const Duration(hours: 24));
      if (formattedDate.day == yesterday.day) {
        return 'Updated yesterday at'
            ' ${DateFormat('hh:mm a').format(formattedDate)}';
      } else {
        final daysAgo = now.difference(formattedDate).inDays;
        return daysAgo == 1
            ? 'Updated $daysAgo day ago'
            : 'Updated $daysAgo days ago';
      }
    } else {
      final tomorrow = now.add(const Duration(hours: 24));
      return tomorrow.day == formattedDate.day
          ? 'Tomorrow, ${DateFormat('hh:mm a').format(formattedDate)}'
          : DateFormat('d MMM, hh:mm a').format(formattedDate);
    }
  } catch (exception, stackTrace) {
    logException(exception, stackTrace);
    return formattedString;
  }
}

String getDateTime() {
  final now = DateTime.now();
  return '${now.getWeekday()} ${DateFormat('d').format(now)},'
          ' ${DateFormat('MMMM').format(now)}'
      .toUpperCase();
}

String getGreetings(String name) {
  if (name.isNull() || name.toLowerCase() == 'guest') {
    name = '';
  }

  final hour = DateTime.now().hour;
  if (00 <= hour && hour < 12) {
    return 'Good morning $name'.trim();
  }

  if (12 <= hour && hour < 16) {
    return 'Good afternoon $name'.trim();
  }

  if (18 <= hour && hour <= 23) {
    return 'Good evening $name'.trim();
  }

  return 'Hello $name'.trim();
}

String insightsChartTitleDateTimeToString(
    DateTime dateTime, Frequency frequency) {
  try {
    if (frequency == Frequency.daily) {
      var prefix = '';
      final suffix = '${dateTime.getDateOfFirstDayOfWeek().getShortDate()}'
          ' - '
          '${dateTime.getDateOfLastDayOfWeek().getShortDate()}';

      if (dateTime.isInWeek('last')) {
        prefix = 'Last Week';
      } else if (dateTime.isInWeek('this')) {
        prefix = 'This Week';
      } else if (dateTime.isInWeek('next')) {
        prefix = 'Next Week';
      } else {
        prefix = '';
      }

      return prefix == '' ? suffix : '$prefix, $suffix';
    } else {
      var prefix = '';
      final suffix = dateTime.getLongDate();

      if (dateTime.isToday()) {
        prefix = 'Today';
      } else if (dateTime.isYesterday()) {
        prefix = 'Yesterday';
      } else if (dateTime.isTomorrow()) {
        prefix = 'Tomorrow';
      } else {
        prefix = '';
      }

      return prefix == '' ? suffix : '$prefix, $suffix';
    }
  } catch (exception, stackTrace) {
    logException(exception, stackTrace);
    return dateTime.toString();
  }
}
