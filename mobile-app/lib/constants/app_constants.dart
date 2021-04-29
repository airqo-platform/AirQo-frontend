import 'package:flutter/material.dart';

enum AppMenu {
  settings,
  help,
}

const appName = 'AirQo';

Color appColor = const Color(0xff5f1ee8);

class DbConstants{

  final String _dbName = 'airqo_db.db';
  final String _measurementsTable = 'measurements';
  final String _myPlacesTable = 'myPlaces';
  final String _channelID = 'channelID';
  final String _time = 'time';
  final String _pm2_5 = 'pm2_5';
  final String _pm10 = 'pm10';
  final String _s2_pm2_5 = 's2_pm2_5';
  final String _latitude = 'latitude';
  final String _longitude = 'longitude';
  final String _s2_pm10 = 's2_pm10';


  String get myPlacesTable => _myPlacesTable;

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
}