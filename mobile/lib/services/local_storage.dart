import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/models/insights.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/site.dart';
import 'package:app/models/user_details.dart';
import 'package:app/utils/distance.dart';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:path/path.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

class DBHelper {
  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await initDB();
    await createDefaultTables(_database!);
    return _database!;
  }

  Future<void> clearAccount() async {
    try {
      final db = await database;
      await db.delete(Kya.dbName());
      await db.delete(UserNotification.dbName());
      await db.delete(PlaceDetails.dbName());
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> clearFavouritePlaces() async {
    try {
      final db = await database;
      await db.delete(PlaceDetails.dbName());
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> createDefaultTables(Database db) async {
    var prefs = await SharedPreferences.getInstance();
    var createDatabases = prefs.getBool(Config.prefReLoadDb) ?? true;

    if (createDatabases) {
      await db.execute(Measurement.dropTableStmt());
      await db.execute(Site.dropTableStmt());
      await db.execute(PlaceDetails.dropTableStmt());
      await db.execute(UserNotification.dropTableStmt());
      await db.execute(Insights.dropTableStmt());
      await db.execute(Kya.dropTableStmt());
      await prefs.setBool(Config.prefReLoadDb, false);
    }

    await db.execute(Measurement.createTableStmt());
    await db.execute(Site.createTableStmt());
    await db.execute(PlaceDetails.createTableStmt());
    await db.execute(UserNotification.createTableStmt());
    await db.execute(Insights.createTableStmt());
    await db.execute(Kya.createTableStmt());
  }

  Future<void> deleteNonFavPlacesInsights() async {
    try {
      final db = await database;

      var resFavPlaces = await db.query(PlaceDetails.dbName());

      var favPlaces = resFavPlaces.isNotEmpty
          ? List.generate(resFavPlaces.length, (i) {
              return PlaceDetails.fromJson(resFavPlaces[i]).siteId;
            })
          : <String>[];

      var resInsights = await db.query(Insights.dbName());

      var insights = resInsights.isNotEmpty
          ? List.generate(resInsights.length, (i) {
              return Insights.fromJson(resInsights[i]).siteId;
            }).toSet()
          : <String>[];

      var nonFavPlaces =
          insights.where((element) => !favPlaces.contains(element));

      for (var nonFavPlace in nonFavPlaces) {
        await db.delete(Insights.dbName(),
            where: 'siteId = ?', whereArgs: [nonFavPlace]);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<List<PlaceDetails>> getFavouritePlaces() async {
    try {
      final db = await database;

      var res = await db.query(PlaceDetails.dbName());

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return PlaceDetails.fromJson(res[i]);
            })
          : <PlaceDetails>[];
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');

      return <PlaceDetails>[];
    }
  }

  Future<List<Insights>> getInsights(String siteId, String frequency) async {
    try {
      final db = await database;

      var res = await db.query(Insights.dbName(),
          where: 'siteId = ? and frequency = ?',
          whereArgs: [siteId, frequency]);

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Insights.fromJson(res[i]);
            })
          : <Insights>[];
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return <Insights>[];
    }
  }

  Future<List<Kya>> getKyas() async {
    try {
      final db = await database;

      var res = await db.query(Kya.dbName());

      if (res.isEmpty) {
        return [];
      }

      var collections = groupBy(res, (Map obj) => obj['id']);
      var kyaList = <Kya>[];
      for (var key in collections.keys) {
        if (collections.containsKey(key)) {
          var kya = Kya.fromDbJson(collections[key]);
          if (kya.id.isNotEmpty) {
            kyaList.add(kya);
          }
        }
      }
      return kyaList;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return <Kya>[];
    }
  }

  Future<List<Measurement>> getLatestMeasurements() async {
    try {
      final db = await database;

      var res = await db.query(Measurement.measurementsDb());

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Measurement.fromJson(Measurement.mapFromDb(res[i]));
            })
          : <Measurement>[]
        ..sort((siteA, siteB) => siteA.site.name
            .toLowerCase()
            .compareTo(siteB.site.name.toLowerCase()));
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return <Measurement>[];
    }
  }

  Future<Measurement?> getMeasurement(String siteId) async {
    try {
      final db = await database;

      var res = await db.query(Measurement.measurementsDb(),
          where: 'id = ?', whereArgs: [siteId]);

      if (res.isEmpty) {
        return null;
      }
      return Measurement.fromJson(Measurement.mapFromDb(res.first));
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return null;
    }
  }

  Future<List<Measurement>> getMeasurements(List<String> siteIds) async {
    try {
      final db = await database;

      var res = [];

      for (var siteId in siteIds) {
        var siteRes = await db.query(Measurement.measurementsDb(),
            where: 'id = ?', whereArgs: [siteId]);

        res.addAll(siteRes);
      }

      if (res.isEmpty) {
        return [];
      }
      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Measurement.fromJson(Measurement.mapFromDb(res[i]));
            })
          : <Measurement>[];
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return [];
    }
  }

  Future<Measurement?> getNearestMeasurement(
      double latitude, double longitude) async {
    try {
      Measurement? nearestMeasurement;
      var nearestMeasurements = <Measurement>[];

      double distanceInMeters;

      await getLatestMeasurements().then((measurements) => {
            for (var measurement in measurements)
              {
                distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
                    measurement.site.latitude,
                    measurement.site.longitude,
                    latitude,
                    longitude)),
                if (distanceInMeters < Config.maxSearchRadius.toDouble())
                  {
                    measurement.site.distance = distanceInMeters,
                    nearestMeasurements.add(measurement)
                  }
              },
            if (nearestMeasurements.isNotEmpty)
              {
                nearestMeasurement = nearestMeasurements.first,
                for (var m in nearestMeasurements)
                  {
                    if (nearestMeasurement!.site.distance > m.site.distance)
                      {nearestMeasurement = m}
                  },
              }
          });

      return nearestMeasurement;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return null;
    }
  }

  Future<List<Measurement>> getRegionSites(String region) async {
    try {
      final db = await database;

      var res = await db.query(Measurement.measurementsDb(),
          where: 'region = ?', whereArgs: [region.trim()]);

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Measurement.fromJson(Measurement.mapFromDb(res[i]));
            })
          : <Measurement>[];
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return <Measurement>[];
    }
  }

  Future<List<Site>> getSites() async {
    try {
      final db = await database;
      var res = await db.query(Site.sitesDbName());

      var sites = res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Site.fromJson(Site.fromDbMap(res[i]));
            })
          : <Site>[]
        ..sort((siteA, siteB) =>
            siteA.name.toLowerCase().compareTo(siteB.name.toLowerCase()));

      return sites;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return <Site>[];
    }
  }

  Future<List<UserNotification>> getUserNotifications() async {
    try {
      final db = await database;

      var res = await db.query(UserNotification.dbName());

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return UserNotification.fromJson(res[i]);
            })
          : <UserNotification>[]
        ..sort(
            (x, y) => DateTime.parse(x.time).compareTo(DateTime.parse(y.time)));
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return <UserNotification>[];
    }
  }

  Future<Database> initDB() async {
    return await openDatabase(
      join(await getDatabasesPath(), Config.dbName),
      version: 1,
      onCreate: (db, version) {
        createDefaultTables(db);
      },
      // onUpgrade: (db, oldVersion, newVersion){
      //   createDefaultTables(db);
      // },
    );
  }

  Future<void> insertFavPlace(PlaceDetails placeDetails) async {
    try {
      final db = await database;

      try {
        var jsonData = placeDetails.toJson();
        await db.insert(
          PlaceDetails.dbName(),
          jsonData,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> insertInsights(
      List<Insights> insights, String siteId, String frequency) async {
    try {
      final db = await database;

      if (insights.isEmpty) {
        return;
      }

      await db.delete(Insights.dbName(),
          where: 'siteId = ? and frequency = ?',
          whereArgs: [siteId, frequency]);

      for (var row in insights) {
        try {
          var jsonData = row.toJson();
          await db.insert(
            Insights.dbName(),
            jsonData,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        } catch (exception, stackTrace) {
          debugPrint(exception.toString());
          debugPrint(stackTrace.toString());
        }
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> insertKyas(List<Kya> kyas) async {
    final db = await database;

    if (kyas.isEmpty) {
      return;
    }
    await db.delete(Kya.dbName());

    for (var kya in kyas) {
      try {
        var kyaJson = kya.parseKyaToDb();
        for (var jsonBody in kyaJson) {
          await db.insert(
            Kya.dbName(),
            jsonBody,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
        await db.execute(Kya.dropTableStmt());
        await db.execute(Kya.createTableStmt());
      }
    }
  }

  Future<void> insertLatestMeasurements(List<Measurement> measurements) async {
    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        await db.delete(Measurement.measurementsDb());

        for (var measurement in measurements) {
          try {
            var jsonData = Measurement.mapToDb(measurement);
            await db.insert(
              Measurement.measurementsDb(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (exception, stackTrace) {
            debugPrint('$exception\n$stackTrace');
          }
        }
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> insertUserNotifications(
      List<UserNotification> notifications, BuildContext context) async {
    try {
      final db = await database;

      if (notifications.isEmpty) {
        return;
      }

      await db.delete(UserNotification.dbName());

      for (var notification in notifications) {
        var jsonData = notification.toJson();
        await db.insert(
          UserNotification.dbName(),
          jsonData,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
      Provider.of<NotificationModel>(context, listen: false)
          .addAll(notifications);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> removeFavPlace(PlaceDetails placeDetails) async {
    try {
      final db = await database;

      try {
        await db.delete(
          PlaceDetails.dbName(),
          where: 'placeId = ?',
          whereArgs: [placeDetails.placeId],
        );
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> setFavouritePlaces(List<PlaceDetails> placeDetails) async {
    try {
      final db = await database;

      if (placeDetails.isNotEmpty) {
        await db.delete(PlaceDetails.dbName());

        for (var place in placeDetails) {
          try {
            var jsonData = place.toJson();
            await db.insert(
              PlaceDetails.dbName(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (exception, stackTrace) {
            debugPrint('$exception\n$stackTrace');
          }
        }
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<bool> updateFavouritePlace(PlaceDetails placeDetails) async {
    final db = await database;

    var res = await db.query(PlaceDetails.dbName(),
        where: 'placeId = ?', whereArgs: [placeDetails.placeId]);

    if (res.isEmpty) {
      await insertFavPlace(placeDetails);
      return true;
    } else {
      await removeFavPlace(placeDetails);
      return false;
    }
  }

  Future<void> updateKya(Kya kya) async {
    final db = await database;

    await db.update(Kya.dbName(), {'progress': kya.progress},
        where: 'id = ?', whereArgs: [kya.id]);
  }
}

class SharedPreferencesHelper {
  SharedPreferences? _sharedPreferences;

  Future<void> clearPreferences() async {
    if (_sharedPreferences == null) {
      await initialize();
    }
    if (_sharedPreferences!.containsKey('notifications')) {
      await _sharedPreferences!.remove('notifications');
    }
    if (_sharedPreferences!.containsKey('aqShares')) {
      await _sharedPreferences!.remove('aqShares');
    }
    if (_sharedPreferences!.containsKey('location')) {
      await _sharedPreferences!.remove('location');
    }
    if (_sharedPreferences!.containsKey('alerts')) {
      await _sharedPreferences!.remove('alerts');
    }
  }

  Future<String> getOnBoardingPage() async {
    if (_sharedPreferences == null) {
      await initialize();
    }
    var page =
        _sharedPreferences!.getString(Config.prefOnBoardingPage) ?? 'welcome';

    return page;
  }

  Future<UserPreferences> getPreferences() async {
    if (_sharedPreferences == null) {
      await initialize();
    }
    var notifications = _sharedPreferences!.getBool('notifications') ?? false;
    var location = _sharedPreferences!.getBool('location') ?? false;
    var alerts = _sharedPreferences!.getBool('alerts') ?? false;
    var aqShares = _sharedPreferences!.getInt('aqShares') ?? 0;

    return UserPreferences(notifications, location, alerts, aqShares);
  }

  Future<void> initialize() async {
    _sharedPreferences = await SharedPreferences.getInstance();
  }

  Future<void> updateOnBoardingPage(String currentPage) async {
    if (_sharedPreferences == null) {
      await initialize();
    }
    await _sharedPreferences!
        .setString(Config.prefOnBoardingPage, currentPage.toLowerCase());
  }

  Future<void> updatePreference(String key, dynamic value, String type) async {
    try {
      if (_sharedPreferences == null) {
        await initialize();
      }
      if (type == 'bool') {
        await _sharedPreferences!.setBool(key, value);
      } else if (type == 'double') {
        await _sharedPreferences!.setDouble(key, value);
      } else if (type == 'int') {
        await _sharedPreferences!.setInt(key, value);
      } else {
        await _sharedPreferences!.setString(key, value);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> updatePreferences(UserPreferences userPreferences) async {
    if (_sharedPreferences == null) {
      await initialize();
    }
    await _sharedPreferences!
        .setBool('notifications', userPreferences.notifications);
    await _sharedPreferences!.setBool('location', userPreferences.location);
    await _sharedPreferences!.setBool('alerts', userPreferences.alerts);
    await _sharedPreferences!.setInt('aqShares', userPreferences.aqShares);
  }
}
