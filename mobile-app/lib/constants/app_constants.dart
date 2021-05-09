import 'package:flutter/material.dart';

const appName = 'AirQo';


const appColor = Color(0xff5f1ee8);
const greenColor = Color(0xff3FFF33);
const yellowColor = Color(0xffFFF933);
const orangeColor = Color(0xffFF9633);
const redColor = Color(0xffF62E2E);
const purpleColor = Color(0xFF7B1FA2);
const maroonColor = Color(0xff570B0B);

class PollutantConstants{

  static final String _pm2_5 = 'pm2_5';
  static final String _pm10 = 'pm10';
  static final String _s2_pm2_5 = 's2_pm2_5';
  static final String _s2_pm10 = 's2_pm10';

  static String get pm2_5 => _pm2_5;

  static String get pm10 => _pm10;

  static String get s2_pm2_5 => _s2_pm2_5;

  static String get s2_pm10 => _s2_pm10;

}

class ColorConstants{
  final Color _green = const Color(0xff3FFF33);
  final Color _yellow = const Color(0xffFFF933);
  final Color _orange = const Color(0xffFF9633);
  final Color _red = const Color(0xffF62E2E);
  final Color _purple = const Color(0xFF7B1FA2);
  final Color _maroon = const Color(0xff570B0B);

  final Color _appColor = const Color(0xff5f1ee8);

  Color get green => _green;

  Color get maroon => _maroon;

  Color get purple => _purple;

  Color get red => _red;

  Color get orange => _orange;

  Color get yellow => _yellow;

  Color get appColor => _appColor;
}

class DbConstants{

  final String _dbName = 'airqo_db.db';
  final String _measurementsTable = 'measurements';
  final String _locationsTable = 'locations';

  final String _channelID = 'channelID';
  final String _description = 'description';
  final String _isActive = 'isActive';
  final String _locationName = 'locationName';
  final String _siteName = 'siteName';
  final String _name = 'name';
  final String _favourite = 'favourite';
  final String _locationDetails = 'locationDetails';


  final String _nickName = 'nickName';


  final String _time = 'time';
  final String _pm2_5 = 'pm2_5';
  final String _pm10 = 'pm10';
  final String _s2_pm2_5 = 's2_pm2_5';
  final String _latitude = 'latitude';
  final String _longitude = 'longitude';
  final String _s2_pm10 = 's2_pm10';
  final String _address = 'address';


  String get locationDetails => _locationDetails;

  String get nickName => _nickName;

  String get favourite => _favourite;

  String get locationsTable => _locationsTable;

  String get address => _address;

  String get latitude => _latitude;

  String get measurementsTable => _measurementsTable;

  String get dbName => _dbName;

  String get channelID => _channelID;

  String get time => _time;

  String get pm2_5 => _pm2_5;

  String get pm10 => _pm10;

  String get s2_pm2_5 => _s2_pm2_5;

  String get s2_pm10 => _s2_pm10;

  String get longitude => _longitude;

  String get description => _description;

  String get isActive => _isActive;

  String get locationName => _locationName;

  String get siteName => _siteName;

  String get name => _name;
}