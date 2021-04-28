import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:sqflite/sqflite.dart';

import 'package:path/path.dart';


class DBHelper {
  // DBHelper._();
  //
  // static final DBHelper db = DBHelper._();

  var _database;

  var constants = DbConstants();

  Future<Database> get database async {
    if (_database != null) return _database;
    _database = await initDB();
    return _database;
  }

  initDB() async {

    return await openDatabase(

      join(await getDatabasesPath(), constants.dbName),
      onCreate: (db, version) {
        createDefaultTables(db);
      },
      version: 1,
    );

  }

  createDefaultTables(Database db) async{

    await db.execute('''
        create table ${constants.measurementsTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.pm2_5} not null,
          ${constants.longitude} not null,
          ${constants.latitude} not null,
          ${constants.pm10} not null,
          ${constants.time} not null,
          ${constants.s2_pm2_5} not null,
          ${constants.s2_pm10} not null
          )
      ''');

    await db.execute('''
        create table ${constants.myPlacesTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.pm2_5} not null,
          ${constants.longitude} not null,
          ${constants.latitude} not null,
          ${constants.pm10} not null,
          ${constants.time} not null,
          ${constants.s2_pm2_5} not null,
          ${constants.s2_pm10} not null
          )
      ''');

  }


  Future<void> insertLatestMeasurements(List<Measurement> measurements) async {

    print('Inserting measurements into local db');

    final db = await database;

    try{

      await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.measurementsTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.pm2_5} not null,
          ${constants.longitude} not null,
          ${constants.latitude} not null,
          ${constants.pm10} not null,
          ${constants.time} not null,
          ${constants.s2_pm2_5} not null,
          ${constants.s2_pm10} not null
          )
      ''');

      if(measurements.isNotEmpty){

        await db.execute('''
        DELETE FROM ${constants.measurementsTable} 
      ''');

        measurements.forEach((measurement) async {

          var jsonData = Measurement.toDbMap(measurement);

          await db.insert(
            '${constants.measurementsTable}',
            jsonData,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );

        });
      }


    }
    catch(e) {
      print(e);
    }


  }


  Future<void> insertMeasurement(Measurement measurement) async {
    final db = await database;

    var jsonData = measurement.toJson();

    try {
      var datetime = DateFormat('yyyy-MM-dd HH:mm:ss').parse(measurement.time);
      jsonData[constants.time] = datetime;
    }
    catch(e) {
      print(e);
    }

    await db.insert(
      '${constants.measurementsTable}',
      jsonData,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> updateMeasurement(Measurement measurement) async {
    final db = await database;
    var res = await db.update("Measurement", measurement.toJson(),
        where: "id = ?", whereArgs: [measurement.channelID]);
    // return res;
  }

  Future<List<Measurement>> getDeviceMeasurements(int channelId) async {

    try{

      final db = await database;
      var measurements = await db.query('${constants.myPlacesTable}',
          where: '${constants.channelID} = ?', whereArgs: [channelId]);

      return measurements.isNotEmpty ? List.generate(measurements.length, (i) {
        return Measurement.fromJson(measurements[i]);
      }) : <Measurement>[];
      
    }

    catch(e) {
      print(e);
      return <Measurement>[];
    }
    

  }

  Future<List<Measurement>> getMeasurementsByDateTime(DateTime dateTime) async {
    final db = await database;
    var res = await db.query('${constants.measurementsTable}',
        where: '${constants.time} > ?', whereArgs: [dateTime]);

    return res.isNotEmpty ? List.generate(res.length, (i) {
      return Measurement.fromJson(res[i]);
    }) : <Measurement>[];
    
  }

  Future<Measurement?> getRecentDeviceMeasurement(String channelId) async {

    final db = await database;
    var res = await db.query('${constants.measurementsTable}',
        orderBy: '${constants.time}',
        limit: 1,
        where: '${constants.channelID} = ?', whereArgs: [channelId]);

    return res.isNotEmpty ? Measurement.fromJson(res.first) : null;
  }

  Future<List<Measurement>> getLatestMeasurements() async {


    print('Getting measurements from local db');

    try{

      final db = await database;
      var res = await db.query(constants.measurementsTable);

      return res.isNotEmpty ? List.generate(res.length, (i) {

        return Measurement.fromJson( Measurement.fromDbMap(res[i]));
      }) : <Measurement>[];
    }

    catch(e) {
      print(e);
      return <Measurement>[];
    }

  }

}
