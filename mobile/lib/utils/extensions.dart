import 'dart:io';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';

extension DoubleExtension on double {
  bool isWithin(double start, double end) {
    return this >= start && this <= end;
  }
}

extension CurrentLocationExt on CurrentLocation {
  bool hasChangedCurrentLocation(CurrentLocation newLocation) {
    final double distance = Geolocator.distanceBetween(
      latitude,
      longitude,
      newLocation.latitude,
      newLocation.longitude,
    );

    return distance >= Config.locationChangeRadiusInMetres;
  }
}

extension SetExt<T> on Set<T> {
  void addOrUpdate(T updatedItem) {
    if (contains(updatedItem)) {
      remove(updatedItem);
    }
    add(updatedItem);
  }
}

extension InsightListExt on List<Insight> {
  void sortByDateTime() {
    sort((x, y) => x.dateTime.compareTo(y.dateTime));
  }
}

extension AddressComponentListExt on List<AddressComponent> {
  String getName() {
    AddressComponent addressComponent = firstWhere(
      (element) => element.types.contains("route"),
      orElse: () => firstWhere(
        (element) => element.types.contains("sublocality_level_1"),
        orElse: () => firstWhere(
          (element) => element.types.contains("sublocality"),
          orElse: () => firstWhere(
            (element) => element.types.contains("locality"),
          ),
        ),
      ),
    );

    return addressComponent.shortName;
  }

  String getLocation() {
    AddressComponent locationComponent = firstWhere(
      (element) => element.types.contains("administrative_area_level_2"),
      orElse: () => firstWhere(
        (element) => element.types.contains("administrative_area_level_1"),
      ),
    );
    AddressComponent countryComponent = firstWhere(
      (element) => element.types.contains("country"),
    );

    return "${locationComponent.shortName}, ${countryComponent.longName}";
  }
}

extension FavouritePlaceListExt on List<FavouritePlace> {
  void sortByAirQuality() {
    sort((x, y) {
      if (x.airQualityReading != null && y.airQualityReading != null) {
        return x.airQualityReading?.pm2_5
                .compareTo(y.airQualityReading?.pm2_5 ?? 0) ??
            0;
      }

      return x.airQualityReading == null ? 1 : -1;
    });
  }
}

extension ForecastListExt on List<Forecast> {
  void sortByDateTime() {
    sort((x, y) => x.time.compareTo(y.time));
  }

  List<Forecast> removeInvalidData() =>
      where((element) => element.time.isAfterOrEqualToToday()).toList();
}

extension KyaExt on Kya {
  String getKyaMessage() {
    if (isInProgress()) {
      return 'Continue';
    } else if (isPendingCompletion()) {
      return 'Complete! Move to For You';
    } else {
      return 'Start learning';
    }
  }

  bool isPendingCompletion() {
    return progress == 1;
  }

  bool isComplete() {
    return progress == -1;
  }

  bool isEmpty() {
    return lessons.isEmpty;
  }

  bool isInProgress() {
    return progress > 0 && progress < 1;
  }

  bool todo() {
    return progress == 0;
  }

  double getProgress(int visibleCardIndex) {
    return (visibleCardIndex + 1) / lessons.length;
  }
}

extension KyaListExt on List<Kya> {
  void sortByProgress() {
    sort((x, y) {
      if (x.progress == -1) return -1;

      if (y.progress == -1) return 1;

      return -(x.progress.compareTo(y.progress));
    });
  }

  List<Kya> filterInProgressKya() {
    return where((element) {
      return element.isInProgress();
    }).toList();
  }

  List<Kya> filterToDo() {
    return where((element) {
      return element.todo();
    }).toList();
  }

  List<Kya> filterPendingCompletion() {
    return where((element) {
      return element.isPendingCompletion();
    }).toList();
  }

  List<Kya> filterComplete() {
    return where((element) {
      return element.isComplete();
    }).toList();
  }
}

extension AppNotificationListExt on List<AppNotification> {
  List<AppNotification> filterUnRead() {
    return where((element) => !element.read).toList();
  }
}

