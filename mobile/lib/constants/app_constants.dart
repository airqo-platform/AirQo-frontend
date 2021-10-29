import 'dart:io';

import 'package:app/config/env.dart';
import 'package:app/models/site.dart';
import 'package:flutter/material.dart';

class AppConfig {
  static final String _androidApiKey = googleKey;

  static final String imageUploadApiKey = imageApiKey;

  static final String imageUploadPreset = uploadPreset;

  static final String _iOSApiKey = iosKey;

  static final String googleApiKey =
      Platform.isAndroid ? _androidApiKey : _iOSApiKey;

  static final String airQoApiKey = airqoApiKey;

  static String get dbName => databaseName;

  static double get defaultLatitude => defaultLatitudeValue;

  static double get defaultLongitude => defaultLongitudeValue;

  static int get maxSearchRadius => searchRadius * 2;

  static String get name => applicationName;

  static int get searchRadius => defaultSearchRadius;

  static String get version => applicationVersion;
}

class CloudStorage {
  static String get alertsCollection => alertsDb;

  static String get usersCollection => usersDb;
}

class ColorConstants {
  static Color get appBarBgColor => const Color(0xffF2F1F6);

  static Color get appBarTitleColor => appColor;

  static Color get appBgColor => const Color(0xffEBEBEB);

  static Color get appBodyColor => const Color(0xffF2F1F6);

  static Color get appColor => Colors.black;

  // static Color get appColor => const Color(0xff3067e2);

  static Color get appColorBlack => const Color(0xff121723);

  static Color get appColorBlue => const Color(0xff145DFF);

  static Color get appColorDisabled => appColorBlue.withOpacity(0.5);

  static Color get appColorPaleBlue => const Color(0xffCEDDFF);

  static Color get appPicColor => const Color(0xffFF79C1);

  static Color get appTipColor => const Color(0xffD5FFD4);

  static Color get facebookColor => const Color(0xff4267B2);

  static Color get green => const Color(0xff3AFF38);

  static Color get greyColor => const Color(0xffD1D3D9);

  static Color get greyTextColor => const Color(0xffADAFB6);

  static Color get inactiveColor => appColor.withOpacity(0.5);

  // pm colors
  static Color get linkedInColor => const Color(0xff2867B2);

  static Color get maroon => const Color(0xffA51F3F);

  static Color get orange => const Color(0xffFE9E35);

  static Color get purple => const Color(0xFFDD38FF);

  static Color get red => const Color(0xffFF4034);

  static Color get snackBarBgColor => appColor.withOpacity(0.8);

  static Color get twitterColor => const Color(0xff1DA1F2);

  static Color get yellow => const Color(0xffFFFF35);

  static Color get youtubeColor => const Color(0xffFF0000);
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

  static String get appStoreUrl => iOSLink;

  static String get appWhatsappUrl => whatsAppLink;

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

class PollutantBio {
  static String get humidity => 'Relative humidity is the amount of water '
      'vapor actually in the air, expressed as a percentage of the maximum '
      'amount of water vapor the air can hold at the same temperature. '
      '\n\nThink of the air at a chilly -10 degrees Celsius '
      '(14 degrees Fahrenheit). At that temperature, the air can hold,'
      ' at most, 2.2 grams of water per cubic meter. So if there are 2.2'
      ' grams of water per cubic meter when its -10 degrees Celsius outside, '
      'we are at an uncomfortable 100 percent relative humidity. If there was'
      ' 1.1 grams of water in the air at -10 degrees Celsius, '
      'we are at 50 percent relative humidity.';

  static String get pm10 => 'PM10 are pollutants that have a diameter of '
      '10 micrometers (0.01 mm) or smaller; they can be found '
      'in dust and smoke and can penetrate and lodge deep inside the'
      ' lungs. They are even more health-damaging particles than'
      ' the PM2.5  pollutants. ';

  static String get pm2_5 => 'PM2.5 are pollutants that have a diameter '
      'of 2.5 micrometers (20-30 times smaller than the thickness of'
      ' human hair). They are very small particles usually '
      'found in smoke. PM2.5 '
      'particles are small enough for you to breathe and '
      'can penetrate the lung barrier and enter the blood system.'
      ' Prolonged exposure to particles contributes to the risk of '
      'developing cardiovascular and respiratory diseases, '
      'as well as lung cancer.\nSource WHO ';

  static String get temperature => 'Temperature is the degree of hotness or'
      ' coldness of an object. When we talk about something feeling hot '
      '(like the soup we drink when were sick) or cold (like the snow, '
      'especially if youre not wearing gloves), '
      'were talking about temperature.';
}

class PollutantConstant {
  static String get humidity => 'humidity';

  static String get pm10 => 'pm10';

  static String get pm2_5 => 'pm2_5';

