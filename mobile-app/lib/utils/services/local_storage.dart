import 'dart:async';

import 'package:app/config/languages/CustomLocalizations.dart';
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

    await db.execute(Measurement.latestMeasurementsTableDropStmt());
    // await db.execute(Device.devicesTableDropStmt());

    // devices table
    await db.execute(Device.createTableStmt());

    // latest measurements table
    await db.execute(Measurement.latestMeasurementsTableStmt());

    // historical measurements table
    // await db.execute(Measurement.historicalMeasurementsTableStmt());

    // forecast data table
    // await db.execute(Measurement.forecastDataTableStmt());

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
      final db = await database;
      await createDefaultTables(db);


      if (devices.isNotEmpty) {
        for (var device in devices) {
          var jsonData = Device.toDbMap(device);

          try {
            await db.insert(
              '${Device.dbName()}',
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.abort,
            );
          } on DatabaseException catch (e) {
            await updateDevice(jsonData);
          } on Error catch (e) {
            print('Error while Inserting devices into local db');
            print(e);
          }
        }

      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> insertLatestMeasurements(List<Measurement> measurements) async {

      // final db = await database;

      // if (measurements.isNotEmpty) {
      //   for (var measurement in measurements) {
      //     try {
      //       var jsonData = Measurement.mapToDb(measurement);
      //       await db.insert(
      //         '${Measurement.dbNameLatestMeasurements()}',
      //         jsonData,
      //         conflictAlgorithm: ConflictAlgorithm.replace,
      //       );
      //     } catch (e) {
      //       print('Inserting latest measurements into db');
      //       print(e);
      //     }
      //   }
      // }

  }

  Future<void> updateDevice(Map<String, dynamic> device) async {

    try {
      final db = await database;

      var res = await db.query('${Device.dbName()}',
          where: '${Device.dbDeviceName()} = ?',
          whereArgs: [device['${Device.dbDeviceName()}']]);

      var deviceDetails = Device.fromDbMap(res.first);

      var isFavourite = deviceDetails['${Device.dbFavourite()}'];

      device['${Device.dbFavourite()}'] = isFavourite ? 'true' : 'false';
      device['${Device.dbNickName()}'] =
      deviceDetails['${Device.dbNickName()}'];

      await db.insert(
        '${Device.dbName()}',
        device,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } on Error catch (e) {
      print('Updating device in local db');
      print(e);
      print(device);
    }
  }

  Future<Device> updateFavouritePlace(Device device, bool isFavourite) async {
    print('Updating favourite places in local db');

    final db = await database;

    var res = await db.query('${Device.dbName()}',
        where: '${Device.dbDeviceName()} = ?', whereArgs: [device.name]);

    device.setFavourite(isFavourite);
    if (isFavourite) {
      // device.setFavourite(true);
      var deviceMap = Device.toDbMap(device);

      if (res.isEmpty) {

        // deviceMap['${Device.dbFavourite()}'] = 'true';
        //
        // if (device.nickName == '') {
        //   deviceMap['${Device.dbNickName()}'] = device.siteName;
        // }

        await db.insert('${Device.dbName()}', deviceMap);
      } else {
        // var deviceMap = <String, Object?>{'${Device.dbFavourite()}': 'true'};
        //
        // if (device.nickName == '') {
        //   deviceMap['${Device.dbNickName()}'] = device.siteName;
        // }

        var num = await db.update(
          '${Device.dbName()}',
          deviceMap,
          where: '${Device.dbDeviceName()} = ?',
          whereArgs: [device.name],
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    }
    else {
      // device.setFavourite(false);

      if (res.isNotEmpty) {
        var updateMap = <String, Object?>{'${Device.dbFavourite()}': 'false'};

        await db.update(
          '${Device.dbName()}',
          updateMap,
          where: '${Device.dbDeviceName()} = ?',
          whereArgs: [device.name],
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
          where: '${constants.name} = ?', whereArgs: [device.name]);

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
          where: '${constants.name} = ?',
          whereArgs: [device.name],
          conflictAlgorithm: ConflictAlgorithm.replace,
        );

        print('updated rows : $num');
      }
      return getDevice(device.name);
    } on Error catch (e) {
      print(e);
      return device;
    }
  }

  Future<bool> checkFavouritePlace(int name) async {
    try {
      print('checking favourite place in local db');

      final db = await database;

      var res = await db.query('${constants.locationsTable}',
          where: '${constants.name} = ?', whereArgs: [name]);

      var res2 = await db.query('${constants.locationsTable}',
          where: '${constants.favourite} = ?', whereArgs: [1]);

      print(res2);

      if (res.isEmpty) {
        return false;
      }

      var device = Device.fromJson(Device.fromDbMap(res.first));

      print('$name is favourite ? ${device.favourite}');

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
          where: '${constants.name} = ?',
          whereArgs: [measurement.device]);

      var jsonData = Measurement.mapToDb(measurement);

      if (res.isEmpty) {
        await db.insert(
          '${constants.measurementsTable}',
          jsonData,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      } else {
        await db.update('${constants.measurementsTable}', jsonData,
            where: '${constants.device} = ?',
            whereArgs: [measurement.device]);
      }
    } catch (e) {
      print(e);
    }
  }

  Future<Measurement?> getMeasurement(String name) async {
    try {
      print('Getting measurements locally');

      final db = await database;

      var res = await db.rawQuery('SELECT * FROM '
          '${constants.locationsTable} INNER JOIN '
          '${constants.measurementsTable} '
          'ON ${constants.locationsTable}.${constants.name} = '
          '${constants.measurementsTable}.${constants.locationDetails} '
          'WHERE ${constants.locationsTable}.${constants.name} = '
          '$name');

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
          '${Device.dbName()} INNER JOIN '
          '${Measurement.dbNameLatestMeasurements()} '
          'ON ${Device.dbName()}.${Device.dbDeviceName()} = '
          '${Measurement.dbNameLatestMeasurements()}'
          '.${Measurement.dbDevice()} ');

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
      var res = await db.query(Device.dbName());

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

  Future<Device> getDevice(String name) async {
    try {
      print('Getting device from local db');

      final db = await database;
      var res = await db.query(constants.locationsTable,
          where: '${constants.name} = ?', whereArgs: [name]);

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
          'ON ${constants.locationsTable}.${constants.name} = '
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
    var device;
    try {
      device = Device.fromDbMap(data);
      print(device);
    } catch (e) {
      print('error on device');
      print(e);
    }

    var measurementsJson;

    try {
      measurementsJson = Measurement.mapFromDb(data);
      print(measurementsJson);
    } catch (e) {
      print('error on measurements');
      print(e);
    }

    measurementsJson['deviceDetails'] = device;

    print(measurementsJson);

    var measurements;
    try {
      measurements = Measurement.fromJson(measurementsJson);
    } catch (e) {
      print('error on measurements 2');
      print(e);
    }

    return measurements;
  }
}
