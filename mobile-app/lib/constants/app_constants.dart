import 'package:flutter/material.dart';

const appColor = Color(0xff3067e2);
const appName = 'AirQo';
const defaultSearchRadius = 2;

const persistentNotificationId = 1294732;
const progressNotificationId = 482842;
const pushNotificationId = 9239203;
const smartNotificationId = 4877231;

class Links {
  final String _airqoReference = 'https://www.airqo.net/about';
  final String _about = 'https://www.airqo.net/about';
  final String _iOSLink =
      'https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091';
  final String _playStoreLink =
      'https://play.google.com/store/apps/details?id=com.airqo.app';
  final String _airqoWebsite = 'https://www.airqo.net';
  final String _contactUs = 'https://www.airqo.net/contact-us';
  final String _faqs = 'https://www.airqo.net/faqs';
  final String _linkedin = 'https://www.linkedin.com/company/airqo/';
  final String _facebook = 'https://web.facebook.com/AirQo/';
  final String _terms =
      'https://docs.airqo.net/airqo-application-documentations/';
  final String _youtube =
      'https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ/';
  final String _twitter = 'https://twitter.com/AirQoProject';
  final String _feedbackEmail = 'info@airqo.net';

  String get feedbackEmail => _feedbackEmail;

  String get twitter => _twitter;

  String get about => _about;

  String get airqoReference => _airqoReference;

  String get iOSLink => _iOSLink;

  String get playStoreLink => _playStoreLink;

  String get airqoWebsite => _airqoWebsite;

  String get contactUs => _contactUs;

  String get faqs => _faqs;

  String get linkedin => _linkedin;

  String get facebook => _facebook;

  String get terms => _terms;

  String get youtube => _youtube;
}

class ColorConstants {
  final Color _green = const Color(0xff3FFF33);
  final Color _yellow = const Color(0xffFFF933);
  final Color _orange = const Color(0xffFF9633);
  final Color _red = const Color(0xffF62E2E);
  final Color _purple = const Color(0xFF7B1FA2);
  final Color _maroon = const Color(0xff570B0B);

  final Color _facebookColor = const Color(0xff4267B2);
  final Color _linkedInColor = const Color(0xff2867B2);
  final Color _twitterColor = const Color(0xff1DA1F2);
  final Color _youtubeColor = const Color(0xffFF0000);

  final Color _appColor = const Color(0xff3067e2);

  Color get appColor => _appColor;

  Color get green => _green;

  Color get maroon => _maroon;

  Color get orange => _orange;

  Color get purple => _purple;

  Color get red => _red;

  Color get yellow => _yellow;

  Color get youtubeColor => _youtubeColor;

  Color get twitterColor => _twitterColor;

  Color get linkedInColor => _linkedInColor;

  Color get facebookColor => _facebookColor;
}

class DbConstants {
  final String _dbName = 'airqo_db.db';

  String get dbName => _dbName;
}

class ErrorMessages {
  final String _socketException = 'Connection timeout';
  final String _timeoutException = 'Connection timeout';
  final String _appException = 'App exception';

  String get appException => _appException;

  String get socketException => _socketException;

  String get timeoutException => _timeoutException;
}

enum Languages { English, Luganda }

class PollutantConstants {
  static final String _pm2_5 = 'pm2_5';
  static final String _pm10 = 'pm10';
  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm10 => _pm10;

  static String get pm2_5 => _pm2_5;

  static String get s2_pm10 => _s2_pm10;

  static String get s2_pm2_5 => _s2_pm2_5;
}

class PollutantDescription {
  static final String _pm2_5 = 'PM stands for particulate matter '
      '(also called particle pollution): the term for a mixture of solid'
      ' particles and liquid droplets found in the air. Some particles, '
      'such as dust, dirt, soot, or smoke, are large or dark enough to be '
      'seen with the naked eye. Others are so small they can only be detected '
      'using an electron microscope.';