  static String get temperature => 'temperature';
}

class PollutantDescription {
  static String get humidity => 'Relative humidity is the amount of water '
      'vapor actually in the air, expressed as a percentage of the maximum '
      'amount of water vapor the air can hold at the same temperature. '
      '\n\nThink of the air at a chilly -10 degrees Celsius '
      '(14 degrees Fahrenheit). At that temperature, the air can hold,'
      ' at most, 2.2 grams of water per cubic meter. So if there are 2.2'
      ' grams of water per cubic meter when its -10 degrees Celsius outside, '
      'we are at an uncomfortable 100 percent relative humidity. If there was'
      ' 1.1 grams of water in the air at -10 degrees Celsius, '
      'we are at 50 percent relative humidity.';

  static String get pm10 => 'PM stands for particulate matter '
      '(also called particle pollution): the term for a mixture of solid'
      ' particles and liquid droplets found in the air. Some particles, '
      'such as dust, dirt, soot, or smoke, are large or dark enough to be '
      'seen with the naked eye. Others are so small they can only be detected '
      'using an electron microscope.';

  static String get pm2_5 => 'PM stands for particulate matter '
      '(also called particle pollution): the term for a mixture of solid'
      ' particles and liquid droplets found in the air. Some particles, '
      'such as dust, dirt, soot, or smoke, are large or dark enough to be '
      'seen with the naked eye. Others are so small they can only be detected '
      'using an electron microscope.';

  static String get temperature => 'Temperature is the degree of hotness or'
      ' coldness of an object. When we talk about something feeling hot '
      '(like the soup we drink when were sick) or cold (like the snow, '
      'especially if youre not wearing gloves), '
      'were talking about temperature.';
}

class PollutantEffect {
  static String get pm10 => 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 10 micrometers in diameter, also known '
      'as fine particles or PM10, pose the greatest risk to health.';

  static String get pm2_5 => 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 2.5 micrometers in diameter, also known '
      'as fine particles or PM2.5, pose the greatest risk to health.';
}

enum PollutantLevel {
  good,
  moderate,
  sensitive,
  unhealthy,
  veryUnhealthy,
  hazardous
}

class PollutantReduction {
  static String get pm10 => 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 10 micrometers in diameter, also known '
      'as fine particles or PM10, pose the greatest risk to health.';

  static String get pm2_5 => 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 2.5 micrometers in diameter, also known '
      'as fine particles or PM2.5, pose the greatest risk to health.';
}

class PollutantSource {
  static String get pm10 => 'These particles come in many sizes and shapes'
      ' and can be made up of hundreds of different chemicals.'
      '\n\nSome are emitted directly from a source, such as construction '
      'sites, unpaved roads, fields, smokestacks or fires.'
      '\n\nMost particles form in the atmosphere as a result of complex '
      'reactions of chemicals such as sulfur dioxide and nitrogen oxides, '
      'which are pollutants emitted from power plants, '
      'industries and automobiles.';

  static String get pm2_5 => 'These particles come in many sizes and shapes'
      ' and can be made up of hundreds of different chemicals. '
      '\n\nSome are emitted directly from a source, such as construction '
      'sites, unpaved roads, fields, smokestacks or fires. '
      '\n\nMost particles form in the atmosphere as a result of complex '
      'reactions of chemicals such as sulfur dioxide and nitrogen oxides, '
      'which are pollutants emitted from power plants, '
      'industries and automobiles.';
}

class PrefConstant {
  static String get appTheme => 'appTheme';

  static String get dashboardSite => 'dashboardSite';

  static String get favouritePlaces => 'favouriteSites';

  static String get firstUse => 'isFirstUse';

  static String get initialDbLoad => 'initialDbLoad';

  static String get isSignedUp => 'isSignedUp';

  static String get lastKnownLocation => 'lastKnownLocation';

  static String get reLoadDb => 'reloadDb';

  static String get siteAlerts => 'siteAlerts';

  static String get tipsProgress => 'tipsProgress';
}

enum Status { none, running, stopped, paused }

enum Themes { lightTheme, darkTheme }

extension ParsePollutantLevel on PollutantLevel {
  String getString() {
    return toString().split('.').last;
  }

  String getTopic(Site site, PollutantLevel pollutantLevel) {
    if (pollutantLevel == PollutantLevel.good) {
      return '${site.id}-good';
    } else if (pollutantLevel == PollutantLevel.moderate) {
      return '${site.id}-moderate';
    } else if (pollutantLevel == PollutantLevel.sensitive) {
      return '${site.id}-sensitive';
    } else if (pollutantLevel == PollutantLevel.unhealthy) {
      return '${site.id}-unhealthy';
    } else if (pollutantLevel == PollutantLevel.veryUnhealthy) {
      return '${site.id}-very-unhealthy';
    } else if (pollutantLevel == PollutantLevel.hazardous) {
      return '${site.id}-hazardous';
    }
    return '';
  }

  List<PollutantLevel> getPollutantLevels() {
    var pollutants = <PollutantLevel>[
      PollutantLevel.good,
      PollutantLevel.moderate,
      PollutantLevel.sensitive,
      PollutantLevel.unhealthy,
      PollutantLevel.veryUnhealthy,
      PollutantLevel.hazardous
    ];

    return pollutants;
  }
}
