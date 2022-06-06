import 'dart:io';
import 'dart:ui';

import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';

import '../models/enum_constants.dart';
import '../models/kya.dart';
import '../themes/colors.dart';

extension KyaExtension on Kya {
  String imageUrlCacheKey() {
    return 'kya-$id-image-url';
  }

  String secondaryImageUrlCacheKey() {
    return 'kya-$id-secondary-image_url';
  }
}

extension FeedbackTypeExtension on FeedbackType {
  String stringValue() {
    switch (this) {
      case FeedbackType.inquiry:
        return 'Inquiry';
      case FeedbackType.suggestion:
        return 'Suggestion';
      case FeedbackType.appBugs:
        return 'App Bugs';
      case FeedbackType.reportAirPollution:
        return 'Report Air Pollution';
      case FeedbackType.none:
        return '';
    }
  }
}

extension FeedbackChannelExtension on FeedbackChannel {
  String stringValue() {
    switch (this) {
      case FeedbackChannel.whatsApp:
        return 'Whatsapp';
      case FeedbackChannel.email:
        return 'Email';
      case FeedbackChannel.none:
        return '';
    }
  }
}

extension KyaLessonExtension on KyaLesson {
  String imageUrlCacheKey(Kya kya) {
    return 'kya-${kya.id}-${kya.lessons.indexOf(this)}-lesson-image-url';
  }
}

extension AirQualityExtension on AirQuality {
  String valueAsString() {
    switch (this) {
      case AirQuality.good:
        return 'Good';
      case AirQuality.moderate:
        return 'Moderate';
      case AirQuality.ufsgs:
        return 'Unhealthy For Sensitive Groups';
      case AirQuality.unhealthy:
        return 'Unhealthy';
      case AirQuality.veryUnhealthy:
        return 'Very Unhealthy';
      case AirQuality.hazardous:
        return 'Hazardous';
    }
  }
}

extension DoubleExtension on double {
  bool isWithin(double start, double end) {
    return this >= start && this <= end;
  }
}

extension PollutantExtension on Pollutant {
  AirQuality airQuality(double value) {
    switch (this) {
      case Pollutant.pm2_5:
        if (value <= 12.09) {
          return AirQuality.good;
        } else if (value.isWithin(12.1, 35.49)) {
          return AirQuality.moderate;
        } else if (value.isWithin(35.5, 55.49)) {
          return AirQuality.ufsgs;
        } else if (value.isWithin(55.5, 150.49)) {
          return AirQuality.unhealthy;
        } else if (value.isWithin(150.5, 250.49)) {
          return AirQuality.veryUnhealthy;
        } else if (value >= 250.5) {
          return AirQuality.hazardous;
        } else {
          return AirQuality.good;
        }
      case Pollutant.pm10:
        if (value <= 50.99) {
          return AirQuality.good;
        } else if (value.isWithin(51.00, 100.99)) {
          return AirQuality.moderate;
        } else if (value.isWithin(101.00, 250.99)) {
          return AirQuality.ufsgs;
        } else if (value.isWithin(251.00, 350.99)) {
          return AirQuality.unhealthy;
        } else if (value.isWithin(351.00, 430.99)) {
          return AirQuality.veryUnhealthy;
        } else if (value >= 431.00) {
          return AirQuality.hazardous;
        } else {
          return AirQuality.good;
        }
    }
  }

  String infoDialogText(double value) {
    switch (airQuality(value)) {
      case AirQuality.good:
        return 'Air quality is safe for everyone!';
      case AirQuality.moderate:
        return 'Unusually sensitive people should consider reducing '
            'prolonged or intense outdoor activities.';
      case AirQuality.ufsgs:
        return 'The elderly and children should limit intense outdoor '
            'activities. Sensitive people should reduce prolonged or '
            'intense outdoor activities.';
      case AirQuality.unhealthy:
        return 'People with respiratory or heart disease,'
            ' the elderly and children should avoid '
            'intense outdoor activities.'
            'Everyone else should limit intense outdoor activities.';
      case AirQuality.veryUnhealthy:
        return 'People with respiratory or heart disease, '
            'the elderly and children should avoid any outdoor activity.'
            'Everyone else should limit intense outdoor activities.';
      case AirQuality.hazardous:
        return 'Everyone should avoid any intense outdoor activities. '
            'People with respiratory or heart disease,'
            ' the elderly and children should remain indoors.';
    }
  }