  static final String _pm10 = 'PM stands for particulate matter '
      '(also called particle pollution): the term for a mixture of solid'
      ' particles and liquid droplets found in the air. Some particles, '
      'such as dust, dirt, soot, or smoke, are large or dark enough to be '
      'seen with the naked eye. Others are so small they can only be detected '
      'using an electron microscope.';

  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm10 => _pm10;

  static String get pm2_5 => _pm2_5;

  static String get s2_pm10 => _s2_pm10;

  static String get s2_pm2_5 => _s2_pm2_5;
}

class PollutantEffects {
  static final String _pm2_5 = 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 2.5 micrometers in diameter, also known '
      'as fine particles or PM2.5, pose the greatest risk to health.\n '
      '\n\nFine particles are also the main cause of reduced visibility (haze)'
      ' in parts of the United States, including many of our treasured national'
      ' parks and wilderness areas.';

  static final String _pm10 = 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 10 micrometers in diameter, also known '
      'as fine particles or PM10, pose the greatest risk to health. '
      '\n\nFine particles are also the main cause of reduced visibility (haze)'
      ' in parts of the United States, including many of our treasured national'
      ' parks and wilderness areas.';
  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm10 => _pm10;

  static String get pm2_5 => _pm2_5;

  static String get s2_pm10 => _s2_pm10;

  static String get s2_pm2_5 => _s2_pm2_5;
}

class PollutantReduction {
  static final String _pm2_5 = 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 2.5 micrometers in diameter, also known '
      'as fine particles or PM2.5, pose the greatest risk to health. '
      '\n\nFine particles are also the main cause of reduced visibility (haze)'
      ' in parts of the United States, including many of our treasured national'
      ' parks and wilderness areas.';

  static final String _pm10 = 'Particulate matter contains microscopic '
      'solids or liquid droplets that are so small that they '
      'can be inhaled and cause serious health problems. '
      'Some particles less than 10 micrometers in diameter can get deep '
      'into your lungs and some may even get into your bloodstream. '
      'Of these, particles less than 10 micrometers in diameter, also known '
      'as fine particles or PM10, pose the greatest risk to health. '
      '\n\nFine particles are also the main cause of reduced visibility (haze)'
      ' in parts of the United States, including many of our treasured national'
      ' parks and wilderness areas.';

  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm10 => _pm10;

  static String get pm2_5 => _pm2_5;

  static String get s2_pm10 => _s2_pm10;

  static String get s2_pm2_5 => _s2_pm2_5;
}

class PollutantSource {
  static final String _pm2_5 = 'These particles come in many sizes and shapes'
      ' and can be made up of hundreds of different chemicals. '
      '\n\nSome are emitted directly from a source, such as construction '
      'sites, unpaved roads, fields, smokestacks or fires. '
      '\n\nMost particles form in the atmosphere as a result of complex '
      'reactions of chemicals such as sulfur dioxide and nitrogen oxides, '
      'which are pollutants emitted from power plants, '
      'industries and automobiles.';

  static final String _pm10 = 'These particles come in many sizes and shapes'
      ' and can be made up of hundreds of different chemicals. '
      '\n\nSome are emitted directly from a source, such as construction '
      'sites, unpaved roads, fields, smokestacks or fires. '
      '\n\nMost particles form in the atmosphere as a result of complex '
      'reactions of chemicals such as sulfur dioxide and nitrogen oxides, '
      'which are pollutants emitted from power plants, '
      'industries and automobiles.';
  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm10 => _pm10;

  static String get pm2_5 => _pm2_5;

  static String get s2_pm10 => _s2_pm10;

  static String get s2_pm2_5 => _s2_pm2_5;
}

class PrefConstants {
  final String _favouritePlaces = 'favourite_places';
  final String _firstUse = 'firstUse';
  final String _initialDbLoad = 'initialDbLoad';
  final String _appTheme = 'appTheme';

  String get favouritePlaces => _favouritePlaces;

  String get firstUse => _firstUse;

  String get initialDbLoad => _initialDbLoad;

  String get appTheme => _appTheme;
}

enum Themes { lightTheme, darkTheme }
