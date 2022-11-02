import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'enum_constants.g.dart';

enum AnalyticsEvent {
  browserAsAppGuest('browser_as_guest'),
  createUserProfile('created_profile'),
  shareAirQualityInformation('share_air_quality_information'),
  completeOneKYA('complete_kya_lesson'),
  allowNotification('allow_notification'),
  allowLocation('allow_location'),
  uploadProfilePicture('upload_profile_picture'),
  savesFiveFavorites('save_five_favorite_places'),
  maleUser('male_user'),
  femaleUser('female_user'),
  undefinedGender('undefined_gender'),
  iosUser('ios_user'),
  androidUser('android_user'),
  rateApp('rate_app'),
  mtnUser('mtn_user'),
  airtelUser('airtel_user'),
  otherNetwork('other_network'),
  deletedAccount('deleted_account'),
  notificationOpen('notification_open'),
  notificationReceive('notification_receive');

  const AnalyticsEvent(this.snakeCaseValue);

  final String snakeCaseValue;

  String snakeCase() {
    return '${kReleaseMode ? 'prod_' : 'stage_'}$snakeCaseValue';
  }
}

enum InsightsStatus {
  loaded,
  error,
  refreshing,
  loading,
  failed;
}

enum AppPermission {
  notification,
  location,
}

enum NearbyAirQualityError {
  locationDenied(
    message: 'Grant location access in your phone settings',
    snackBarActionLabel: 'Open Settings',
    snackBarDuration: 5,
  ),
  locationDisabled(
    message: 'Turn on location to get air quality near you',
    snackBarActionLabel: 'Open Settings',
    snackBarDuration: 5,
  ),
  locationNotAllowed(
    message: 'Enable location in your settings.',
    snackBarActionLabel: 'Open Settings',
    snackBarDuration: 5,
  ),
  noNearbyAirQualityReadings(
    message: 'Cannot get nearby air quality readings',
    snackBarActionLabel: 'Close',
    snackBarDuration: 2,
  );

  const NearbyAirQualityError({
    required this.message,
    required this.snackBarActionLabel,
    required this.snackBarDuration,
  });

  final String message;
  final String snackBarActionLabel;
  final int snackBarDuration;

  @override
  String toString() => message;
}

@HiveType(typeId: 110, adapterName: 'AppNotificationTypeAdapter')
enum AppNotificationType {
  @HiveField(0)
  appUpdate,
  @HiveField(1)
  reminder,
  @HiveField(2)
  welcomeMessage,
}

@HiveType(typeId: 140, adapterName: 'RegionAdapter')
enum Region {
  @HiveField(1)
  central('Central Region'),
  @HiveField(2)
  eastern('Eastern Region'),
  @HiveField(3)
  northern('Northern Region'),
  @HiveField(4)
  western('Western Region'),
  @HiveField(5)
  southern('Southern Region'),
  @HiveField(0)
  none('');

  factory Region.fromString(String string) {
    if (string.toLowerCase().contains('central')) {
      return Region.central;
    } else if (string.toLowerCase().contains('east')) {
      return Region.eastern;
    } else if (string.toLowerCase().contains('west')) {
      return Region.western;
    } else if (string.toLowerCase().contains('north')) {
      return Region.northern;
    } else if (string.toLowerCase().contains('south')) {
      return Region.southern;
    } else {
      return Region.none;
    }
  }

  const Region(this.string);

  final String string;

  @override
  String toString() => string;
}

class RegionConverter implements JsonConverter<Region, String> {
  const RegionConverter();

  @override
  String toJson(Region region) {
    return region.toString();
  }

  @override
  Region fromJson(String jsonString) {
    return Region.fromString(jsonString);
  }
}

enum AirQuality {
  good('Good'),
  moderate('Moderate'),
  ufsgs('Unhealthy For Sensitive Groups'),
  unhealthy('Unhealthy'),
  veryUnhealthy('Very Unhealthy'),
  hazardous('Hazardous');

  const AirQuality(this.string);

  final String string;

  @override
  String toString() => string;
}

enum FeedbackType {
  inquiry('Inquiry'),
  suggestion('Suggestion'),
  appBugs('App Bugs'),
  reportAirPollution('Report Air Pollution'),
  none('');

  const FeedbackType(this.string);

  final String string;

  @override
  String toString() => string;
}

enum FeedbackChannel {
  whatsApp('Whatsapp'),
  email('Email'),
  none('');

  const FeedbackChannel(this.string);

  final String string;

  @override
  String toString() => string;
}