  Color color(double value) {
    switch (airQuality(value)) {
      case AirQuality.good:
        return CustomColors.aqiGreen;
      case AirQuality.moderate:
        return CustomColors.aqiYellow;
      case AirQuality.ufsgs:
        return CustomColors.aqiOrange;
      case AirQuality.unhealthy:
        return CustomColors.aqiRed;
      case AirQuality.veryUnhealthy:
        return CustomColors.aqiPurple;
      case AirQuality.hazardous:
        return CustomColors.aqiMaroon;
    }
  }

  String stringValue(double value) {
    return airQuality(value).valueAsString();
  }

  charts.Color chartColor(double value) {
    switch (airQuality(value)) {
      case AirQuality.good:
        return charts.ColorUtil.fromDartColor(CustomColors.aqiGreen);
      case AirQuality.moderate:
        return charts.ColorUtil.fromDartColor(CustomColors.aqiYellow);
      case AirQuality.ufsgs:
        return charts.ColorUtil.fromDartColor(CustomColors.aqiOrange);
      case AirQuality.unhealthy:
        return charts.ColorUtil.fromDartColor(CustomColors.aqiRed);
      case AirQuality.veryUnhealthy:
        return charts.ColorUtil.fromDartColor(CustomColors.aqiPurple);
      case AirQuality.hazardous:
        return charts.ColorUtil.fromDartColor(CustomColors.aqiMaroon);
    }
  }

  Color textColor({required double value, bool graph = false}) {
    switch (airQuality(value)) {
      case AirQuality.good:
        return CustomColors.aqiGreenTextColor;
      case AirQuality.moderate:
        return CustomColors.aqiYellowTextColor;
      case AirQuality.ufsgs:
        return CustomColors.aqiOrangeTextColor;
      case AirQuality.unhealthy:
        return CustomColors.aqiRedTextColor;
      case AirQuality.veryUnhealthy:
        return CustomColors.aqiPurpleTextColor;
      case AirQuality.hazardous:
        if (graph) {
          return CustomColors.aqiMaroon;
        }
        return CustomColors.aqiMaroonTextColor;
    }
  }
}

extension AnalyticsEventExtension on AnalyticsEvent {
  String getName() {
    const prefix = kReleaseMode ? 'prod_' : 'stage_';

    switch (this) {
      case AnalyticsEvent.browserAsAppGuest:
        return '${prefix}browser_as_guest';
      case AnalyticsEvent.createUserProfile:
        return '${prefix}created_profile';
      case AnalyticsEvent.rateApp:
        return '${prefix}rate_app';
      case AnalyticsEvent.shareAirQualityInformation:
        return '${prefix}share_air_quality_information';
      case AnalyticsEvent.allowLocation:
        return '${prefix}allow_location';
      case AnalyticsEvent.allowNotification:
        return '${prefix}allow_notification';
      case AnalyticsEvent.uploadProfilePicture:
        return '${prefix}upload_profile_picture';
      case AnalyticsEvent.completeOneKYA:
        return '${prefix}complete_kya_lesson';
      case AnalyticsEvent.savesFiveFavorites:
        return '${prefix}save_five_favorite_places';
      case AnalyticsEvent.maleUser:
        return '${prefix}male_user';
      case AnalyticsEvent.femaleUser:
        return '${prefix}female_user';
      case AnalyticsEvent.undefinedGender:
        return '${prefix}undefined_gender';
      case AnalyticsEvent.iosUser:
        return '${prefix}ios_user';
      case AnalyticsEvent.androidUser:
        return '${prefix}android_user';
      case AnalyticsEvent.mtnUser:
        return '${prefix}mtn_user';
      case AnalyticsEvent.airtelUser:
        return '${prefix}airtel_user';
      case AnalyticsEvent.otherNetwork:
        return '${prefix}other_network_user';
      case AnalyticsEvent.deletedAccount:
        return '${prefix}deleted_account';
      case AnalyticsEvent.notificationOpen:
        return '${prefix}notification_open';
      case AnalyticsEvent.notificationReceive:
        return '${prefix}notification_receive';
      default:
        throw UnimplementedError(
            '${toString()} does\'nt have a name implementation');
    }
  }
}