extension LocationHistoryExt on List<LocationHistory> {
  void sortByDateTime() {
    sort(
      (x, y) {
        return -(x.dateTime.compareTo(y.dateTime));
      },
    );
  }
}

extension SearchHistoryListExt on List<SearchHistory> {
  void sortByDateTime() {
    sort((a, b) => -(a.dateTime.compareTo(b.dateTime)));
  }

  Future<List<SearchHistory>> attachedAirQualityReadings() async {
    List<SearchHistory> history = [];
    for (final searchHistory in this) {
      AirQualityReading? airQualityReading =
          await LocationService.getNearestSite(
        searchHistory.latitude,
        searchHistory.longitude,
      );
      if (airQualityReading != null) {
        airQualityReading = airQualityReading.copyWith(
          name: searchHistory.name,
          location: searchHistory.location,
          placeId: searchHistory.placeId,
          latitude: searchHistory.latitude,
          longitude: searchHistory.longitude,
        );
      }
      history.add(searchHistory.copyWith(airQualityReading: airQualityReading));
    }
    return history;
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

  String insightsMessage() {
    String message = '';
    String verb = dateTime.isAPastDate() ? " was" : " is";
    String dateAdverb = dateTime.isYesterday() ? " yesterday" : "";

    switch (airQuality) {
      case AirQuality.good:
        message =
            'The air quality$dateAdverb in $name$verb quite ${airQuality.title}.';
        break;
      case AirQuality.moderate:
        message =
            'The air quality$dateAdverb in $name$verb at a ${airQuality.title} level.';
        break;
      case AirQuality.ufsgs:
        message =
            'The air quality$dateAdverb in $name$verb ${airQuality.title}.';
        break;
      case AirQuality.unhealthy:
        message =
            'The air quality$dateAdverb in $name$verb ${airQuality.title} for everyone';
        break;
      case AirQuality.veryUnhealthy:
        message =
            'The air quality$dateAdverb in $name$verb ${airQuality.title} reaching levels of high alert.';
        break;
      case AirQuality.hazardous:
        message =
            'The air quality$dateAdverb in $name$verb ${airQuality.title} and can cause a health emergency.';
        break;
    }

    return message;
  }
}

extension InsightExt on Insight {
  String shortDate() {
    if (dateTime.isYesterday()) {
      return 'Yesterday';
    } else if (dateTime.isWithInPreviousWeek()) {
      return 'Last Week';
    } else if (dateTime.isWithInNextWeek()) {
      return 'Next Week';
    } else if (dateTime.isToday()) {
      return 'Today';
    } else if (dateTime.isTomorrow()) {
      return 'Tomorrow';
    } else if (dateTime.isWithInCurrentWeek()) {
      return 'This week';
    }

    return '';
  }