enum AuthMethod {
  phone(
    updateMessage:
        'You shall not be able to sign in with your previous phone number after changing it',
  ),
  email(
    updateMessage:
        'You shall not be able to sign in with your previous email address after changing it',
  ),
  none(
    updateMessage: 'You do not have an account. Consider creating one',
  );

  const AuthMethod({required this.updateMessage});

  final String updateMessage;

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
          '$name does’nt have options text implementation',
        );
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
          '$name does’nt have options button text implementation',
        );
    }
  }
}

enum AuthProcedure {
  login(
    confirmationTitle: '',
    confirmationBody: '',
    confirmationOkayText: '',
    confirmationCancelText: '',
  ),
  signup(
    confirmationTitle: '',
    confirmationBody: '',
    confirmationOkayText: '',
    confirmationCancelText: '',
  ),
  anonymousLogin(
    confirmationTitle: '',
    confirmationBody: '',
    confirmationOkayText: '',
    confirmationCancelText: '',
  ),
  deleteAccount(
    confirmationTitle: 'Heads up!!!.. you are about to delete your account!',
    confirmationBody: 'You will lose all your saved places',
    confirmationOkayText: 'Proceed',
    confirmationCancelText: 'Cancel',
  ),
  logout(
    confirmationTitle: 'Heads up!!!.. you are about to logout!',
    confirmationBody:
        'You will miss out on notifications and won’t be able to save favourite places',
    confirmationOkayText: 'Proceed',
    confirmationCancelText: 'Cancel',
  );

  const AuthProcedure({
    required this.confirmationTitle,
    required this.confirmationBody,
    required this.confirmationOkayText,
    required this.confirmationCancelText,
  });

  final String confirmationTitle;
  final String confirmationBody;
  final String confirmationOkayText;
  final String confirmationCancelText;
}

enum Frequency {
  daily('daily'),
  hourly('hourly');

  const Frequency(this.string);

  final String string;

  @override
  String toString() => string;

  List<charts.TickSpec<String>> staticTicks() {
    switch (this) {
      case Frequency.daily:
        final dailyTicks = <charts.TickSpec<String>>[];
        for (final day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
          dailyTicks.add(
            charts.TickSpec(
              day,
              label: day,
              style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(
                  CustomColors.greyColor,
                ),
              ),
            ),
          );
        }

        return dailyTicks;

      case Frequency.hourly:
        final hourlyTicks = <charts.TickSpec<String>>[];
        final labels = <int>[0, 6, 12, 18];
        final hours = List<int>.generate(24, (index) => index + 1)
          ..removeWhere(labels.contains);

        for (final hour in labels) {
          hourlyTicks.add(
            charts.TickSpec(
              hour.toStringLength(),
              label: hour.toStringLength(),
              style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(
                  CustomColors.greyColor,
                ),
              ),
            ),
          );
        }

        for (final hour in hours) {
          hourlyTicks.add(
            charts.TickSpec(
              hour.toStringLength(),
              label: hour.toStringLength(),
              style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(
                  Colors.transparent,
                ),
              ),
            ),
          );
        }

        return hourlyTicks;
    }
  }
}

enum Gender {
  male,
  female,
  undefined,
}

enum ConfirmationAction {
  cancel,
  ok,
}

enum ErrorMessage {
  logout('Failed to logout', 'Try again later');

  const ErrorMessage(this.title, this.message);

  final String title;
  final String message;

  @override
  String toString() => title;
}

enum OnBoardingPage {
  signup('signup'),
  profile('profile'),
  notification('notification'),
  location('location'),
  complete('complete'),
  home('home'),
  welcome('welcome');

  const OnBoardingPage(this.string);

  final String string;

  @override
  String toString() => string;
}

enum Pollutant {
  pm2_5(svg: 'assets/icon/PM2.5.svg'),
  pm10(svg: 'assets/icon/PM10.svg');

  const Pollutant({required this.svg});

  final String svg;

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
    return airQuality(value).toString();
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

enum TitleOptions {
  ms(value: 'Ms', displayValue: 'Ms.', abbr: 'Ms.'),
  mr(value: 'Mr', displayValue: 'Mr.', abbr: 'Mr.'),
  undefined(
    value: 'Rather Not Say',
    displayValue: 'Rather Not Say',
    abbr: 'Ra.',
  );

  const TitleOptions({
    required this.value,
    required this.displayValue,
    required this.abbr,
  });

  final String value;
  final String displayValue;
  final String abbr;
}

enum ToolTipType {
  favouritePlaces,
  info,
  forYou,
  forecast,
}
