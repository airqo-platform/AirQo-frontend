import 'dart:io';

import 'package:app/models/json_parsers.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

extension DateTimeExtension on DateTime {
  DateTime getDateOfFirstDayOfWeek() {
    var firstDate = this;
    var weekday = firstDate.weekday;

    if (weekday != 1) {
      var offset = weekday - 1;
      firstDate = firstDate.subtract(Duration(days: offset));
    }

    return firstDate.getDateOfFirstHourOfDay();
  }

  DateTime getDateOfFirstHourOfDay() {
    var dateStr = '${DateFormat('yyyy-MM-dd').format(this)}T00:00:00Z';

    return timeFromJson(dateStr);
  }

  DateTime getDateOfLastDayOfWeek() {
    var lastDate = this;
    var weekday = lastDate.weekday;

    if (weekday != 7) {
      var offset = 7 - weekday;
      lastDate = lastDate.add(Duration(days: offset));
    }

    return lastDate.getDateOfFirstHourOfDay();
  }

  DateTime getDateOfLastHourOfDay() {
    var dateStr = '${DateFormat('yyyy-MM-dd').format(this)}T23:00:00Z';

    return timeFromJson(dateStr);
  }

  String getDay(DateTime? datetime) {
    var referenceDay = datetime != null ? datetime.day : day;
    if (referenceDay.toString().length > 1) {
      return referenceDay.toString();
    }
    return '0$referenceDay';
  }

  DateTime getFirstDateOfCalendarMonth() {
    var firstDate = DateTime.parse('$year-${getMonth(null)}-01T00:00:00Z');

    while (firstDate.weekday != 1) {
      firstDate = firstDate.subtract(const Duration(days: 1));
    }

    return firstDate;
  }

  DateTime getFirstDateOfMonth() {
    var firstDate = DateTime.parse('$year-${getMonth(null)}-01T00:00:00Z');
    return firstDate;
  }

  DateTime getLastDateOfCalendarMonth() {
    var lastDate = DateTime.parse('$year-${getMonth(null)}'
        '-${getDay(getLastDateOfMonth())}T00:00:00Z');

    while (lastDate.weekday != 7) {
      lastDate = lastDate.add(const Duration(days: 1));
    }

    return lastDate;
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

  String getLongDate() {
    if (day.toString().endsWith('1')) {
      return '${day}st ${getLongMonthString()}';
    } else if (day.toString().endsWith('2')) {
      return '${day}st ${getLongMonthString()}';
    } else if (day.toString().endsWith('3')) {
      return '${day}rd ${getLongMonthString()}';
    } else {
      return '${day}th ${getLongMonthString()}';
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

  String getMonth(DateTime? datetime) {
    var referenceMonth = datetime != null ? datetime.month : month;
    if (referenceMonth.toString().length > 1) {
      return referenceMonth.toString();
    }
    return '0$referenceMonth';
  }

  String getShortDate() {
    if (day.toString().endsWith('1')) {
      return '${day}st ${getShortMonthString()}';
    } else if (day.toString().endsWith('2')) {
      return '${day}st ${getShortMonthString()}';
    } else if (day.toString().endsWith('3')) {
      return '${day}rd ${getShortMonthString()}';
    } else {
      return '${day}th ${getShortMonthString()}';
    }
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

  String getWeekday() {
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

  bool isInWeek(String referenceWeek) {
    var now = DateTime.now();
    DateTime referenceDay;
    DateTime lastDay;
    if (referenceWeek.toLowerCase() == 'last') {
      referenceDay =
          now.subtract(const Duration(days: 7)).getDateOfFirstDayOfWeek();
      lastDay = now.subtract(const Duration(days: 7)).getDateOfLastDayOfWeek();
    } else if (referenceWeek.toLowerCase() == 'next') {
      referenceDay = now.add(const Duration(days: 7)).getDateOfFirstDayOfWeek();
      lastDay = now.add(const Duration(days: 7)).getDateOfLastDayOfWeek();
    } else {
      referenceDay = now.getDateOfFirstDayOfWeek();
      lastDay = now.getDateOfLastDayOfWeek();
    }

    while (referenceDay != lastDay) {
      if (day == referenceDay.day &&
          month == referenceDay.month &&
          year == referenceDay.year) {
        return true;
      }
      referenceDay = referenceDay.add(const Duration(days: 1));
    }

    return false;
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

  bool isYesterday() {
    if (day == yesterday().day &&
        month == yesterday().month &&
        year == yesterday().year) {
      return true;
    }

    return false;
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

  DateTime tomorrow() {
    return DateTime.now().add(const Duration(days: 1));
  }

  static DateTime yesterday() {
    return DateTime.now().subtract(const Duration(days: 1));
  }
}

extension FileExtenion on File {
  String getExtension() {
    return path.substring(path.lastIndexOf('.'));
  }
}

extension StringCasingExtension on String {
  bool equalsIgnoreCase(String value) {
    if (toLowerCase() == value.toLowerCase()) {
      return true;
    }
    return false;
  }

  bool isNull() {
    if (this == null ||
        isEmpty ||
        length == 0 ||
        this == '' ||
        toLowerCase() == 'null' ||
        toLowerCase().contains('null')) {
      return true;
    }

    return false;
  }

  bool isValidEmail() {
    if (isNull()) {
      return false;
    }
    return RegExp(
            r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
        .hasMatch(this);
  }

  bool isValidUri() {
    return Uri.parse(this).host == '' ? false : true;
  }

  String toCapitalized() {
    try {
      if (trim().toLowerCase() == 'ii' || trim().toLowerCase() == 'iv') {
        return toUpperCase();
      }
      return isNotEmpty
          ? '${this[0].toUpperCase()}${substring(1).toLowerCase()}'
          : '';
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return this;
    }
  }

  String toTitleCase() =>
      split(' ').map((str) => str.toCapitalized()).join(' ');
}
