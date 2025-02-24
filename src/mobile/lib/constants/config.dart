import 'package:app/models/models.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geolocator/geolocator.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class Config {
  static String get airqoJWTToken => dotenv.env['AIRQO_API_TOKEN'] ?? '';

  static String get airqoApiV2Token => dotenv.env['AIRQO_API_V2_TOKEN'] ?? '';

  static String get searchApiKey => dotenv.env['SEARCH_API_KEY'] ?? '';

  static String get slackWebhookUrl => dotenv.env['SLACK_WEBHOOK_URL'] ?? '';

  static double get minimumTextScaleFactor => 1.0;

  static double get maximumTextScaleFactor => 1.1;

  static String get airqoApi => 'https://platform.airqo.net/api';

  static String get automatedTestsEmail => "automated-tests@airqo.net";

  static String get automatedTestsPhoneNumber => "+256757800000";

  static String get guestLogInFailed =>
      'Failed to login as guest. Try again later';

  static String get usersNotificationCollection =>
      dotenv.env['USERS_NOTIFICATION_COLLECTION'] ?? '';

  static String get usersCollection => dotenv.env['USERS_COLLECTION'] ?? '';

  static String get usersProfilePictureStorage =>
      dotenv.env['USERS_PROFILE_PICTURE_COLLECTION'] ?? '';

  static String get prefOnBoardingPage =>
      dotenv.env['PREF_ON_BOARDING_PAGE'] ?? '';

  static String get homePageShowcase => 'homePageShowcase';

  static String get settingsPageShowcase => 'settingsPageShowcase';

  static String get forYouPageShowcase => 'forYouPageShowcase';

  static String get restartTourShowcase => 'restartTourShowcase';

  static String get iosMinimumShareVersion =>
      dotenv.env['IOS_MINIMUM_SHARE_VERSION'] ?? '2.0.17';

  static int get androidMinimumShareVersion =>
      int.parse(dotenv.env['ANDROID_MINIMUM_SHARE_VERSION'] ?? '20029');

  static String get airqoSecondaryLogo =>
      'https://storage.cloud.google.com/airqo-app/public-images/airqo_logo.png';

  static String get iosStoreId => '1337573091';

  static String get iosBundleId => 'com.airqo.net';

  static String get androidPackageName => 'com.airqo.app';

  static String get signOutFailed => 'Failed to sign out. Try again later';

  static String get connectionErrorMessage => 'No internet connection';

  static String get environmentFile => kReleaseMode ? '.env.prod' : '.env.dev';

  static int get locationChangeRadiusInMetres => 100;

  static int get searchRadius => 4;

  static int get surroundingsSitesMaxRadiusInKilometres => 20;

  static int get shareLinkMaxLength => 56;

  static double get refreshTriggerPullDistance => 40;

  static double get refreshIndicatorExtent => 30;

  static String get notificationsTopic => 'push-notifications';

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
        distanceFilter: Config.locationChangeRadiusInMetres,
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
    super.key,
    required super.child,
    required this.environment,
    required this.appTitle,
  });
  final Environment environment;
  final String appTitle;

  static AppConfig of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppConfig>()!;
  }

  @override
  bool updateShouldNotify(covariant InheritedWidget oldWidget) => false;
}
