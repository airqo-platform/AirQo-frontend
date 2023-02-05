import 'dart:io';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

extension DoubleExtension on double {
  bool isWithin(double start, double end) {
    return this >= start && this <= end;
  }
}

extension IntExt on int {
  String toStringLength({int length = 1}) {
    return toString().length == length ? '0$this' : '$this';
  }
}

extension ChartDataExt on ChartData {
  String chartDomainFn() {
    switch (frequency) {
      case Frequency.daily:
        return DateFormat('EEE').format(dateTime);
      case Frequency.hourly:
        final hour = dateTime.hour;

        return hour.toString().length == 1 ? '0$hour' : '$hour';
    }
  }

  double chartValue(Pollutant pollutant) {
    return pollutant == Pollutant.pm2_5
        ? double.parse(pm2_5.toStringAsFixed(2))
        : double.parse(pm10.toStringAsFixed(2));
  }

  String lastUpdated(Frequency frequency) {
    String lastUpdated = '';

    if (dateTime.isToday()) {
      lastUpdated = 'Updated Today';

      return available ? lastUpdated : '$lastUpdated - Not Available';
    }

    switch (frequency) {
      case Frequency.daily:
        lastUpdated = 'Updated ${DateFormat('EEEE, d MMM').format(dateTime)}';
        break;
      case Frequency.hourly:
        lastUpdated = 'Updated ${DateFormat('hh:mm a').format(dateTime)}';
        break;
    }

    return available ? lastUpdated : '$lastUpdated - Not Available';
  }

  Color chartAvatarContainerColor(Pollutant pollutant) {
    return available
        ? pollutant.color(chartValue(pollutant))
        : CustomColors.greyColor;
  }

  String chartAvatarValue(Pollutant pollutant) {
    return available ? chartValue(pollutant).toStringAsFixed(0) : '--';
  }

  Color chartAvatarValueColor(Pollutant pollutant) {
    return available
        ? pollutant.textColor(value: chartValue(pollutant))
        : CustomColors.darkGreyColor;
  }
}

extension KyaExt on Kya {
  String getKyaMessage() {
    if (isInProgress()) {
      return 'Continue';
    } else if (isPartiallyComplete()) {
      return 'Complete! Move to For You';
    } else {
      return 'Start learning';
    }
  }

  bool isPartiallyComplete() {
    return progress == 1;
  }

  bool isComplete() {
    return progress == -1;
  }

  bool isInProgress() {
    return progress > 0 && progress < 1;
  }

  double getProgress(int visibleCardIndex) {
    return (visibleCardIndex + 1) / lessons.length;
  }
}

extension KyaListExt on List<Kya> {
  void sortByProgress() {
    sort((x, y) => -(x.progress.compareTo(y.progress)));
  }

  List<Kya> filterIncompleteKya() {
    return where((element) {
      return !element.isComplete();
    }).toList();
  }

  List<Kya> filterCompleteKya() {
    return where((element) {
      return element.isComplete();
    }).toList();
  }

  List<Kya> removeDuplicates() {
    List<Kya> cleanedKya = [];
    for (final kya in this) {
      final duplicates = where((e) => e.id == kya.id).toList();
      duplicates.sortByProgress();
      if (!cleanedKya.contains(duplicates.first)) {
        cleanedKya.add(duplicates.first);
      }
    }

    return cleanedKya;
  }
}

extension AnalyticsListExt on List<Analytics> {
  List<Analytics> sortByDateTime() {
    List<Analytics> data = List.of(this);
    data.sort(
      (x, y) {
        return -(x.createdAt.compareTo(y.createdAt));
      },
    );

    return data;
  }
}

extension SearchHistoryListExt on List<SearchHistory> {
  List<SearchHistory> sortByDateTime({bool latestFirst = true}) {
    List<SearchHistory> data = List.of(this);
    data.sort((a, b) {
      if (latestFirst) {
        return -(a.dateTime.compareTo(b.dateTime));
      }

      return a.dateTime.compareTo(b.dateTime);
    });

    return data;
  }

  Future<List<AirQualityReading>> attachedAirQualityReadings() async {
    List<AirQualityReading> airQualityReadings = [];
    for (final searchHistory in this) {
      AirQualityReading? airQualityReading =
          await LocationService.getNearestSite(
        searchHistory.latitude,
        searchHistory.longitude,
      );
      if (airQualityReading != null) {
        airQualityReadings.add(airQualityReading.copyWith(
          name: searchHistory.name,
          location: searchHistory.location,
          latitude: searchHistory.latitude,
          longitude: searchHistory.longitude,
          placeId: searchHistory.placeId,
          dateTime: searchHistory.dateTime,
        ));
      }
    }

    return airQualityReadings;
  }
}