extension DateTimeExtension on DateTime {
  DateTime getDateOfFirstDayOfWeek() {
    var firstDate = this;
    final weekday = firstDate.weekday;

    if (weekday != 1) {
      final offset = weekday - 1;
      firstDate = firstDate.subtract(Duration(days: offset));
    }

    return firstDate.getDateOfFirstHourOfDay();
  }

  DateTime getDateOfFirstHourOfDay() {
    return DateTime.parse('${DateFormat('yyyy-MM-dd').format(this)}T00:00:00Z');
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
    final firstDate = DateTime.parse('$year-${getMonth()}-01T00:00:00Z');
    return firstDate;
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
        return abbreviate ? 'May' : 'May';
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
            '$month does\'nt have a month string implementation');
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
            '$weekday does\'nt have a weekday string implementation');
    }
  }

  bool isInWeek(String referenceWeek) {
    final now = DateTime.now();
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

extension FileExtenion on File {
  String getExtension() {
    return path.substring(path.lastIndexOf('.'));
  }
}

extension FrequencyExtension on Frequency {
  String getName() {
    switch (this) {
      case Frequency.daily:
        return 'daily';
      case Frequency.hourly:
        return 'hourly';
      default:
        return '';
    }
  }
}

extension RegionExtension on Region {
  String getName() {
    switch (this) {
      case Region.central:
        return 'Central Region';
      case Region.eastern:
        return 'Eastern Region';
      case Region.western:
        return 'Western Region';
      case Region.northern:
        return 'Northern Region';
      default:
        return '';
    }
  }
}

extension OnBoardingPageExtension on OnBoardingPage {
  String getName() {
    switch (this) {
      case OnBoardingPage.signup:
        return 'signup';
      case OnBoardingPage.profile:
        return 'profile';
      case OnBoardingPage.notification:
        return 'notification';
      case OnBoardingPage.location:
        return 'location';
      case OnBoardingPage.complete:
        return 'complete';
      case OnBoardingPage.home:
        return 'home';
      case OnBoardingPage.welcome:
        return 'welcome';
      default:
        return '';
    }
  }
}

extension StringCasingExtension on String {
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

  String trimEllipsis() {
    return replaceAll('', '\u{200B}');
  }
}

extension AuthMethodExtension on AuthMethod {
  String optionsText(AuthProcedure procedure) {
    switch (this) {
      case AuthMethod.phone:
        return procedure == AuthProcedure.login
            ? 'Login with your mobile number or email'
            : 'Sign up with your mobile number or email';
      case AuthMethod.email:
        return procedure == AuthProcedure.login
            ? 'Login with your email or mobile number'
            : 'Sign up with your email or mobile number';
      default:
        throw UnimplementedError(
            '$name does\'nt have options text implementation');
    }
  }

  String optionsButtonText(AuthProcedure procedure) {
    switch (this) {
      case AuthMethod.phone:
        return procedure == AuthProcedure.login
            ? 'Login with an email instead'
            : 'Sign up with an email instead';
      case AuthMethod.email:
        return procedure == AuthProcedure.login
            ? 'Login with a mobile number instead'
            : 'Sign up with a mobile number instead';
      default:
        throw UnimplementedError(
            '$name does\'nt have options button text implementation');
    }
  }
}

extension TitleOptionsExtension on TitleOptions {
  String getDisplayName() {
    switch (this) {
      case TitleOptions.ms:
        return 'Ms.';
      case TitleOptions.mr:
        return 'Mr.';
      case TitleOptions.undefined:
        return 'Rather Not Say';
      default:
        return '';
    }
  }

  String getValue() {
    switch (this) {
      case TitleOptions.ms:
        return 'Ms';
      case TitleOptions.mr:
        return 'Mr';
      case TitleOptions.undefined:
        return 'Rather Not Say';
      default:
        return '';
    }
  }
}