  String healthTipsTitle() {
    if (dateTime.isToday()) {
      return 'Today’s health tips';
    }

    if (dateTime.isTomorrow()) {
      return 'Tomorrow’s health tips';
    }

    if (dateTime.isAFutureDate()) {
      return '${dateTime.getWeekday().toTitleCase()}’s health tips';
    }

    return '';
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
  void sortByAirQuality({bool sortCountries = false}) {
    sort((a, b) {
      if (sortCountries && a.country.compareTo(b.country) != 0) {
        return a.country.compareTo(b.country);
      }

      return a.pm2_5.compareTo(b.pm2_5);
    });
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

  void sortByDistanceToReferenceSite() {
    sort(
      (x, y) {
        return x.distanceToReferenceSite.compareTo(y.distanceToReferenceSite);
      },
    );
  }

  List<AirQualityReading> removeInvalidData() =>
      where((element) => element.dateTime.isAfterOrEqualToYesterday()).toList();
}

extension ProfileExt on Profile {
  String displayName() {
    if (firstName != '') {
      return firstName.trim();
    } else if (lastName != '') {
      return lastName.trim();
    } else {
      return 'Hello';
    }
  }

  String fullName() {
    return '$firstName $lastName'.trim();
  }

  TitleOptions getTitle() {
    if (title == TitleOptions.ms.value) {
      return TitleOptions.ms;
    } else if (title == TitleOptions.mr.value) {
      return TitleOptions.mr;
    } else {
      return TitleOptions.undefined;
    }
  }

  Gender gender() {
    if (title.toLowerCase().contains(TitleOptions.mr.value.toLowerCase())) {
      return Gender.male;
    } else if (title
        .toLowerCase()
        .contains(TitleOptions.ms.value.toLowerCase())) {
      return Gender.female;
    } else {
      return Gender.undefined;
    }
  }

  String initials() {
    var initials = '';
    if (firstName.isNotEmpty) {
      initials = firstName[0].toUpperCase();
    }

    if (lastName.isNotEmpty) {
      initials = '$initials${lastName[0].toUpperCase()}';
    }

    return initials.isEmpty ? 'A' : initials;
  }

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
  bool isSameDay(DateTime dateTime) {
    return day == dateTime.day;
  }

  String analyticsCardString() {
    const String timeFormat = 'hh:mm a';
    const String dateTimeFormat = 'd MMM, $timeFormat';
    String dateString = DateFormat(timeFormat).format(this);
    if (isYesterday()) {
      return 'Updated yesterday at $dateString';
    } else if (isToday()) {
      return 'Updated today at $dateString';
    } else if (isTomorrow()) {
      return 'Tomorrow, $dateString';
    } else {
      return DateFormat(dateTimeFormat).format(this);
    }
  }

  String timelineString() {
    return '${getWeekday()} ${DateFormat('d, MMMM').format(this)}'
        .toUpperCase();
  }

  DateTime getDateOfFirstDayOfWeek() {
    DateTime firstDate = this;
    firstDate = firstDate.subtract(Duration(days: firstDate.weekday - 1));

    return firstDate.getDateOfFirstHourOfDay();
  }

  DateTime getDateOfFirstHourOfDay() {
    return DateTime.utc(year, month, day);
  }

  bool isAfterOrEqualToYesterday() {
    return isYesterday() || compareTo(yesterday()) == 1;
  }

  bool isAfterOrEqualToToday() {
    return isToday() || compareTo(DateTime.now()) == 1;
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

  String getMonthString({bool abbreviate = false}) {
    final months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    if (month < 1 || month > 12) {
      throw UnimplementedError(
        '$month does not have a month string implementation',
      );
    }
    final monthString = months[month - 1];

    return abbreviate ? monthString.substring(0, 3) : monthString;
  }

  int getUtcOffset() {
    return timeZoneOffset.inHours;
  }

  String getWeekday() {
    final weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    if (weekday < 1 || weekday > 7) {
      throw UnimplementedError(
        '$weekday does not have a weekday string implementation',
      );
    }

    return weekdays[weekday - 1];
  }

  bool isWithInCurrentWeek() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final now = formatter.parse(formatter.format(DateTime.now()));
    DateTime firstDay = now.getDateOfFirstDayOfWeek();
    DateTime lastDay = now.getDateOfLastDayOfWeek();
    final date = formatter.parse(formatter.format(this));

    return date.isAfterOrEqualTo(firstDay) && date.isBeforeOrEqualTo(lastDay);
  }

  bool isWithInPreviousWeek() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final now = formatter.parse(formatter.format(DateTime.now()));
    DateTime firstDay = formatter.parse(
      formatter.format(
        now.subtract(const Duration(days: 7)).getDateOfFirstDayOfWeek(),
      ),
    );
    DateTime lastDay = formatter.parse(
      formatter.format(
        now.subtract(const Duration(days: 7)).getDateOfLastDayOfWeek(),
      ),
    );
    final date = formatter.parse(formatter.format(this));

    return date.isAfterOrEqualTo(firstDay) && date.isBeforeOrEqualTo(lastDay);
  }

  bool isWithInNextWeek() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final now = formatter.parse(formatter.format(DateTime.now()));
    DateTime firstDay = formatter.parse(
      formatter.format(
        now.add(const Duration(days: 7)).getDateOfFirstDayOfWeek(),
      ),
    );
    DateTime lastDay = formatter.parse(
      formatter.format(
        now.add(const Duration(days: 7)).getDateOfLastDayOfWeek(),
      ),
    );
    final date = formatter.parse(formatter.format(this));

    return date.isAfterOrEqualTo(firstDay) && date.isBeforeOrEqualTo(lastDay);
  }

