import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
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

  static String get alertsCollection => dotenv.env['ALERTS_COLLECTION'] ?? '';

  static String get appAndroidWhatsappUrl =>
      dotenv.env['ANDROID_WHATSAPP_URL'] ?? '';

  static Color get appBodyColor => const Color(0xffF2F1F6);

  static Color get appColor => Colors.black;

  static Color get appColorBlack => const Color(0xff121723);

  static Color get appColorBlue => const Color(0xff145DFF);

  static Color get appColorDisabled => appColorBlue.withOpacity(0.5);

  static String get appErrorMessage =>
      'Failed to process your request. Try again later';

  static String get appIOSWhatsappUrl => dotenv.env['IOS_WHATSAPP_URL'] ?? '';

  static Color get appLoadingColor => const Color(0xffEBEAEF);

  static Color get appPicColor => const Color(0xffFF79C1);

  static String get appStoreUrl => dotenv.env['APP_STORE_URL'] ?? '';

  static String get carrierSearchApi => dotenv.env['CARRIER_SEARCH_API'] ?? '';

  static String get connectionErrorMessage => 'No internet connection';

  static Color get darkGreyColor => const Color(0xffADAFB6);

  static String get dbName => dotenv.env['DATABASE_NAME'] ?? '';

  static double get defaultLatitude =>
      double.parse('${dotenv.env['DEFAULT_LATITUDE']}');

  static double get defaultLongitude =>
      double.parse('${dotenv.env['DEFAULT_LONGITUDE']}');

  static String get environmentFile => kReleaseMode ? '.env.prod' : '.env.dev';

  static String get faqsUrl => dotenv.env['FAQS_URL'] ?? '';

  static String get favPlacesCollection =>
      dotenv.env['FAV_PLACES_COLLECTION'] ?? '';

  static String get googleApiKey =>
      (Platform.isAndroid
          ? dotenv.env['GOOGLE_ANDROID_API_KEY']
          : dotenv.env['GOOGLE_IOS_API_KEY']) ??
      '';

  static Color get green => const Color(0xff3AFF38);

  static Color get greyColor => const Color(0xffD1D3D9);

  static String get imageUploadApiKey =>
      dotenv.env['IMAGE_UPLOAD_API_KEY'] ?? '';

  static String get imageUploadPreset =>
      dotenv.env['IMAGE_UPLOAD_PRESET'] ?? '';

  static String get imageUploadUrl => dotenv.env['IMAGE_UPLOAD_URL'] ?? '';

  static Color get inactiveColor => appColorBlack.withOpacity(0.4);

  static String get iosStoreId => dotenv.env['IOS_STORE_ID'] ?? '';

  static String get kyaCollection => dotenv.env['KYA_COLLECTION'] ?? '';

  static String get locationErrorMessage =>
      'PLease turn on and allow location permissions';

  static Color get maroon => const Color(0xffA51F3F);

  static int get maxSearchRadius => searchRadius * 2;

  static String get notificationCollection =>
      dotenv.env['NOTIFICATION_COLLECTION'] ?? '';

  static Color get orange => const Color(0xffFE9E35);

  static int get persistentNotificationId => 1294732;

  static String get placesSearchUrl => dotenv.env['PLACES_SEARCH_URL'] ?? '';

  static String get playStoreUrl => dotenv.env['PLAY_STORE_URL'] ?? '';

  static String get prefAppTheme => dotenv.env['PREF_APP_THEME'] ?? '';

  static String get prefDashboardRegion =>
      dotenv.env['PREF_DASHBOARD_REGION'] ?? '';

  static String get prefHomePageTips => dotenv.env['PREF_HOME_PAGE_TIPS'] ?? '';

  static String get prefInsightsCardTips =>
      dotenv.env['PREF_INSIGHTS_PAGE_TIPS'] ?? '';

  static String get prefOnBoardingPage =>
      dotenv.env['PREF_ON_BOARDING_PAGE'] ?? '';

  static String get prefReLoadDb => dotenv.env['PREF_RELOAD_DB'] ?? '';

  static int get progressNotificationId => 482842;

  static Color get purple => const Color(0xFFDD38FF);

  static int get pushNotificationId => 9239203;

  static Color get red => const Color(0xffFF4034);

  static int get searchRadius => int.parse('${dotenv.env['SEARCH_RADIUS']}');

  static String get sentryDsn => dotenv.env['SENTRY_DSN'] ?? '';

  static int get smartNotificationId => 4877231;

  static Color get snackBarBgColor => appColorBlack.withOpacity(0.8);

  static String get socketErrorMessage =>
      'Your internet connection in unstable.';

  static String get termsUrl => dotenv.env['TERMS_URL'] ?? '';

  static Color get toolTipGreyColor => Colors.white.withOpacity(0.32);

  static String get usersCollection => dotenv.env['USERS_COLLECTION'] ?? '';

  static String get usersKyaCollection =>
      dotenv.env['USER_KYA_COLLECTION'] ?? '';

  static String get usersProfilePictureStorage =>
      dotenv.env['USERS_PROFILE_PICTURE_COLLECTION'] ?? '';

  static Color get yellow => const Color(0xffFFFF35);

  static double get refreshTriggerPullDistance => 40;

  static double get refreshIndicatorExtent => 30;

  static double refreshIndicatorPadding(int index) {
    return index == 0 ? 16.0 : 0.0;
  }
}

class HiveBox {
  static String get appNotifications => 'appNotifications';
}
