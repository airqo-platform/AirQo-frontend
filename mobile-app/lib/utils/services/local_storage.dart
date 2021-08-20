import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
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

  Future<Database> initDB() async {
    return await openDatabase(
      join(await getDatabasesPath(), constants.dbName),
      version: 1,
      onCreate: (db, version) {
        createDefaultTables(db);
      },
      // onUpgrade: (db, oldVersion, newVersion){
      //
      // },
    );
  }

  Future<void> createDefaultTables(Database db) async {
    await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.measurementsTable} (
          ${constants.device} PRIMARY KEY,
          ${constants.pm2_5} not null,
          ${constants.pm10} not null,
          ${constants.time} not null,
          ${constants.s2_pm2_5} not null,
          ${constants.s2_pm10} not null,
          ${constants.externalHumidity} not null,
          ${constants.externalTemp} not null,
          )
      ''');

    await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.locationsTable} (
          ${constants.channelID} INTEGER PRIMARY KEY,
          ${constants.description} not null,
          ${constants.siteName} not null,
          ${constants.locationName} not null,
          ${constants.name} not null,
          ${constants.latitude} not null,
          ${constants.longitude} not null,
          ${constants.isActive} not null default 0,
          ${constants.favourite} null default 0,
          ${constants.nickName} null
          )
      ''');

    await db.execute('''
        CREATE TABLE IF NOT EXISTS ${constants.searchTableHistory} (
          id INTEGER PRIMARY KEY,
          ${constants.description} not null,
          ${constants.place_id} not null
          )
      ''');
  }

  Future<void> insertSearchHistory(Suggestion suggestion) async {
    try {
      print('Inserting search term into local db');

      final db = await database;

      await createDefaultTables(db);

      var jsonData = suggestion.toJson();

      try {
        await db.insert(
          '${constants.searchTableHistory}',
          jsonData,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      } on Error catch (e) {
        print(e);
      }

      print('Search term insertion into local db complete');
    } catch (e) {
      print(e);
    }
  }

  Future<void> deleteSearchHistory(Suggestion suggestion) async {
    try {
      print('Inserting search term into local db');

      final db = await database;

      await createDefaultTables(db);

      try {
        await db.delete('${constants.searchTableHistory}',
            where: '${constants.place_id} = ?',
            whereArgs: [suggestion.placeId]);
      } on Error catch (e) {
        print(e);
      }

      print('Search term deletion from local db complete');
    } catch (e) {
      print(e);
    }
  }

  Future<List<Suggestion>> getSearchHistory() async {
    try {
      print('Getting search history from local db');

      final db = await database;

      await createDefaultTables(db);

      var res = await db.query(constants.searchTableHistory);

      print('Got ${res.length} places from local db');

      var history = res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Suggestion.fromJson(res[i]);
            })
          : <Suggestion>[];

      return history;
    } catch (e) {
      print(e);
      return <Suggestion>[];
    }
  }

  Future<void> insertDevices(List<Device> devices) async {
    try {
      print('Inserting location into local db');

      final db = await database;

      if (devices.isNotEmpty) {
        for (var device in devices) {
          var jsonData = Device.toDbMap(device);

          try {
            await db.insert(
              '${constants.locationsTable}',
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.abort,
            );
          } on DatabaseException {
            await updatePlace(jsonData);
          } on Error catch (e) {
            print(e);
          }
        }

        print('Location insertion into local db complete');
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> insertMeasurements(List<Measurement> measurements) async {
    try {
      print('Inserting measurements into local db');

      final db = await database;

      if (measurements.isNotEmpty) {
        for (var measurement in measurements) {
          var jsonData = Measurement.mapToDb(measurement);

          await db.insert(
            '${constants.measurementsTable}',
            jsonData,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> updatePlace(Map<String, dynamic> device) async {
    print('Updating place in local db');

    try {
      final db = await database;

      var res = await db.query('${constants.locationsTable}',
          where: '${constants.channelID} = ?',
          whereArgs: [device['${constants.channelID}']]);

      Device deviceDetails = Device.fromJson(Device.fromDbMap(res.first));

      var isFavourite = deviceDetails.favourite;

      device['${constants.favourite}'] = isFavourite ? 1 : 0;
      device['${constants.nickName}'] = deviceDetails.nickName;

      await db.insert(
        '${constants.locationsTable}',
        device,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } on Error catch (e) {
      print(e);
    }
  }

  Future<Device> updateFavouritePlace(Device device, bool isFavourite) async {
    print('Updating favourite places in local db');

    final db = await database;

    var res = await db.query('${constants.locationsTable}',
        where: '${constants.channelID} = ?', whereArgs: [device.channelID]);

    print(res);

    if (isFavourite) {
      device.setFavourite(true);

      if (res.isEmpty) {
        var locationMap = Device.toDbMap(device);
        locationMap['${constants.favourite}'] = 1;

        if (device.nickName == null || device.nickName == '') {
          locationMap['${constants.nickName}'] = device.siteName;
        }

        await db.insert('${constants.locationsTable}', locationMap);
      } else {
        var updateMap = <String, Object?>{'${constants.favourite}': 1};

        if (device.nickName == null || device.nickName == '') {
          updateMap['${constants.nickName}'] = device.siteName;
        }

        var num = await db.update(
          '${constants.locationsTable}',
          updateMap,
          where: '${constants.channelID} = ?',
          whereArgs: [device.channelID],
          conflictAlgorithm: ConflictAlgorithm.replace,
        );

        print('updated rows : $num');
      }
    } else {
      device.setFavourite(false);

      if (res.isNotEmpty) {
        var updateMap = <String, Object?>{'${constants.favourite}': 0};

        await db.update(
          '${constants.locationsTable}',
          updateMap,
          where: '${constants.channelID} = ?',
          whereArgs: [device.channelID],
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    }

    return device;
  }

  Future<Device> renameFavouritePlace(Device device, String name) async {
    print('Renaming favourite place in local db');

    try {
      final db = await database;

      var res = await db.query('${constants.locationsTable}',
          where: '${constants.channelID} = ?', whereArgs: [device.channelID]);

      if (res.isEmpty) {
        var locationMap = Device.toDbMap(device);
        locationMap['${constants.favourite}'] = 1;
        locationMap['${constants.nickName}'] = name;

        await db.insert('${constants.locationsTable}', locationMap);
      } else {
        var updateMap = <String, Object?>{'${constants.nickName}': name};

        var num = await db.update(
          '${constants.locationsTable}',
          updateMap,
          where: '${constants.channelID} = ?',
          whereArgs: [device.channelID],
          conflictAlgorithm: ConflictAlgorithm.replace,
        );

        print('updated rows : $num');
      }
      return getDevice(device.channelID);
    } on Error catch (e) {
      print(e);
      return device;
    }
  }

  Future<bool> checkFavouritePlace(int channelID) async {
    try {
      print('checking favourite place in local db');

      final db = await database;

      var res = await db.query('${constants.locationsTable}',
          where: '${constants.channelID} = ?', whereArgs: [channelID]);

      var res2 = await db.query('${constants.locationsTable}',
          where: '${constants.favourite} = ?', whereArgs: [1]);

      print(res2);

      if (res.isEmpty) {
        return false;
      }

      var device = Device.fromJson(Device.fromDbMap(res.first));

      print('$channelID is favourite ? ${device.favourite}');

      return device.favourite;
    } catch (e) {
      print(e);
      return false;
    }
  }

  Future<void> updateMeasurement(Measurement measurement) async {
    try {
      print('Updating measurement in local db');

      final db = await database;

      var res = await db.query('${constants.measurementsTable}',
          where: '${constants.channelID} = ?',
          whereArgs: [measurement.deviceNumber]);

      var jsonData = Measurement.mapToDb(measurement);

      if (res.isEmpty) {
        await db.insert(
          '${constants.measurementsTable}',
          jsonData,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      } else {
        await db.update('${constants.measurementsTable}', jsonData,
            where: '${constants.channelID} = ?',
            whereArgs: [measurement.deviceNumber]);
      }
    } catch (e) {
      print(e);
    }
  }

  Future<Measurement?> getMeasurement(int channelId) async {
    try {
      print('Getting measurements locally');

      final db = await database;

      var res = await db.rawQuery('SELECT * FROM '
          '${constants.locationsTable} INNER JOIN '
          '${constants.measurementsTable} '
          'ON ${constants.locationsTable}.${constants.channelID} = '
          '${constants.measurementsTable}.${constants.locationDetails} '
          'WHERE ${constants.locationsTable}.${constants.channelID} = '
          '$channelId');

      if (res.isEmpty) {
        return null;
      }

      print('Got measurements locally');

      // var location = Device.fromDbMap(res.first);
      //
      // var measurementsJson = Measurement.fromDbMap(res.first);
      //
      // measurementsJson['${constants.locationDetails}'] = location;

      return unPackInnerJoin(res.first);
    } catch (e) {
      print(e);
      return null;
    }
  }

  Future<List<Measurement>> getMeasurements() async {
    try {
      print('Getting measurements from local db');

      final db = await database;
      var res = await db.rawQuery('SELECT * FROM '
          '${constants.locationsTable} INNER JOIN '
          '${constants.measurementsTable} '
          'ON ${constants.locationsTable}.${constants.channelID} = '
          '${constants.measurementsTable}.${constants.locationDetails} ');

      print('Got ${res.length} measurements from local db');

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return unPackInnerJoin(res[i]);
            })
          : <Measurement>[];
    } catch (e) {
      print(e);
      return <Measurement>[];
    }
  }

  Future<List<Device>> getDevices() async {
    try {
      print('Getting devices from local db');

      final db = await database;
      var res = await db.query(constants.locationsTable);

      print('Got ${res.length} places from local db');

      var devices = res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Device.fromJson(Device.fromDbMap(res[i]));
            })
          : <Device>[];

      return devices;
    } catch (e) {
      print(e);
      return <Device>[];
    }
  }

  Future<Device> getDevice(int channelID) async {
    try {
      print('Getting device from local db');

      final db = await database;
      var res = await db.query(constants.locationsTable,
          where: '${constants.channelID} = ?', whereArgs: [channelID]);

      var device = Device.fromJson(Device.fromDbMap(res.first));

      return device;
    } catch (e) {
      print(e);
      throw Exception('Device doesn\'t exist');
    }
  }

  Future<List<Measurement>> getFavouritePlaces() async {
    try {
      print('Getting favourite places from local db');

      final db = await database;

      var res = await db.rawQuery('SELECT * FROM '
          '${constants.locationsTable} JOIN '
          '${constants.measurementsTable} '
          'ON ${constants.locationsTable}.${constants.channelID} = '
          '${constants.measurementsTable}.${constants.locationDetails} '
          'WHERE ${constants.locationsTable}.${constants.favourite} = 1');

      print('Got ${res.length} favourite places from local db');

      var res2 = await db.rawQuery('SELECT * FROM '
          '${constants.locationsTable} '
          'WHERE ${constants.locationsTable}.${constants.favourite} = 1');

      print('Got ${res2.length} favourite places 2 from local db');

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return unPackInnerJoin(res[i]);
            })
          : <Measurement>[];
    } catch (e) {
      print(e);

      return <Measurement>[];
    }
  }

  Measurement unPackInnerJoin(Map<String, Object?> data) {
    var location = Device.fromDbMap(data);

    var measurementsJson = Measurement.mapFromDb(data);

    measurementsJson['deviceDetails'] = location;

    print(measurementsJson);

    return Measurement.fromJson(measurementsJson);
  }
}
