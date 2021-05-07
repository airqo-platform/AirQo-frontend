import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:intl/intl.dart';
import 'package:sqflite/sqflite.dart';

import 'package:path/path.dart';


class DBHelper {

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
      // onUpgrade: (db, oldVersion, newVersion){
      //
      // },
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
          ${constants.s2_pm10} not null,
          ${constants.address} not null,
          ${constants.favourite} not null
          )
      ''');

    await db.execute('''
        create table ${constants.favouritesTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.pm2_5} not null,
          ${constants.longitude} not null,
          ${constants.latitude} not null,
          ${constants.pm10} not null,
          ${constants.time} not null,
          ${constants.s2_pm2_5} not null,
          ${constants.s2_pm10} not null,
          ${constants.address} not null,
          ${constants.favourite} not null
          )
      ''');

    await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.devicesTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.description} null,
          ${constants.siteName} null,
          ${constants.locationName} null,
          ${constants.name} null
          )
      ''');

  }


  Future<void> insertLatestMeasurements(List<Measurement> measurements) async {

    print('Inserting measurements into local db');

    final db = await database;

    try{

      // await db.execute('''
      //   DROP TABLE IF EXISTS ${constants.measurementsTable}
      // ''');

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
          ${constants.s2_pm10} not null,
          ${constants.address} not null,
          ${constants.favourite} not null
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

  Future<void> insertLatestDevices(List<Device> devices) async {

    print('Inserting devices into local db');

    final db = await database;

    try{

      await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.devicesTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.description} null,
          ${constants.siteName} null,
          ${constants.locationName} null,
          ${constants.name} null
          )
      ''');

      if(devices.isNotEmpty){

        await db.execute('''
        DELETE FROM ${constants.devicesTable} 
      ''');

        for (var device in devices){
          var jsonData = Device.toDbMap(device);

          await db.insert(
            '${constants.devicesTable}',
            jsonData,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );

        }

        print('Device insertion into local db complete');

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
      var measurements = await db.query('${constants.favouritesTable}',
          where: '${constants.channelID} = ?', whereArgs: [channelId]);

      return measurements.isNotEmpty ? List.generate(measurements.length, (i) {
        return Measurement.fromJson( Measurement.fromDbMap(measurements[i]));
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
      return Measurement.fromJson( Measurement.fromDbMap(res[i]));
    }) : <Measurement>[];
    
  }

  Future<Measurement?> getRecentDeviceMeasurement(String channelId) async {

    final db = await database;
    var res = await db.query('${constants.measurementsTable}',
        orderBy: '${constants.time}',
        limit: 1,
        where: '${constants.channelID} = ?', whereArgs: [channelId]);

    return res.isNotEmpty ? Measurement.fromJson( Measurement.fromDbMap(res.first)) : null;
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

  // devices
  Future<List<Device>> getLatestDevices() async {


    print('Getting devices from local db');

    try{

      final db = await database;
      var res = await db.query(constants.devicesTable);

      var devices = res.isNotEmpty ? List.generate(res.length, (i) {

        return Device.fromJson( Device.fromDbMap(res[i]));
      }) : <Device>[];

      return devices;
    }

    catch(e) {
      print(e);
      return <Device>[];
    }

  }

  Future<Device> getDevice(int channelID) async {


    print('Getting devices from local db');

    try{

      final db = await database;
      var res = await db.query(
          constants.devicesTable,
        where: '${constants.channelID} = ?',
        whereArgs: [channelID],
        limit: 1
      );

      var device = Device.fromJson( Device.fromDbMap(res.first));

      return device;

    }

    catch(e) {
      print(e);
      throw Exception('Device doesnt exist');
    }

  }

  // favourite places
  Future<Measurement> updateFavouritePlace(Measurement measurement, bool isFavourite)
  async {

      print('Updating favourite places in local db');

      final db = await database;

      // await db.execute('''
      //   DROP TABLE IF EXISTS ${constants.favouritesTable}
      // ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.favouritesTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.pm2_5} not null,
          ${constants.longitude} not null,
          ${constants.latitude} not null,
          ${constants.pm10} not null,
          ${constants.time} not null,
          ${constants.s2_pm2_5} not null,
          ${constants.s2_pm10} not null,
          ${constants.address} not null,
          ${constants.favourite} not null
          )
      ''');

      var res = await db.query(
          '${constants.favouritesTable}',
          where: '${constants.channelID} = ?',
          whereArgs: [measurement.channelID],
          limit: 1);

      if(isFavourite){

        measurement.setFavourite(true);

        if(res.isEmpty){
          await db.insert('${constants.favouritesTable}',
              Measurement.toDbMap(measurement));
        }
        else{
          await db.update('${constants.favouritesTable}',
              Measurement.toDbMap(measurement),
              where: '${constants.channelID} = ?',
              whereArgs: [measurement.channelID],
              conflictAlgorithm: ConflictAlgorithm.replace,);
        }

      }
      else{

        measurement.setFavourite(false);

        if(res.isNotEmpty){
          await db.delete('${constants.favouritesTable}',
              where: '${constants.channelID} = ?',
              whereArgs: [measurement.channelID]);
        }

      }



    return measurement;
      // await db.rawDelete('DELETE FROM ${constants.favouritesTable}'
      //     'WHERE ${constants.channelID} = ?', [measurement.channelID]);
      //
      // try {
      //   var jsonData = Measurement.toDbMap(measurement);
      //
      //   await db.insert(
      //     '${constants.favouritesTable}',
      //     jsonData,
      //     conflictAlgorithm: ConflictAlgorithm.replace,
      //   );
      // }catch(e) {
      //   print(e);
      // }

  }

  Future<bool> checkFavouritePlace(int channelID)
  async {
    try {
      print('checking favourite place in local db');

      final db = await database;


      await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.favouritesTable} (
          id INTEGER PRIMARY KEY,
          ${constants.channelID} not null,
          ${constants.pm2_5} not null,
          ${constants.longitude} not null,
          ${constants.latitude} not null,
          ${constants.pm10} not null,
          ${constants.time} not null,
          ${constants.s2_pm2_5} not null,
          ${constants.s2_pm10} not null,
          ${constants.address} not null,
          ${constants.favourite} not null
          )
      ''');

      var res = await db.query(
          '${constants.favouritesTable}',
          where: '${constants.channelID} = ?',
          whereArgs: [channelID],
          limit: 1);

      if(res.isNotEmpty){
        return true;
      }

    }
    catch(e) {
      print(e);

    }

    return false;

  }

  Future<List<Measurement>> getFavouritePlaces() async {


    print('Getting favourite places from local db');

    try{

      final db = await database;
      var res = await db.query(constants.favouritesTable);

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
