import 'package:app/config/env.dart';
import 'package:flutter/material.dart';

class AppConfig {
  static String get dbName => databaseName;
  static String get name => applicationName;
  static int get searchRadius => defaultSearchRadius;
  static String get version => applicationVersion;
}

class ColorConstants {
  static Color get appColor => const Color(0xff3067e2);
  static Color get facebookColor => const Color(0xff4267B2);
  static Color get green => const Color(0xff3FFF33);
  static Color get linkedInColor => const Color(0xff2867B2);
  static Color get maroon => const Color(0xff570B0B);
  static Color get orange => const Color(0xffFF9633);
  static Color get purple => const Color(0xFF7B1FA2);
  static Color get red => const Color(0xffF62E2E);
  static Color get twitterColor => const Color(0xff1DA1F2);
  static Color get yellow => const Color(0xffFFF933);
  static Color get youtubeColor => const Color(0xffFF0000);
}

class ErrorMessages {
  static String get appException => 'App exception';
  static String get socketException => 'Connection timeout';
  static String get timeoutException => 'Connection timeout';
}

enum Languages { English, Luganda }

class Links {
  String get aboutUsUrl => about;

  String get airqoFeedbackEmail => feedbackEmail;

  String get blogUrl => airqoBlog;

  String get contactUsUrl => contactUs;

  String get facebookUrl => facebook;

  String get faqsUrl => faqs;

  String get iOSUrl => iOSLink;

  String get linkedinUrl => linkedin;

  String get playStoreUrl => playStoreLink;

  String get referenceUrl => airqoReference;

  String get termsUrl => terms;

  String get twitterUrl => twitter;

  String get websiteUrl => airqoWebsite;

  String get youtubeUrl => youtube;
}

class NotificationConfig {
  static const int persistentNotificationId = 1294732;
  static const int progressNotificationId = 482842;
  static const int pushNotificationId = 9239203;
  static const int smartNotificationId = 4877231;
}

class PollutantConstant {
  static String get pm10 => 'pm10';
  static String get pm2_5 => 'pm2_5';
}

class PollutantDescription {
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
  static String get favouritePlaces => 'favouriteSites';
  static String get firstUse => 'firstUse';
  static String get initialDbLoad => 'initialDbLoad';
}

enum Status { none, running, stopped, paused }

enum Themes { lightTheme, darkTheme }

extension ParsePollutantLevel on PollutantLevel {
  String getString() {
    return toString().split('.').last;
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
