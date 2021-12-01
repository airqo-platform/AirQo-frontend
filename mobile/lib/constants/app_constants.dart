import 'dart:io';

import 'package:app/config/env.dart';
import 'package:flutter/material.dart';

class AppConfig {
  static const String _androidApiKey = googleKey;

  static const String sentryUrl = sentryDevDsn;

  static const String sentryProdUrl = sentryProdDsn;

  static const String imageUploadApiKey = imageApiKey;

  static const String imageUploadPreset = uploadPreset;

  static const String _iOSApiKey = iosKey;

  static final String googleApiKey =
      Platform.isAndroid ? _androidApiKey : _iOSApiKey;

  static const String airQoApiKey = airqoApiKey;

  static String get dbName => databaseName;

  static double get defaultLatitude => defaultLatitudeValue;

  static double get defaultLongitude => defaultLongitudeValue;

  static String get iosStoreId => iosAppStoreId;

  static int get maxSearchRadius => searchRadius * 2;

  static String get name => applicationName;

  static int get searchRadius => defaultSearchRadius;

  static String get version => applicationVersion;
}

class CloudStorage {
  static String get alertsCollection => alertsDb;

  static String get favPlacesCollection => favPlacesDb;

  static String get kyaCollection => kyaDb;

  static String get notificationCollection => notificationDb;

  static String get usersCollection => usersDb;

  static String get usersKyaCollection => usersKyaDb;
}

class ColorConstants {
  static Color get appBarBgColor => const Color(0xffF2F1F6);

  static Color get appBarTitleColor => appColor;

  static Color get appBgColor => const Color(0xffEBEBEB);

  static Color get appBodyColor => const Color(0xffF2F1F6);

  static Color get appColor => Colors.black;

  static Color get appColorBlack => const Color(0xff121723);

  static Color get appColorBlue => const Color(0xff145DFF);

  static Color get appColorDisabled => appColorBlue.withOpacity(0.5);

  static Color get appColorPaleBlue => const Color(0xffCEDDFF);

  static Color get appLoadingColor => const Color(0xffEBEAEF);

  static Color get appPicColor => const Color(0xffFF79C1);

  static Color get appTipColor => const Color(0xffD5FFD4);

  static Color get darkGreyColor => const Color(0xffADAFB6);

  static Color get green => const Color(0xff3AFF38);

  static Color get greyColor => const Color(0xffD1D3D9);

  static Color get greyTextColor => const Color(0xffADAFB6);

  static Color get inactiveColor => appColorBlack.withOpacity(0.4);

  // pm colors

  static Color get maroon => const Color(0xffA51F3F);

  static Color get orange => const Color(0xffFE9E35);

  static Color get purple => const Color(0xFFDD38FF);

  static Color get red => const Color(0xffFF4034);

  static Color get snackBarBgColor => appColorBlack.withOpacity(0.8);

  static Color get yellow => const Color(0xffFFFF35);
}

class ErrorMessages {
  static String get appException => 'Failed to your request. Try again later';

  static String get socketException => 'No internet connection available';

  static String get timeoutException => 'No internet connection available';
}

enum Languages { english, luganda }

class Links {
  static String get aboutUsUrl => about;

  static String get airqoFeedbackEmail => feedbackEmail;

  static String get appAndroidWhatsappUrl => androidWhatsAppLink;

  static String get appiOSWhatsappUrl => iosWhatsAppLink;

  static String get appStoreUrl => iOSLink;

  static String get blogUrl => airqoBlog;

  static String get contactUsUrl => contactUs;

  static String get facebookUrl => facebook;

  static String get faqsUrl => faqs;

  static String get linkedinUrl => linkedin;

  static String get playStoreUrl => playStoreLink;

  static String get referenceUrl => airqoReference;

  static String get termsUrl => terms;

  static String get twitterUrl => twitter;

  static String get websiteUrl => airqoWebsite;

  static String get youtubeUrl => youtube;
}

class NotificationConfig {
  static const int persistentNotificationId = 1294732;
  static const int progressNotificationId = 482842;
  static const int pushNotificationId = 9239203;
  static const int smartNotificationId = 4877231;
}

class PrefConstant {
  static String get appTheme => 'appTheme';

  static String get dashboardSite => 'dashboardSite';

  static String get favouritePlaces => 'favouriteSites';

  static String get firstUse => 'isFirstUse';

  static String get hasCompleteOnBoarding => 'hasCompleteOnBoarding';

  static String get homePageTips => 'homePageTips';

  static String get initialDbLoad => 'initialDbLoad';

  static String get insightsCardTips => 'insightsCardTips';

  static String get isSignedUp => 'isSignedUp';

  static String get lastKnownLocation => 'lastKnownLocation';

  static String get reLoadDb => 'recreateAllTables';

  static String get siteAlerts => 'siteAlerts';
}

enum Status { none, running, stopped, paused }

enum Themes { lightTheme, darkTheme }