  bool isToday() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final todayDate = formatter.parse(formatter.format(DateTime.now()));

    return formatter.parse(formatter.format(this)).compareTo(todayDate) == 0;
  }

  bool isAPastDate() {
    if (isYesterday()) {
      return true;
    }

    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final futureDate = formatter.parse(formatter.format(DateTime.now()));

    return formatter.parse(formatter.format(this)).compareTo(futureDate) < 0;
  }

  bool isAFutureDate() {
    if (isTomorrow()) {
      return true;
    }

    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    final futureDate = formatter.parse(formatter.format(DateTime.now()));

    return formatter.parse(formatter.format(this)).compareTo(futureDate) > 0;
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
    final now = DateTime.now();

    return (day == now.day)
        ? DateFormat('HH:mm').format(this)
        : DateFormat('dd MMM').format(this);
  }

  DateTime tomorrow() {
    return DateTime.now().add(const Duration(days: 1));
  }

  DateTime yesterday() {
    return DateTime.now().subtract(const Duration(days: 1));
  }
}

extension FileExt on File {
  String getExtension() {
    return path.substring(path.lastIndexOf('.'));
  }
}

extension StringExt on String {
  List<String> getFirstAndLastNames() {
    List<String> names = split(" ");
    if (names.isEmpty) {
      return ["", ""];
    }

    if (names.length >= 2) {
      String firstName = names.first;
      String lastName = names.sublist(1).join(" ");

      return [firstName, lastName];
    }

    return [names.first, ""];
  }

  bool equalsIgnoreCase(String value) {
    if (toLowerCase() == value.toLowerCase()) {
      return true;
    }

    return false;
  }

  bool isValidPhoneNumber() {
    if (isEmpty) {
      return false;
    }

    String trimmed = trim().replaceAll(RegExp(r'\s+'), "");

    return trimmed.startsWith('+') &&
        trimmed.length >= 7 &&
        trimmed.length <= 15 &&
        RegExp(r'^[0-9]+$').hasMatch(trimmed.substring(1));
  }

  bool isValidEmail() {
    if (isEmpty) return false;
    List<String> parts = split('@');
    if (parts.length != 2) return false;
    String localPart = parts.first;
    String domainPart = parts[1];
    RegExp localRegex = RegExp(r'^\w[\w.!#$%&*+/=?^_{|}~-]*$');
    RegExp domainRegex =
        RegExp(r'^\w(?:[\w-]{0,61}\w)?(?:\.\w(?:[\w-]{0,61}\w)?)+$');

    return localRegex.hasMatch(localPart) &&
        domainRegex.hasMatch(domainPart) &&
        domainPart.contains('.');
  }

  bool isValidUri() {
    try {
      Uri uri = Uri.parse(this);

      return uri.hasScheme && uri.hasAuthority;
    } catch (e) {
      return false;
    }
  }

  String toCapitalized() {
    if (isEmpty) {
      return '';
    }

    String trimmed = trim();
    if (trimmed.toLowerCase() == 'ii' || trimmed.toLowerCase() == 'iv') {
      return toUpperCase();
    }

    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }

  String toTitleCase() =>
      split(' ').map((str) => str.toCapitalized()).join(' ');

  String trimEllipsis() {
    return replaceAll('', '\u{200B}');
  }
}

extension NullStringExt on String? {
  bool isValidLocationName() {
    String? value = this;
    if (value == null) return false;

    return value.isNotEmpty;
  }
}