extension AirQualityReadingExt on AirQualityReading {
  List<String> getSearchTerms(String parameter) {
    List<String> searchTerms = [];
    switch (parameter) {
      case 'name':
        searchTerms.addAll(name.trim().split(" "));
        break;
      case 'location':
        searchTerms.addAll(location.trim().split(" "));
        break;
      case 'region':
        searchTerms.addAll(region.trim().split(" "));
        break;
      case 'country':
        searchTerms.addAll(country.trim().split(" "));
        break;
      default:
        searchTerms
          ..addAll(name.trim().split(" "))
          ..addAll(location.trim().split(" "))
          ..addAll(region.trim().split(" "))
          ..addAll(country.trim().split(" "));
    }

    return searchTerms
        .toSet()
        .map((e) => e.toLowerCase().replaceAll(RegExp('[^A-Za-z]'), ''))
        .toList();
  }
}

extension SearchResultExt on SearchResult {
  List<String> getSearchTerms() {
    List<String> searchTerms = name.trim().split(" ")
      ..addAll(location.trim().split(" "));

    return searchTerms
        .toSet()
        .map((e) => e.toLowerCase().replaceAll(RegExp('[^A-Za-z]'), ''))
        .toList();
  }
}

extension AirQualityReadingListExt on List<AirQualityReading> {
  List<AirQualityReading> sortByAirQuality({bool sortCountries = false}) {
    List<AirQualityReading> data = List.of(this);
    data.sort((a, b) {
      if (sortCountries && a.country.compareTo(b.country) != 0) {
        return a.country.compareTo(b.country);
      }

      return a.pm2_5.compareTo(b.pm2_5);
    });

    return data;
  }

  List<AirQualityReading> filterNearestLocations() {
    List<AirQualityReading> airQualityReadings = List.of(this);
    airQualityReadings = airQualityReadings
        .where(
          (element) => element.distanceToReferenceSite <= Config.searchRadius,
        )
        .toList();

    return airQualityReadings.sortByDistanceToReferenceSite();
  }

  List<AirQualityReading> shuffleByCountry() {
    List<AirQualityReading> data = List.of(this);
    List<AirQualityReading> shuffledData = [];

    final List<String> countries = data.map((e) => e.country).toSet().toList();
    countries.shuffle();
    while (data.isNotEmpty) {
      for (final country in countries) {
        List<AirQualityReading> countryReadings = data
            .where((element) => element.country.equalsIgnoreCase(country))
            .take(1)
            .toList();
        shuffledData.addAll(countryReadings);
        for (final reading in countryReadings) {
          data.remove(reading);
        }
      }
    }

    return shuffledData;
  }

  List<AirQualityReading> sortByDistanceToReferenceSite() {
    List<AirQualityReading> data = List.of(this);
    data.sort(
      (x, y) {
        return x.distanceToReferenceSite.compareTo(y.distanceToReferenceSite);
      },
    );

    return data;
  }
}

extension ProfileExt on Profile {
  String greetings() {
    final hour = DateTime.now().hour;

    if (00 <= hour && hour < 12) {
      return 'Good morning $firstName'.trim();
    }

    if (12 <= hour && hour < 16) {
      return 'Good afternoon $firstName'.trim();
    }

    if (16 <= hour && hour <= 23) {
      return 'Good evening $firstName'.trim();
    }

    return 'Hello $firstName'.trim();
  }
}

extension DateTimeExt on DateTime {
  String shareString() {
    return DateFormat('EEE, d MMM yyyy hh:mm a').format(this);
  }

  String analyticsCardString() {
    String dateString = DateFormat('hh:mm a').format(this);
    if (isYesterday()) {
      return 'Updated yesterday at $dateString';
    } else if (isToday()) {
      return 'Updated today at $dateString';
    } else if (isTomorrow()) {
      return 'Tomorrow, $dateString';
    } else {
      return DateFormat('d MMM, hh:mm a').format(this);
    }
  }

  String timelineString() {
    return '${getWeekday()} ${DateFormat('d, MMMM').format(this)}'
        .toUpperCase();
  }

