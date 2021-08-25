import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/suggestion.dart';
import 'package:path/path.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

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
    print('creating tables');

    // latest measurements table
    await db.execute(Measurement.latestMeasurementsTableDropStmt());
    await db.execute(Measurement.latestMeasurementsTableCreateStmt());

    // search history table
    await db.execute(Suggestion.searchHistoryTableDropStmt());
    await db.execute(Suggestion.searchHistoryTableCreateStmt());

    // historical measurements table
    await db
        .execute(HistoricalMeasurement.historicalMeasurementsTableDropStmt());
    await db
        .execute(HistoricalMeasurement.historicalMeasurementsTableCreateStmt());

    // forecast table
    await db.execute(Predict.forecastTableDropStmt());
    await db.execute(Predict.forecastTableCreateStmt());

    // devices table
    await db.execute(Device.devicesTableDropStmt());
    await db.execute(Device.createTableStmt());
  }

  Future<void> insertSearchHistory(Suggestion suggestion) async {
    try {
      print('Inserting search term into local db');

      final db = await database;

      var jsonData = suggestion.toJson();

      try {
        await db.insert(
          '${Suggestion.dbName()}',
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
      final db = await database;

      try {
        await db.delete('${Suggestion.dbName()}',
            where: '${Suggestion.dbPlaceId()} = ?',
            whereArgs: [suggestion.placeId]);
      } on Error catch (e) {
        print(e);
      }
    } catch (e) {
      print(e);
    }
  }

  Future<List<Suggestion>> getSearchHistory() async {
    try {
      final db = await database;

      var res = await db.query(Suggestion.dbName());

      print('Got ${res.length} search history from local db');

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

  Future<void> insertLatestMeasurements(List<Measurement> measurements) async {
    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        for (var measurement in measurements) {
          try {
            var jsonData = Measurement.mapToDb(measurement);
            await db.insert(
              '${Measurement.latestMeasurementsDb()}',
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            print('Inserting latest measurements into db');
            print(e);
          }
        }
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> insertDevices(List<Device> devices) async {
    try {
      final db = await database;

      if (devices.isNotEmpty) {
        for (var device in devices) {
          try {
            var jsonData = Device.toDbMap(device);
            await db.insert(
              '${Device.dbName()}',
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            print('Inserting devices into db');
            print(e);
          }
        }
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> insertHistoricalMeasurements(
      List<HistoricalMeasurement> measurements) async {
    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        await db.delete(HistoricalMeasurement.historicalMeasurementsDb());

        for (var measurement in measurements) {
          try {
            var jsonData = HistoricalMeasurement.mapToDb(measurement);
            await db.insert(
              '${HistoricalMeasurement.historicalMeasurementsDb()}',
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            print('Inserting historical measurements into db');
            print(e);
          }
        }
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> insertDeviceHistoricalMeasurements(
      List<HistoricalMeasurement> measurements, String device) async {

    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        await db.delete(
            HistoricalMeasurement.historicalMeasurementsDb(),
            where: '${HistoricalMeasurement.dbDevice()} = ?',
            whereArgs: [device]);

        for (var measurement in measurements) {
          try {
            var jsonData = HistoricalMeasurement.mapToDb(measurement);
            await db.insert(
              '${HistoricalMeasurement.historicalMeasurementsDb()}',
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            print('Inserting device historical measurements into db');
            print(e);
          }
        }
      }
    } catch (e) {
      print(e);
    }
  }

  Future<bool> updateFavouritePlaces(Device device) async {
    var prefs = await SharedPreferences.getInstance();
    var favouritePlaces =
        prefs.getStringList(PrefConstants().favouritePlaces) ?? [];

    var name = device.name.trim().toLowerCase();
    if (favouritePlaces.contains(name)) {
      var updatedList = <String>[];

      for (var fav in favouritePlaces) {
        if (name != fav.trim().toLowerCase()) {
          updatedList.add(fav.trim().toLowerCase());
        }
      }
      favouritePlaces = updatedList;
    } else {
      favouritePlaces.add(name);
    }

    await prefs.setStringList(PrefConstants().favouritePlaces, favouritePlaces);
    return favouritePlaces.contains(name);
  }

  Future<Measurement?> getMeasurement(String name) async {
    try {
      print('Getting measurements locally');

      final db = await database;

      var res = await db.query(Measurement.latestMeasurementsDb(),
          where: '${Measurement.dbDeviceName()} = ?', whereArgs: [name]);

      if (res.isEmpty) {
        return null;
      }

      print('Got measurement locally');
      return Measurement.fromJson(Measurement.mapFromDb(res.first));
    } catch (e) {
      print(e);
      return null;
    }
  }

  Future<List<Measurement>> getLatestMeasurements() async {
    try {
      print('Getting measurements from local db');

      final db = await database;

      var res = await db.query(Measurement.latestMeasurementsDb());

      print('Got ${res.length} measurements from local db');

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Measurement.fromJson(Measurement.mapFromDb(res[i]));
            })
          : <Measurement>[];
    } catch (e) {
      print(e);
      return <Measurement>[];
    }
  }

  Future<List<HistoricalMeasurement>> getHistoricalMeasurements(
      String device) async {
    try {
      final db = await database;

      var res = await db.query(HistoricalMeasurement.historicalMeasurementsDb(),
          where: '${HistoricalMeasurement.dbDevice()} = ?',
          whereArgs: [device]);

      print('Got ${res.length} historical measurements from db');

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return HistoricalMeasurement.fromJson(
                  HistoricalMeasurement.mapFromDb(res[i]));
            })
          : <HistoricalMeasurement>[];
    } catch (e) {
      print(e);
      return <HistoricalMeasurement>[];
    }
  }

  Future<void> insertForecastMeasurements(
      List<Predict> measurements, String device) async {
    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        await db.delete(Predict.forecastDb(),
            where: '${Predict.dbDevice()} = ?', whereArgs: [device]);

        for (var measurement in measurements) {
          try {
            var jsonData = Predict.mapToDb(measurement, device);
            await db.insert(
              '${Predict.forecastDb()}',
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            print('Inserting predicted measurements into db');
            print(e);
          }
        }
      }
    } catch (e) {
      print(e);
    }
  }

  Future<List<Predict>> getForecastMeasurements(String device) async {
    try {
      final db = await database;

      var res = await db.query(Predict.forecastDb(),
          where: '${Predict.dbDevice()} = ?', whereArgs: [device]);

      print('Got ${res.length} predict measurements from db');

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Predict.fromJson(Predict.mapFromDb(res[i]));
            })
          : <Predict>[];
    } catch (e) {
      print(e);
      return <Predict>[];
    }
  }

  Future<List<Device>> getDevices() async {
    try {

      final db = await database;
      var res = await db.query(Device.dbName());

      print('Got ${res.length} devices from local db');

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

  Future<List<Measurement>> getFavouritePlaces() async {
    try {
      final db = await database;

      var prefs = await SharedPreferences.getInstance();
      var favouritePlaces =
          prefs.getStringList(PrefConstants().favouritePlaces) ?? [];

      if (favouritePlaces.isEmpty) {
        return [];
      }

      var placesRes = <Map<String, Object?>>[];
      for (var fav in favouritePlaces) {
        var res = await db.query('${Measurement.latestMeasurementsDb()}',
            where: '${'${Measurement.dbDeviceName()} = ?'}', whereArgs: [fav]);
        placesRes.addAll(res);
      }
      if (placesRes.isEmpty) {
        return [];
      }

      return placesRes.isNotEmpty
          ? List.generate(placesRes.length, (i) {
              return Measurement.fromJson(Measurement.mapFromDb(placesRes[i]));
            })
          : <Measurement>[];
    } catch (e) {
      print(e);

      return <Measurement>[];
    }
  }
}
