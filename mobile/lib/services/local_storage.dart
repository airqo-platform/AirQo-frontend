import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/historical_measurement.dart';
import 'package:app/models/insights_chart_data.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/models/story.dart';
import 'package:app/models/user_details.dart';
import 'package:app/utils/distance.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:path/path.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

import 'fb_notifications.dart';

class DBHelper {
  Database? _database;
  final CloudStore _cloudStore = CloudStore();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await initDB();
    await createDefaultTables(_database!);
    return _database!;
  }

  Future<void> clearFavouritePlaces() async {
    try {
      final db = await database;
      await db.delete(PlaceDetails.dbName());
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> createDefaultTables(Database db) async {
    var prefs = await SharedPreferences.getInstance();
    var initialLoading = prefs.getBool(PrefConstant.reLoadDb) ?? true;

    if (initialLoading) {
      await db.execute(Measurement.dropTableStmt());
      await db.execute(HistoricalMeasurement.dropTableStmt());
      await db.execute(Predict.dropTableStmt());
      await db.execute(Site.dropTableStmt());
      await db.execute(Story.dropTableStmt());
      await db.execute(UserDetails.dropTableStmt());
      await db.execute(PlaceDetails.dropTableStmt());
      await db.execute(UserNotification.dropTableStmt());
      await db.execute(InsightsChartData.dropTableStmt());
      await db.execute(Kya.dropTableStmt());
      await db.execute(KyaItem.dropTableStmt());
      await prefs.setBool(PrefConstant.reLoadDb, false);
    }

    await db.execute(Measurement.createTableStmt());
    await db.execute(HistoricalMeasurement.createTableStmt());
    await db.execute(Predict.createTableStmt());
    await db.execute(Site.createTableStmt());
    await db.execute(Story.createTableStmt());
    await db.execute(UserDetails.createTableStmt());
    await db.execute(PlaceDetails.createTableStmt());
    await db.execute(UserNotification.createTableStmt());
    await db.execute(InsightsChartData.createTableStmt());
    await db.execute(Kya.createTableStmt());
    await db.execute(KyaItem.createTableStmt());
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
    } catch (e) {
      debugPrint(e.toString());

      return <PlaceDetails>[];
    }
  }

  Future<List<Measurement>> getFavouritePlacesV1() async {
    try {
      final db = await database;

      var prefs = await SharedPreferences.getInstance();
      var favouritePlaces =
          prefs.getStringList(PrefConstant.favouritePlaces) ?? [];

      if (favouritePlaces.isEmpty) {
        return [];
      }

      var placesRes = <Map<String, Object?>>[];

      for (var fav in favouritePlaces) {
        var res = await db.query(Measurement.latestMeasurementsDb(),
            where: '${Site.dbId()} = ?', whereArgs: [fav]);

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
      debugPrint(e.toString());

      return <Measurement>[];
    }
  }

  Future<List<Predict>> getForecastMeasurements(String siteId) async {
    try {
      final db = await database;

      var res = await db.query(Predict.forecastDb(),
          where: '${Site.dbId()} = ?', whereArgs: [siteId]);

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Predict.fromJson(Predict.mapFromDb(res[i]));
            })
          : <Predict>[];
    } catch (e) {
      debugPrint(e.toString());
      return <Predict>[];
    }
  }

  Future<List<HistoricalMeasurement>> getHistoricalMeasurements(
      String siteId) async {
    try {
      final db = await database;

      var res = await db.query(HistoricalMeasurement.historicalMeasurementsDb(),
          where: '${Site.dbId()} = ?', whereArgs: [siteId]);

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return HistoricalMeasurement.fromJson(
                  HistoricalMeasurement.mapFromDb(res[i]));
            })
          : <HistoricalMeasurement>[];
    } catch (e) {
      debugPrint(e.toString());
      return <HistoricalMeasurement>[];
    }
  }

  Future<List<InsightsChartData>> getInsightsChartData(String name) async {
    try {
      final db = await database;

      var res = await db.query(InsightsChartData.dbName(),
          where: 'name = ?', whereArgs: [name]);

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return InsightsChartData.fromJson(res[i]);
            })
          : <InsightsChartData>[];
    } catch (e) {
      debugPrint(e.toString());
      return <InsightsChartData>[];
    }
  }

  Future<List<Kya>> getKyas() async {
    try {
      final db = await database;

      var res = await db.query(Kya.dbName());
      var kyaList = <Kya>[];

      var kyas = res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Kya.fromJson(res[i]);
            })
          : <Kya>[];

      for (var kya in kyas) {
        var kyaItemRes = await db.query(KyaItem.dbName(),
            where: 'parentId = ?', whereArgs: [kya.id]);
        if (kyaItemRes.isEmpty) {
          continue;
        }

        var kyaItems = kyaItemRes.isNotEmpty
            ? List.generate(kyaItemRes.length, (i) {
                return KyaItem.fromJson(kyaItemRes[i]);
              })
            : <KyaItem>[];

        kya.kyaItems = kyaItems;
        kyaList.add(kya);
      }
      return kyaList;
    } catch (e) {
      debugPrint(e.toString());
      return <Kya>[];
    }
  }

  Future<List<Measurement>> getLatestMeasurements() async {
    try {
      final db = await database;

      var res = await db.query(Measurement.latestMeasurementsDb());

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Measurement.fromJson(Measurement.mapFromDb(res[i]));
            })
          : <Measurement>[]
        ..sort((siteA, siteB) => siteA.site
            .getName()
            .toLowerCase()
            .compareTo(siteB.site.getName().toLowerCase()));
    } catch (e) {
      debugPrint(e.toString());
      return <Measurement>[];
    }
  }

  Future<Measurement?> getMeasurement(String siteId) async {
    try {
      final db = await database;

      var res = await db.query(Measurement.latestMeasurementsDb(),
          where: '${Site.dbId()} = ?', whereArgs: [siteId]);

      if (res.isEmpty) {
        return null;
      }
      return Measurement.fromJson(Measurement.mapFromDb(res.first));
    } catch (e) {
      debugPrint(e.toString());
      return null;
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
                if (distanceInMeters < AppConfig.maxSearchRadius.toDouble())
                  {
                    // print('$distanceInMeters : '
                    //     '${AppConfig.maxSearchRadius.toDouble()} : '
                    //     '${measurement.site.getName()}'),
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
    } catch (e) {
      debugPrint('error $e');
      return null;
    }
  }

  Future<List<Measurement>> getRegionSites(String region) async {
    try {
      final db = await database;

      var res = await db.query(Measurement.latestMeasurementsDb(),
          where: '${Site.dbRegion()} = ?', whereArgs: [region.trim()]);

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Measurement.fromJson(Measurement.mapFromDb(res[i]));
            })
          : <Measurement>[];
    } catch (e) {
      debugPrint(e.toString());
      return <Measurement>[];
    }
  }

  Future<Site?> getSite(String siteId) async {
    try {
      final db = await database;
      var res = await db.query(Site.sitesDbName(),
          where: '${Site.dbId()} = ?', whereArgs: [siteId]);

      return Site.fromJson(Site.fromDbMap(res.first));
    } catch (e) {
      debugPrint(e.toString());
      return null;
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
        ..sort((siteA, siteB) => siteA
            .getName()
            .toLowerCase()
            .compareTo(siteB.getName().toLowerCase()));

      return sites;
    } catch (e) {
      debugPrint(e.toString());
      return <Site>[];
    }
  }

  Future<List<Story>> getStories() async {
    try {
      final db = await database;

      var res = await db.query(Story.storyDbName());

      return res.isNotEmpty
          ? List.generate(res.length, (i) {
              return Story.fromJson(res[i]);
            })
          : <Story>[];
    } catch (e) {
      debugPrint(e.toString());
      return <Story>[];
    }
  }

  Future<UserDetails?> getUserData() async {
    try {
      final db = await database;
      var res = await db.query(UserDetails.dbName());

      return UserDetails.fromJson(res.first);
    } catch (e) {
      debugPrint(e.toString());
      return null;
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
    } catch (e) {
      debugPrint(e.toString());
      return <UserNotification>[];
    }
  }

  Future<Database> initDB() async {
    return await openDatabase(
      join(await getDatabasesPath(), AppConfig.dbName),
      version: 1,
      onCreate: (db, version) {
        createDefaultTables(db);
      },
      // onUpgrade: (db, oldVersion, newVersion){
      //   createDefaultTables(db);
      // },
    );
  }

  Future<void> insertFavPlace(PlaceDetails placeDetails, String id) async {
    try {
      final db = await database;

      try {
        var jsonData = placeDetails.toJson();
        await db.insert(
          PlaceDetails.dbName(),
          jsonData,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
        await _cloudStore.addFavPlace(id, placeDetails);
      } catch (e) {
        debugPrint(e.toString());
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> insertForecastMeasurements(
      List<Predict> measurements, String siteId) async {
    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        await db.delete(Predict.forecastDb(),
            where: '${Site.dbId()} = ?', whereArgs: [siteId]);

        for (var measurement in measurements) {
          try {
            var jsonData = Predict.mapToDb(measurement, siteId);
            await db.insert(
              Predict.forecastDb(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            debugPrint(e.toString());
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
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
              HistoricalMeasurement.historicalMeasurementsDb(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            debugPrint(e.toString());
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> insertInsightsChartData(
      List<InsightsChartData> insightsChartData) async {
    try {
      final db = await database;

      if (insightsChartData.isEmpty) {
        return;
      }

      var name = insightsChartData.first.name;

      await db.delete(InsightsChartData.dbName(),
          where: 'name = ?', whereArgs: [name]);

      for (var row in insightsChartData) {
        try {
          var jsonData = row.toJson();
          await db.insert(
            InsightsChartData.dbName(),
            jsonData,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        } catch (e) {
          debugPrint(e.toString());
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> insertKyas(List<Kya> Kyas) async {
    final db = await database;

    if (Kyas.isEmpty) {
      return;
    }

    for (var kya in Kyas) {
      try {
        var kyaJson = Kya.parseKyaToDb(kya);
        await db.insert(
          Kya.dbName(),
          kyaJson,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );

        var kyaItemsJson = KyaItem.parseKyaItemsToDb(kya);
        for (var kyaItemJson in kyaItemsJson) {
          await db.insert(
            KyaItem.dbName(),
            kyaItemJson,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      } catch (e) {
        debugPrint(e.toString());
      }
    }
  }

  Future<void> insertLatestMeasurements(List<Measurement> measurements) async {
    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        await db.delete(Measurement.latestMeasurementsDb());

        for (var measurement in measurements) {
          try {
            var jsonData = Measurement.mapToDb(measurement);
            await db.insert(
              Measurement.latestMeasurementsDb(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            debugPrint(e.toString());
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> insertLatestStories(List<Story> stories) async {
    try {
      final db = await database;

      if (stories.isNotEmpty) {
        // await db.delete(Story.storyDbName());

        for (var story in stories) {
          try {
            var jsonData = story.toJson();
            await db.insert(
              Story.storyDbName(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            await db.execute(Story.dropTableStmt());
            await db.execute(Story.createTableStmt());
            debugPrint(e.toString());
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> insertSiteHistoricalMeasurements(
      List<HistoricalMeasurement> measurements, String siteId) async {
    try {
      final db = await database;

      if (measurements.isNotEmpty) {
        await db.delete(HistoricalMeasurement.historicalMeasurementsDb(),
            where: '${Site.dbId()} = ?', whereArgs: [siteId]);

        for (var measurement in measurements) {
          try {
            var jsonData = HistoricalMeasurement.mapToDb(measurement);
            await db.insert(
              HistoricalMeasurement.historicalMeasurementsDb(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            debugPrint(e.toString());
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> insertSites(List<Site> sites) async {
    try {
      final db = await database;

      if (sites.isNotEmpty) {
        await db.delete(Site.sitesDbName());
        for (var site in sites) {
          try {
            var jsonData = Site.toDbMap(site);
            await db.insert(
              Site.sitesDbName(),
              jsonData,
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          } catch (e) {
            debugPrint(e.toString());
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
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
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> removeFavPlace(PlaceDetails placeDetails, String id) async {
    try {
      final db = await database;

      try {
        await db.delete(
          PlaceDetails.dbName(),
          where: 'siteId = ?',
          whereArgs: [placeDetails.siteId],
        );
        await _cloudStore.removeFavPlace(id, placeDetails);
      } catch (e) {
        debugPrint(e.toString());
      }
    } catch (e) {
      debugPrint(e.toString());
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
          } catch (e) {
            debugPrint(e.toString());
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> updateFavouritePlaces(
      PlaceDetails placeDetails, BuildContext context, String id) async {
    final db = await database;

    var res = await db.query(PlaceDetails.dbName(),
        where: 'siteId = ?', whereArgs: [placeDetails.siteId]);

    if (res.isEmpty) {
      await insertFavPlace(placeDetails, id).then((value) => {
            Provider.of<PlaceDetailsModel>(context, listen: false)
                .reloadFavouritePlaces()
          });
    } else {
      await removeFavPlace(placeDetails, id).then((value) => {
            Provider.of<PlaceDetailsModel>(context, listen: false)
                .reloadFavouritePlaces()
          });
    }
  }

  Future<bool> updateFavouritePlacesV1(String siteId, context) async {
    var prefs = await SharedPreferences.getInstance();
    var favouritePlaces =
        prefs.getStringList(PrefConstant.favouritePlaces) ?? [];

    var id = siteId.trim().toLowerCase();
    if (favouritePlaces.contains(id)) {
      var updatedList = <String>[];

      for (var fav in favouritePlaces) {
        if (id != fav.trim().toLowerCase()) {
          updatedList.add(fav.trim().toLowerCase());
        }
      }
      favouritePlaces = updatedList;
    } else {
      favouritePlaces.add(id);
    }

    await prefs.setStringList(PrefConstant.favouritePlaces, favouritePlaces);

    await Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();

    // if (favouritePlaces.contains(id)) {
    //   await showSnackBar(
    //       context, '${site.getName()} has been added to your places');
    // } else {
    //   await showSnackBar(
    //       context, '${site.getName()} has been removed from your places');
    // }

    return favouritePlaces.contains(id);
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
    if (_sharedPreferences!.containsKey('location')) {
      await _sharedPreferences!.remove('location');
    }
    if (_sharedPreferences!.containsKey('alerts')) {
      await _sharedPreferences!.remove('alerts');
    }
  }

  Future<UserPreferences> getPreferences() async {
    if (_sharedPreferences == null) {
      await initialize();
    }
    var notifications = _sharedPreferences!.getBool('notifications') ?? false;
    var location = _sharedPreferences!.getBool('location') ?? false;
    var alerts = _sharedPreferences!.getBool('alerts') ?? false;

    return UserPreferences(notifications, location, alerts);
  }

  Future<void> initialize() async {
    _sharedPreferences = await SharedPreferences.getInstance();
  }

  Future<void> updatePreference(String key, dynamic value, String type) async {
    if (_sharedPreferences == null) {
      await initialize();
    }
    if (type == 'bool') {
      await _sharedPreferences!.setBool(key, value);
    } else {
      await _sharedPreferences!.setDouble(key, value);
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
  }
}