  DateTime getDateOfFirstDayOfWeek() {
    DateTime firstDate = this;
    while (firstDate.weekday != 1) {
      firstDate = firstDate.subtract(const Duration(days: 1));
    }

    return firstDate.getDateOfFirstHourOfDay();
  }

  Future<String> getGreetings() async {
    final profile = await Profile.getProfile();

    if (00 <= hour && hour < 12) {
      return 'Good morning ${profile.firstName}'.trim();
    }

    if (12 <= hour && hour < 16) {
      return 'Good afternoon ${profile.firstName}'.trim();
    }

    if (16 <= hour && hour <= 23) {
      return 'Good evening ${profile.firstName}'.trim();
    }

    return 'Hello ${profile.firstName}'.trim();
  }

  DateTime getDateOfFirstHourOfDay() {
    return DateTime.parse('${DateFormat('yyyy-MM-dd').format(this)}T00:00:00Z');
  }

  bool isAfterOrEqualTo(DateTime dateTime) {
    return compareTo(dateTime) == 1 || compareTo(dateTime) == 0;
  }

  bool isBeforeOrEqualTo(DateTime dateTime) {
    return compareTo(dateTime) == -1 || compareTo(dateTime) == 0;
  }

  DateTime getDateOfLastDayOfWeek() {
    var lastDate = this;
    final weekday = lastDate.weekday;

    if (weekday != 7) {
      final offset = 7 - weekday;
      lastDate = lastDate.add(Duration(days: offset));
    }

    return lastDate.getDateOfFirstHourOfDay();
  }

  DateTime getDateOfLastHourOfDay() {
    return DateTime.parse('${DateFormat('yyyy-MM-dd').format(this)}T23:00:00Z');
  }

  String getDay({DateTime? datetime}) {
    final referenceDay = datetime != null ? datetime.day : day;

    return formatToString(referenceDay);
  }

  DateTime getFirstDateOfCalendarMonth() {
    var firstDate = DateTime.parse('$year-${getMonth()}-01T00:00:00Z');

    while (firstDate.weekday != 1) {
      firstDate = firstDate.subtract(const Duration(days: 1));
    }

    return firstDate;
  }

  String toApiString() {
    return '$year-${formatToString(month)}-'
        '${formatToString(day)}T'
        '${formatToString(hour)}:${formatToString(minute)}:'
        '${formatToString(second)}Z';
  }

  String formatToString(int value) {
    if (value.toString().length > 1) {
      return value.toString();
    }

    return '0$value';
  }

  DateTime getFirstDateOfMonth() {
    return DateTime.parse('$year-${getMonth()}-01T00:00:00Z');
  }

  DateTime getLastDateOfCalendarMonth() {
    var lastDate = DateTime.parse('$year-${getMonth()}'
        '-${getDay(datetime: getLastDateOfMonth())}T00:00:00Z');

    while (lastDate.weekday != 7) {
      lastDate = lastDate.add(const Duration(days: 1));
    }

    return lastDate;
  }

  DateTime getLastDateOfMonth() {
    var lastDate = DateTime.parse('$year-${getMonth()}-26T00:00:00Z');
    final referenceMonth = month;

    while (lastDate.month == referenceMonth) {
      lastDate = lastDate.add(const Duration(days: 1));
    }
    lastDate = lastDate.subtract(const Duration(days: 1));

    return lastDate;
  }

  String getLongDate() {
    return '${getDayPostfix()} ${getMonthString()}';
  }

  String getMonth({DateTime? datetime}) {
    final referenceMonth = datetime != null ? datetime.month : month;

    return formatToString(referenceMonth);
  }

  String getDayPostfix() {
    if (day.toString().endsWith('1') && day != 11) {
      return '${day}st';
    } else if (day.toString().endsWith('2') && day != 12) {
      return '${day}nd';
    } else if (day.toString().endsWith('3') && day != 13) {
      return '${day}rd';
    } else {
      return '${day}th';
    }
  }

  String getMonthString({bool abbreviate = false}) {
    switch (month) {
      case 1:
        return abbreviate ? 'Jan' : 'January';
      case 2:
        return abbreviate ? 'Feb' : 'February';
      case 3:
        return abbreviate ? 'Mar' : 'March';
      case 4:
        return abbreviate ? 'Apr' : 'April';
      case 5:
        return 'May';
      case 6:
        return abbreviate ? 'Jun' : 'June';
      case 7:
        return abbreviate ? 'Jul' : 'July';
      case 8:
        return abbreviate ? 'Aug' : 'August';
      case 9:
        return abbreviate ? 'Sept' : 'September';
      case 10:
        return abbreviate ? 'Oct' : 'October';
      case 11:
        return abbreviate ? 'Nov' : 'November';
      case 12:
        return abbreviate ? 'Dec' : 'December';
      default:
        throw UnimplementedError(
          '$month does’nt have a month string implementation',
        );
    }
  }

