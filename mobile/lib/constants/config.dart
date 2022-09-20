import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Config {
  static String get airqoApiToken => dotenv.env['AIRQO_API_TOKEN'] ?? '';

  static String get airqoApiUrl => dotenv.env['AIRQO_API_URL'] ?? '';

  static String get airqoSupportEmail => 'support@airqo.net';

  static String get airqoSupportUsername => 'AirQo Support';

  static String get airqoDataProductsEmail =>
      dotenv.env['AIRQO_DATA_PRODUCTS_EMAIL'] ?? '';

  static String get defaultFeedbackUserName => 'AirQo App User';

  static String get emailFeedbackUrl => dotenv.env['EMAIL_FEEDBACK_URL'] ?? '';

  static String get emailFeedbackAPIKey =>
      dotenv.env['EMAIL_FEEDBACK_API_KEY'] ?? '';

  static String get airqoApiUserExistsUrl =>
      dotenv.env['AIRQO_API_USER_EXISTS_URL'] ?? '';

  static String get appErrorMessage =>
      'Failed to process your request. Try again later';

  static String get whatsappUrl => Platform.isIOS
      ? dotenv.env['IOS_WHATSAPP_URL'] ?? ''
      : dotenv.env['ANDROID_WHATSAPP_URL'] ?? '';

  static String get appStoreUrl => dotenv.env['APP_STORE_URL'] ?? '';

  static String get carrierSearchApi => dotenv.env['CARRIER_SEARCH_API'] ?? '';

  static String get connectionErrorMessage => 'No internet connection';

  static String get dbName => dotenv.env['DATABASE_NAME'] ?? '';

  static String get environmentFile => kReleaseMode ? '.env.prod' : '.env.dev';

  static String get faqsUrl => dotenv.env['FAQS_URL'] ?? '';

  static String get favPlacesCollection =>
      dotenv.env['FAV_PLACES_COLLECTION'] ?? '';

  static String get searchApiKey => dotenv.env['SEARCH_API_KEY'] ?? '';

  static String get iosStoreId => dotenv.env['IOS_STORE_ID'] ?? '';

  static String get kyaCollection => dotenv.env['KYA_COLLECTION'] ?? '';

  static String get allowLocationMessage =>
      'Turn on and allow location permissions';

  static String get feedbackSuccessMessage => 'Thanks for the feedback';

  static String get shareFailedMessage => 'Could’nt share image.';

  static String get feedbackFailureMessage =>
      'Could not capture your feedback. Try again later';

  static String get locationErrorMessage =>
      'Cannot get your location at the moment';

  static int get maxSearchRadius => searchRadius * 2;

  static String get usersNotificationCollection =>
      dotenv.env['USERS_NOTIFICATION_COLLECTION'] ?? '';

  static String get usersAnalyticsCollection =>
      dotenv.env['USERS_ANALYTICS_COLLECTION'] ?? '';

  static String get placesSearchUrl => dotenv.env['PLACES_SEARCH_URL'] ?? '';

  static String get playStoreUrl => dotenv.env['PLAY_STORE_URL'] ?? '';

  static String get prefDashboardRegion =>
      dotenv.env['PREF_DASHBOARD_REGION'] ?? '';

  static String get prefOnBoardingPage =>
      dotenv.env['PREF_ON_BOARDING_PAGE'] ?? '';

  static String get prefReLoadDb => dotenv.env['PREF_RELOAD_DB'] ?? '';

  static int get searchRadius => int.parse('${dotenv.env['SEARCH_RADIUS']}');

  static String get sentryDsn => dotenv.env['SENTRY_DSN'] ?? '';

  static String get termsUrl => dotenv.env['TERMS_URL'] ?? '';

  static String get usersCollection => dotenv.env['USERS_COLLECTION'] ?? '';

  static String get usersKyaCollection =>
      dotenv.env['USERS_KYA_COLLECTION'] ?? '';

  static String get usersProfilePictureStorage =>
      dotenv.env['USERS_PROFILE_PICTURE_COLLECTION'] ?? '';

  static double get refreshTriggerPullDistance => 40;

  static double get refreshIndicatorExtent => 30;

  static double refreshIndicatorPadding(int index) {
    return index == 0 ? 16.0 : 0.0;
  }
}
