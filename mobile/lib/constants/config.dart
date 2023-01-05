import 'package:app/models/models.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geolocator/geolocator.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class Config {
  static String get airqoApiToken => dotenv.env['AIRQO_API_TOKEN'] ?? '';
  static String get searchApiKey => dotenv.env['SEARCH_API_KEY'] ?? '';

  static String get airqoApiUrl =>
      dotenv.env['AIRQO_API_URL'] ?? 'https://api.airqo.net/api/v1/';

  static String get airqoApiUserExistsUrl =>
      dotenv.env['AIRQO_API_USER_EXISTS_URL'] ?? '';

  static String get favPlacesCollection =>
      dotenv.env['FAV_PLACES_COLLECTION'] ?? '';

  static String get kyaCollection => dotenv.env['KYA_COLLECTION'] ?? '';

  static String get usersNotificationCollection =>
      dotenv.env['USERS_NOTIFICATION_COLLECTION'] ?? '';

  static String get usersAnalyticsCollection =>
      dotenv.env['USERS_ANALYTICS_COLLECTION'] ?? '';

  static String get usersCollection => dotenv.env['USERS_COLLECTION'] ?? '';

  static String get usersKyaCollection =>
      dotenv.env['USERS_KYA_COLLECTION'] ?? '';

  static String get usersProfilePictureStorage =>
      dotenv.env['USERS_PROFILE_PICTURE_COLLECTION'] ?? '';

  static String get prefOnBoardingPage =>
      dotenv.env['PREF_ON_BOARDING_PAGE'] ?? '';

  static String get sentryDsn => dotenv.env['SENTRY_DSN'] ?? '';

  static String get placesSearchUrl =>
      'https://maps.googleapis.com/maps/api/place/';

  static String get appStoreUrl =>
      'https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091';

  static String get iosStoreId => '1337573091';

  static String get connectionErrorMessage => 'No internet connection';

  static String get environmentFile => kReleaseMode ? '.env.prod' : '.env.dev';

  static String get shareFailedMessage => 'Couldn\'t share image.';

  static String get playStoreUrl =>
      'https://play.google.com/store/apps/details?id=com.airqo.app';

  static int get searchRadius => 4;

  static String get termsUrl =>
      'https://docs.airqo.net/#/mobile_app/privacy_policy';

  static double get refreshTriggerPullDistance => 40;

  static double get refreshIndicatorExtent => 30;

  static double refreshIndicatorPadding(int index) {
    return index == 0 ? 16.0 : 0.0;
  }

  static LocationSettings locationSettings() {
    LocationSettings locationSettings;

    if (defaultTargetPlatform == TargetPlatform.android) {
      locationSettings = AndroidSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 100,
        forceLocationManager: true,
        intervalDuration: const Duration(minutes: 1),
      );
    } else if (defaultTargetPlatform == TargetPlatform.iOS ||
        defaultTargetPlatform == TargetPlatform.macOS) {
      locationSettings = AppleSettings(
        accuracy: LocationAccuracy.high,
        activityType: ActivityType.fitness,
        distanceFilter: 100,
        showBackgroundLocationIndicator: false,
      );
    } else {
      locationSettings = const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 100,
      );
    }

    return locationSettings;
  }
}

class AppConfig extends InheritedWidget {
  const AppConfig({
    Key? key,
    required Widget child,
    required this.environment,
    required this.appTitle,
  }) : super(
          key: key,
          child: child,
        );
  final Environment environment;
  final String appTitle;

  static AppConfig of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppConfig>()!;
  }

  @override
  bool updateShouldNotify(covariant InheritedWidget oldWidget) => false;
}