  String getShortDate() {
    return '${getDayPostfix()} ${getMonthString(abbreviate: true)}';
  }

  int getUtcOffset() {
    return timeZoneOffset.inHours;
  }

  String getWeekday() {
    switch (weekday) {
      case 1:
        return 'monday';
      case 2:
        return 'tuesday';
      case 3:
        return 'wednesday';
      case 4:
        return 'thursday';
      case 5:
        return 'friday';
      case 6:
        return 'saturday';
      case 7:
        return 'sunday';
      default:
        throw UnimplementedError(
          '$weekday does’nt have a weekday string implementation',
        );
    }
  }

  bool isInWeek(String referenceWeek) {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final now = formatter.parse(formatter.format(DateTime.now()));
    DateTime firstDay;
    DateTime lastDay;
    switch (referenceWeek.toLowerCase()) {
      case 'last':
        firstDay =
            now.subtract(const Duration(days: 7)).getDateOfFirstDayOfWeek();
        lastDay =
            now.subtract(const Duration(days: 7)).getDateOfLastDayOfWeek();
        break;
      case 'next':
        firstDay = now.add(const Duration(days: 7)).getDateOfFirstDayOfWeek();
        lastDay = now.add(const Duration(days: 7)).getDateOfLastDayOfWeek();
        break;
      default:
        firstDay = now.getDateOfFirstDayOfWeek();
        lastDay = now.getDateOfLastDayOfWeek();
        break;
    }

    return isAfterOrEqualTo(firstDay) && isBeforeOrEqualTo(lastDay);
  }

  bool isToday() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final todayDate = formatter.parse(formatter.format(DateTime.now()));

    return formatter.parse(formatter.format(this)).compareTo(todayDate) == 0;
  }

  bool isTomorrow() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final tomorrowDate = formatter.parse(formatter.format(tomorrow()));

    return formatter.parse(formatter.format(this)).compareTo(tomorrowDate) == 0;
  }

  bool isYesterday() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final yesterdayDate = formatter.parse(formatter.format(yesterday()));

    return formatter.parse(formatter.format(this)).compareTo(yesterdayDate) ==
        0;
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
      return '$day ${getMonthString(abbreviate: true)}';
    }
  }

  DateTime tomorrow() {
    return DateTime.now().add(const Duration(days: 1));
  }

  static DateTime yesterday() {
    return DateTime.now().subtract(const Duration(days: 1));
  }
}

extension FileExt on File {
  String getExtension() {
    return path.substring(path.lastIndexOf('.'));
  }
}

extension StringExt on String {
  bool inStatement(String statement) {
    final terms = toLowerCase().split(' ');
    final words = statement.toLowerCase().split(' ');
    for (final word in words) {
      for (final term in terms) {
        if (term == word.trim()) {
          return true;
        }
      }
    }

    return false;
  }

  bool isValidName() {
    if (trim().isNull()) {
      return false;
    }

    return true;
  }

  bool equalsIgnoreCase(String value) {
    if (toLowerCase() == value.toLowerCase()) {
      return true;
    }

    return false;
  }

  bool isNull() {
    if (isEmpty ||
        length == 0 ||
        this == '' ||
        toLowerCase() == 'null' ||
        toLowerCase().contains('null')) {
      return true;
    }

    return false;
  }

  bool isValidPhoneNumber() {
    if (isNull()) {
      return false;
    }

    return trim().replaceAll(" ", "").length >= 7 &&
        trim().replaceAll(" ", "").length <= 15;
  }

  String inValidPhoneNumberMessage() {
    if (isNull()) {
      return 'A phone number cannot be empty';
    }

    if (trim().replaceAll(" ", "").length < 7) {
      return 'Looks like you missed a digit.';
    }

    if (trim().replaceAll(" ", "").length > 15) {
      return 'Entered many digits.';
    }

    return AuthenticationError.invalidPhoneNumber.message;
  }

  bool isValidEmail() {
    if (isNull()) {
      return false;
    }

    return RegExp(
      r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$',
    ).hasMatch(this);
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

  String trimEllipsis() {
    return replaceAll('', '\u{200B}');
  }
}
