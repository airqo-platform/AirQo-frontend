import 'package:flutter/material.dart';

const appName = 'AirQo';
const appWebsite = 'https://www.airqo.net';
const appFeedbackEmail = 'info@airqo.net';
const appIOSLink =
    'https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091';
const appPlayStoreLink =
    'https://play.google.com/store/apps/details?id=com.airqo.app';
const firstUse = 'firstUse';

const appTheme = 'appTheme';

const faqs = 'https://www.airqo.net/faqs';
const about = 'https://www.airqo.net/about';
const terms =
    'https://docs.airqo.net/airqo-platform-api/mobile-app-privacy-policy';
const contactUs = 'https://www.airqo.net/contact-us';
const rate = 'https://www.airqo.net/faqs';
const facebook = 'https://web.facebook.com/AirQo/';
const twitter = 'https://twitter.com/AirQoProject';
const youtube = 'https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ/';
const linkedin = 'https://www.linkedin.com/company/airqo/';

const persistentNotificationId = 1294732;
const progressNotificationId = 482842;
const smartNotificationId = 4877231;
const pushNotificationId = 9239203;

const appColor = Color(0xff3067e2);

const facebookColor = Color(0xff4267B2);
const twitterColor = Color(0xff1DA1F2);
const youtubeColor = Color(0xffFF0000);
const linkedInColor = Color(0xff2867B2);

enum Languages { English, Luganda }
enum Themes { lightTheme, darkTheme }

class PollutantConstants {
  static final String _pm2_5 = 'pm2_5';
  static final String _pm10 = 'pm10';
  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm2_5 => _pm2_5;

  static String get pm10 => _pm10;

  static String get s2_pm2_5 => _s2_pm2_5;

  static String get s2_pm10 => _s2_pm10;
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

  static String get pm2_5 => _pm2_5;

  static String get pm10 => _pm10;

  static String get s2_pm2_5 => _s2_pm2_5;

  static String get s2_pm10 => _s2_pm10;
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
      '\nSome are emitted directly from a source, such as construction '
      'sites, unpaved roads, fields, smokestacks or fires. '
      '\nMost particles form in the atmosphere as a result of complex '
      'reactions of chemicals such as sulfur dioxide and nitrogen oxides, '
      'which are pollutants emitted from power plants, '
      'industries and automobiles.';
  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm2_5 => _pm2_5;

  static String get pm10 => _pm10;

  static String get s2_pm2_5 => _s2_pm2_5;

  static String get s2_pm10 => _s2_pm10;
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
      '\nFine particles are also the main cause of reduced visibility (haze)'
      ' in parts of the United States, including many of our treasured national'
      ' parks and wilderness areas.';
  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm2_5 => _pm2_5;

  static String get pm10 => _pm10;

  static String get s2_pm2_5 => _s2_pm2_5;

  static String get s2_pm10 => _s2_pm10;
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
      '\nFine particles are also the main cause of reduced visibility (haze)'
      ' in parts of the United States, including many of our treasured national'
      ' parks and wilderness areas.';

  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm2_5 => _pm2_5;

  static String get pm10 => _pm10;

  static String get s2_pm2_5 => _s2_pm2_5;

  static String get s2_pm10 => _s2_pm10;
}

class PrefConstants {
  final String _favouritePlaces = 'favourite_places';
  final String _firstUse = 'first_use';

  String get favouritePlaces => _favouritePlaces;

  String get firstUse => _firstUse;
}

class ColorConstants {
  final Color _green = const Color(0xff3FFF33);
  final Color _yellow = const Color(0xffFFF933);
  final Color _orange = const Color(0xffFF9633);
  final Color _red = const Color(0xffF62E2E);
  final Color _purple = const Color(0xFF7B1FA2);
  final Color _maroon = const Color(0xff570B0B);

  final Color _appColor = const Color(0xff3067e2);

  Color get green => _green;

  Color get maroon => _maroon;

  Color get purple => _purple;

  Color get red => _red;

  Color get orange => _orange;

  Color get yellow => _yellow;

  Color get appColor => _appColor;
}

class DbConstants {
  final String _dbName = 'airqo_db.db';

  String get dbName => _dbName;
}

class ErrorMessages {
  final String _socketException = 'Connection timeout';
  final String _timeoutException = 'Connection timeout';
  final String _appException = 'App exception';

  String get socketException => _socketException;

  String get timeoutException => _timeoutException;

  String get appException => _appException;
}
